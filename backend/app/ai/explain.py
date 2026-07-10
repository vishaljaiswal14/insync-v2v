"""Explains one already-evaluated criterion in plain language.

AI never decides met/unmet here — that's already decided, by /evaluate,
before this is ever called. It only rephrases what's already true. If the
AI provider is unavailable, the criterion's own deterministic `plain` text
is returned unchanged — the explanation degrades, the fact never does.
"""

import logging

from app.ai.openrouter_client import AIUnavailableError, generate
from app.ai.prompts import build_explain_prompt
from app.schemas.ai import ExplainResponse
from app.schemas.evaluation import CriterionResult

logger = logging.getLogger(__name__)


def explain_criterion(criterion: CriterionResult, language: str = "en") -> ExplainResponse:
    try:
        prompt = build_explain_prompt(criterion, language)
        text = generate(prompt)
        return ExplainResponse(
            explanation=text.strip(),
            ai_generated=True,
            source=criterion.source,
            source_url=criterion.source_url,
        )
    except AIUnavailableError as exc:
        logger.info("Explain falling back to deterministic plain text: %s", exc)
        return ExplainResponse(
            explanation=criterion.plain,
            ai_generated=False,
            source=criterion.source,
            source_url=criterion.source_url,
        )
