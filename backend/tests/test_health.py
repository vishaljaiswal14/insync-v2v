"""Verifies the app boots and the health endpoint responds."""

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def test_health_ok():
    response = client.get(f"{settings.api_v1_prefix}/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root_ok():
    response = client.get("/")

    assert response.status_code == 200
