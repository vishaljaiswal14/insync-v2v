"""Unit tests for Scheme-level validation: required fields, unique ids, operators."""

import pytest
from pydantic import ValidationError

from app.schemas.scheme import Scheme


def _valid_scheme(**overrides) -> dict:
    base = dict(
        schema_version="1.0",
        scheme_id="test_scheme",
        scheme_name="Test Scheme",
        grant_type="Test grant",
        version="1.0",
        last_verified="2026-07-09",
        official_source="Test Authority",
        source_url="https://example.com",
        source_label="Test Authority",
        criteria=[
            {
                "id": "criterion_a",
                "category": "grant",
                "rule_text": "r",
                "field": "gender",
                "operator": "equals",
                "value": "female",
                "plain": "p",
            }
        ],
    )
    base.update(overrides)
    return base


def test_valid_scheme_parses():
    scheme = Scheme.model_validate(_valid_scheme())
    assert scheme.scheme_id == "test_scheme"


def test_missing_schema_version_fails():
    data = _valid_scheme()
    del data["schema_version"]

    with pytest.raises(ValidationError):
        Scheme.model_validate(data)


def test_missing_required_criterion_field_fails():
    data = _valid_scheme()
    del data["criteria"][0]["operator"]

    with pytest.raises(ValidationError):
        Scheme.model_validate(data)


def test_unsupported_operator_fails():
    data = _valid_scheme()
    data["criteria"][0]["operator"] = "not_a_real_operator"

    with pytest.raises(ValidationError):
        Scheme.model_validate(data)


def test_duplicate_criterion_ids_fail():
    data = _valid_scheme()
    data["criteria"].append(dict(data["criteria"][0]))

    with pytest.raises(ValidationError):
        Scheme.model_validate(data)
