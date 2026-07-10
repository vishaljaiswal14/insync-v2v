"""API-level tests for /explain and /proposal — both must degrade
gracefully without a configured OPENROUTER_API_KEY. The unset-key condition
is forced via monkeypatch rather than assumed from the ambient environment,
since a real key may or may not be present in .env."""

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.schemas.profile import Profile
from app.services.scheme_evaluation import evaluate_profile

client = TestClient(app)


def _sunita_profile() -> dict:
    return {
        "gender": "female",
        "state": "Odisha",
        "district": "Koraput",
        "business_type": "tailoring",
        "is_shg_member": True,
        "shg_months_active": 4,
        "category": "general",
        "documents": [],
    }


def test_explain_falls_back_without_api_key(monkeypatch):
    monkeypatch.setattr(settings, "openrouter_api_key", "")
    result = evaluate_profile(Profile(**_sunita_profile()), "mission_shakti_grant")
    criterion = next(c for c in result.criteria if not c.met)

    response = client.post(
        f"{settings.api_v1_prefix}/explain",
        json={"criterion": criterion.model_dump()},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["ai_generated"] is False
    assert body["explanation"] == criterion.plain


def test_explain_rejects_unsupported_language():
    result = evaluate_profile(Profile(**_sunita_profile()), "mission_shakti_grant")
    criterion = result.criteria[0]

    response = client.post(
        f"{settings.api_v1_prefix}/explain",
        json={"criterion": criterion.model_dump(), "language": "fr"},
    )

    assert response.status_code == 422


def test_proposal_falls_back_without_api_key(monkeypatch):
    monkeypatch.setattr(settings, "openrouter_api_key", "")
    profile = _sunita_profile()
    result = evaluate_profile(Profile(**profile), "mission_shakti_grant")

    response = client.post(
        f"{settings.api_v1_prefix}/proposal",
        json={"profile": profile, "result": result.model_dump(), "verified": True},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["ai_generated"] is False
    assert len(body["sections"]) == 4
    assert len(body["citations"]) > 0


def test_proposal_rejects_unverified_data():
    profile = _sunita_profile()
    result = evaluate_profile(Profile(**profile), "mission_shakti_grant")

    response = client.post(
        f"{settings.api_v1_prefix}/proposal",
        json={"profile": profile, "result": result.model_dump(), "verified": False},
    )

    assert response.status_code == 400
