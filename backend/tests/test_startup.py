"""Verifies the app boots cleanly, running startup schema validation."""

from fastapi.testclient import TestClient

from app.main import app


def test_app_starts_and_validates_schemes_without_error():
    with TestClient(app):
        pass
