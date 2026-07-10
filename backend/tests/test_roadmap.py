"""Unit tests for roadmap generation — only unmet + fixable criteria become steps."""

from datetime import date

from app.schemas.evaluation import CriterionResult
from app.schemas.profile import Profile
from app.services.roadmap import _add_months, build_roadmap


def _profile(**overrides) -> Profile:
    base = dict(gender="female", state="Odisha", business_type="tailoring", is_shg_member=True)
    base.update(overrides)
    return Profile(**base)


def _result(**overrides) -> CriterionResult:
    base = dict(
        id="x",
        category="grant",
        met=False,
        rule_text="r",
        plain="p",
        source="s",
        source_url="https://example.com",
        fixable=True,
    )
    base.update(overrides)
    return CriterionResult(**base)


def test_met_criteria_produce_no_steps():
    assert build_roadmap([_result(met=True)], _profile()) == []


def test_unmet_non_fixable_produces_no_steps():
    assert build_roadmap([_result(met=False, fixable=False)], _profile()) == []


def test_unmet_fixable_produces_a_step():
    results = [_result(met=False, fixable=True, fix_action="Do the thing")]
    roadmap = build_roadmap(results, _profile())

    assert len(roadmap) == 1
    assert roadmap[0].action == "Do the thing"
    assert roadmap[0].order == 1


def test_falls_back_to_plain_text_when_no_fix_action():
    results = [_result(met=False, fixable=True, fix_action=None, plain="Plain explanation")]
    roadmap = build_roadmap(results, _profile())

    assert roadmap[0].action == "Plain explanation"


def test_steps_are_ordered():
    results = [
        _result(id="a", met=False, fixable=True, fix_action="First"),
        _result(id="b", met=False, fixable=True, fix_action="Second"),
    ]
    roadmap = build_roadmap(results, _profile())

    assert [s.order for s in roadmap] == [1, 2]
    assert [s.action for s in roadmap] == ["First", "Second"]


def test_eligible_on_computed_from_fix_eta_from():
    results = [
        _result(fix_eta_from="shg_months_active", target_value=6, fix_action="Wait"),
    ]
    roadmap = build_roadmap(results, _profile(shg_months_active=4))

    expected = _add_months(date.today(), 2).isoformat()
    assert roadmap[0].eligible_on == expected


def test_eligible_on_none_when_already_reached():
    results = [_result(fix_eta_from="shg_months_active", target_value=6, fix_action="x")]
    roadmap = build_roadmap(results, _profile(shg_months_active=6))

    assert roadmap[0].eligible_on is None


def test_eligible_on_none_when_profile_field_missing():
    results = [_result(fix_eta_from="shg_months_active", target_value=6, fix_action="x")]
    roadmap = build_roadmap(results, _profile(shg_months_active=None))

    assert roadmap[0].eligible_on is None


def test_eligible_on_none_when_criterion_has_no_eta_mechanism():
    results = [_result(fix_eta_from=None, target_value=None, fix_action="Join an SHG")]
    roadmap = build_roadmap(results, _profile())

    assert roadmap[0].eligible_on is None


def test_add_months_rolls_over_year():
    assert _add_months(date(2026, 11, 15), 3) == date(2027, 2, 15)


def test_add_months_clamps_short_month():
    assert _add_months(date(2026, 1, 31), 1) == date(2026, 2, 28)
