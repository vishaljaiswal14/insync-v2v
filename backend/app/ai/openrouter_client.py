"""The only module allowed to call the OpenRouter API.

Isolating the HTTP call here means every caller in app/ai has exactly one
failure mode to handle: AIUnavailableError. Missing key, bad key, network
error, timeout, malformed response — all of it collapses to this one
exception, so explain.py and proposal.py never need to know why the call
failed, only that it did, and that a deterministic fallback exists for
exactly this reason.
"""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


class AIUnavailableError(Exception):
    pass


def generate(prompt: str) -> str:
    if not settings.openrouter_api_key:
        raise AIUnavailableError("OPENROUTER_API_KEY is not configured")

    try:
        response = httpx.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "X-Title": settings.app_name,
            },
            json={
                "model": settings.openrouter_model,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=settings.openrouter_timeout_seconds,
        )
        response.raise_for_status()
        text = response.json()["choices"][0]["message"]["content"]
        if not text:
            raise AIUnavailableError("OpenRouter returned an empty response")
        return text
    except AIUnavailableError:
        raise
    except Exception as exc:  # HTTP errors, timeouts, malformed payloads — all degrade the same way
        logger.warning("OpenRouter call failed: %s", exc)
        raise AIUnavailableError(str(exc)) from exc
