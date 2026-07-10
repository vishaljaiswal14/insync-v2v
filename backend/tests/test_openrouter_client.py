"""Unit tests for the OpenRouter client's failure mode — the one thing every
AI-edge caller depends on: missing config never raises anything other than
AIUnavailableError, and never attempts a network call to get there."""

import pytest

from app.ai import openrouter_client
from app.core.config import settings


def test_missing_api_key_raises_ai_unavailable(monkeypatch):
    monkeypatch.setattr(settings, "openrouter_api_key", "")

    with pytest.raises(openrouter_client.AIUnavailableError):
        openrouter_client.generate("test prompt")


def test_http_error_degrades_to_ai_unavailable(monkeypatch):
    monkeypatch.setattr(settings, "openrouter_api_key", "fake-key-for-test")

    def raise_network_error(*args, **kwargs):
        raise ConnectionError("network unreachable")

    monkeypatch.setattr(openrouter_client.httpx, "post", raise_network_error)

    with pytest.raises(openrouter_client.AIUnavailableError):
        openrouter_client.generate("test prompt")
