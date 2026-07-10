"""Unit tests for explain_criterion: AI phrasing only, never a new decision,
and a clean fallback to the deterministic `plain` text when the AI provider
is down."""

from app.ai import explain
from app.ai.openrouter_client import AIUnavailableError
from app.core.config import settings
from app.schemas.evaluation import CriterionResult


def _criterion(**overrides) -> CriterionResult:
    base = dict(
        id="x",
        category="grant",
        met=False,
        rule_text="Rule text",
        plain="Plain text",
        source="Source",
        source_url="https://example.com",
        fixable=True,
        fix_action="Do X",
    )
    base.update(overrides)
    return CriterionResult(**base)


def test_explain_uses_ai_when_available(monkeypatch):
    monkeypatch.setattr(explain, "generate", lambda prompt: "AI-written explanation.")

    result = explain.explain_criterion(_criterion())

    assert result.ai_generated is True
    assert result.explanation == "AI-written explanation."


def test_explain_falls_back_to_plain_text_when_ai_unavailable(monkeypatch):
    def raise_unavailable(prompt):
        raise AIUnavailableError("no key")

    monkeypatch.setattr(explain, "generate", raise_unavailable)

    result = explain.explain_criterion(_criterion(plain="Fallback plain text"))

    assert result.ai_generated is False
    assert result.explanation == "Fallback plain text"


def test_explain_falls_back_when_api_key_is_unset(monkeypatch):
    # Forces the unset-key condition explicitly rather than relying on
    # whatever happens to be in .env — a real key may or may not be present.
    monkeypatch.setattr(settings, "openrouter_api_key", "")

    result = explain.explain_criterion(_criterion(plain="Real fallback path"))

    assert result.ai_generated is False
    assert result.explanation == "Real fallback path"
