"""API-level smoke tests for the deterministic /evaluate and /schemes endpoints."""

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

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


def test_evaluate_returns_scheme_result():
    response = client.post(
        f"{settings.api_v1_prefix}/evaluate",
        json={"profile": _sunita_profile(), "scheme_ids": ["mission_shakti_grant"]},
    )

    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["scheme_id"] == "mission_shakti_grant"
    assert result["grant_readiness"] == 0.75


def test_evaluate_rejects_invalid_profile():
    response = client.post(
        f"{settings.api_v1_prefix}/evaluate",
        json={"profile": {"gender": "female"}, "scheme_ids": ["mission_shakti_grant"]},
    )

    assert response.status_code == 422


def test_evaluate_unknown_scheme_returns_404_not_500():
    response = client.post(
        f"{settings.api_v1_prefix}/evaluate",
        json={"profile": _sunita_profile(), "scheme_ids": ["does_not_exist"]},
    )

    assert response.status_code == 404
    assert "does_not_exist" in response.json()["detail"]


def test_schemes_lists_mission_shakti():
    response = client.get(f"{settings.api_v1_prefix}/schemes")

    assert response.status_code == 200
    scheme_ids = [s["scheme_id"] for s in response.json()]
    assert "mission_shakti_grant" in scheme_ids
    assert response.json()[0]["version"] == "1.0"
