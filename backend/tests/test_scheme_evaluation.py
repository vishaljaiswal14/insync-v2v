"""Integration tests: evaluate_profile() end-to-end against realistic profiles."""

import json
from pathlib import Path

from app.schemas.profile import Profile
from app.services.scheme_evaluation import evaluate_profile

FIXTURES_DIR = Path(__file__).resolve().parents[2] / "data" / "sample_profiles"


def _load_profile(name: str) -> Profile:
    raw = json.loads((FIXTURES_DIR / f"{name}.json").read_text())
    return Profile.model_validate(raw)


def test_sunita_partial_is_three_quarters_grant_ready():
    profile = _load_profile("sunita_partial")
    result = evaluate_profile(profile, "mission_shakti_grant")

    assert result.grant_readiness == 0.75
    assert result.documentation_readiness == 0.0
    assert result.financial_doc_readiness == 0.0

    # 1 grant gap (SHG age) + 3 documentation gaps + 2 financial gaps
    assert len(result.roadmap) == 6
    shg_age_step = next(s for s in result.roadmap if s.eligible_on is not None)
    assert shg_age_step.eligible_on is not None


def test_fully_eligible_scores_perfect_across_the_board():
    profile = _load_profile("fully_eligible")
    result = evaluate_profile(profile, "mission_shakti_grant")

    assert result.grant_readiness == 1.0
    assert result.documentation_readiness == 1.0
    assert result.financial_doc_readiness == 1.0
    assert result.roadmap == []


def test_non_odisha_resident_is_a_blocker_with_no_roadmap_step():
    profile = _load_profile("not_odisha")
    result = evaluate_profile(profile, "mission_shakti_grant")

    odisha_result = next(c for c in result.criteria if c.id == "odisha_resident")
    assert odisha_result.met is False
    assert odisha_result.fixable is False
    assert all(step.reason != odisha_result.rule_text for step in result.roadmap)


def test_not_shg_member_generates_join_and_wait_steps():
    profile = _load_profile("not_shg_member")
    result = evaluate_profile(profile, "mission_shakti_grant")

    assert result.grant_readiness == 0.5

    # 2 grant gaps (join SHG, wait for 6 months) + 3 documentation gaps + 2 financial gaps
    assert len(result.roadmap) == 7
    grant_actions = {"shg_member", "shg_age_6m"}
    grant_steps = [c for c in result.criteria if c.id in grant_actions and not c.met]
    assert len(grant_steps) == 2


def test_missing_documents_only_affects_documentation_scores():
    profile = _load_profile("missing_documents")
    result = evaluate_profile(profile, "mission_shakti_grant")

    assert result.grant_readiness == 1.0
    assert result.documentation_readiness == 0.0
    assert result.financial_doc_readiness == 0.0
    assert len(result.roadmap) == 5
