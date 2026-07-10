"""Verifies scheme JSON loads into a valid, typed Scheme, and unknown schemes 404 cleanly."""

import pytest

from app.services.rule_loader import SchemeNotFoundError, list_scheme_ids, load_scheme, validate_all_schemes

ALLOWED_OPERATORS = {"equals", "greater_than", "greater_or_equal", "in", "contains", "exists"}


def test_mission_shakti_grant_loads():
    scheme = load_scheme("mission_shakti_grant")

    assert scheme.scheme_id == "mission_shakti_grant"
    assert scheme.source_url.startswith("https://")
    assert scheme.schema_version == "1.0"
    assert len(scheme.criteria) > 0


def test_criteria_use_only_allowed_operators():
    scheme = load_scheme("mission_shakti_grant")

    for criterion in scheme.criteria:
        assert criterion.operator in ALLOWED_OPERATORS


def test_list_scheme_ids_includes_mission_shakti():
    assert "mission_shakti_grant" in list_scheme_ids()


def test_load_scheme_raises_for_unknown_id():
    with pytest.raises(SchemeNotFoundError):
        load_scheme("does_not_exist")


def test_validate_all_schemes_loads_every_scheme():
    schemes = validate_all_schemes()

    assert any(s.scheme_id == "mission_shakti_grant" for s in schemes)
