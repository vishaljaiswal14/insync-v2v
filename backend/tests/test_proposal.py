"""Unit tests for generate_proposal: AI phrasing from verified facts only,
a deterministic fallback that always succeeds, and citations that never
depend on the model even when the model succeeds."""

import json

from app.ai import proposal as proposal_module
from app.core.config import settings
from app.schemas.profile import Profile
from app.services.scheme_evaluation import evaluate_profile

VALID_SECTIONS = [
    {"title": "Executive Summary", "content": "AI summary."},
    {"title": "Applicant Snapshot", "content": "AI snapshot."},
    {"title": "Eligibility Summary", "content": "AI eligibility."},
    {"title": "Next Steps", "content": "AI next steps."},
]


def _sunita() -> Profile:
    return Profile(
        gender="female",
        state="Odisha",
        district="Koraput",
        business_type="tailoring",
        is_shg_member=True,
        shg_months_active=4,
        category="general",
        documents=[],
    )


def test_proposal_uses_ai_when_available(monkeypatch):
    monkeypatch.setattr(proposal_module, "generate", lambda prompt: json.dumps({"sections": VALID_SECTIONS}))
    result = evaluate_profile(_sunita(), "mission_shakti_grant")

    response = proposal_module.generate_proposal(_sunita(), result)

    assert response.ai_generated is True
    assert len(response.sections) == 4
    assert response.sections[0].content == "AI summary."
    assert len(response.citations) > 0


def test_proposal_falls_back_when_ai_returns_malformed_json(monkeypatch):
    monkeypatch.setattr(proposal_module, "generate", lambda prompt: "not valid json at all")
    result = evaluate_profile(_sunita(), "mission_shakti_grant")

    response = proposal_module.generate_proposal(_sunita(), result)

    assert response.ai_generated is False
    assert len(response.sections) == 4  # same shape either way


def test_proposal_strips_markdown_fences_around_json(monkeypatch):
    fenced = "```json\n" + json.dumps({"sections": VALID_SECTIONS}) + "\n```"
    monkeypatch.setattr(proposal_module, "generate", lambda prompt: fenced)
    result = evaluate_profile(_sunita(), "mission_shakti_grant")

    response = proposal_module.generate_proposal(_sunita(), result)

    assert response.ai_generated is True
    assert response.sections[0].content == "AI summary."


def test_proposal_falls_back_when_api_key_is_unset(monkeypatch):
    # Forces the unset-key condition explicitly rather than relying on
    # whatever happens to be in .env — a real key may or may not be present.
    monkeypatch.setattr(settings, "openrouter_api_key", "")
    result = evaluate_profile(_sunita(), "mission_shakti_grant")

    response = proposal_module.generate_proposal(_sunita(), result)

    assert response.ai_generated is False
    assert len(response.sections) == 4
    assert len(response.citations) > 0


def test_proposal_citations_always_come_from_deterministic_result(monkeypatch):
    monkeypatch.setattr(proposal_module, "generate", lambda prompt: json.dumps({"sections": VALID_SECTIONS}))
    result = evaluate_profile(_sunita(), "mission_shakti_grant")

    response = proposal_module.generate_proposal(_sunita(), result)

    expected_urls = {c.source_url for c in result.criteria}
    assert {c.url for c in response.citations} == expected_urls
