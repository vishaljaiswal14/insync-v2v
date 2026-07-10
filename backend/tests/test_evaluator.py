"""Unit tests for the pure rule evaluator — every operator, no scheme knowledge."""

from app.schemas.profile import Profile
from app.schemas.scheme import Criterion
from app.services.evaluator import evaluate_criterion


def _profile(**overrides) -> Profile:
    base = dict(
        gender="female",
        state="Odisha",
        business_type="tailoring",
        is_shg_member=True,
        shg_months_active=8,
        documents=[],
    )
    base.update(overrides)
    return Profile(**base)


def _criterion(**overrides) -> Criterion:
    base = dict(
        id="test_criterion",
        category="grant",
        rule_text="Test rule",
        field="gender",
        operator="equals",
        value="female",
        plain="Test plain text",
        fixable=False,
    )
    base.update(overrides)
    return Criterion(**base)


def _evaluate(criterion: Criterion, profile: Profile):
    return evaluate_criterion(criterion, profile, "src", "https://example.com")


def test_equals_met():
    assert _evaluate(_criterion(), _profile()).met is True


def test_equals_unmet():
    assert _evaluate(_criterion(value="male"), _profile()).met is False


def test_greater_or_equal_met():
    criterion = _criterion(field="shg_months_active", operator="greater_or_equal", value=6)
    assert _evaluate(criterion, _profile(shg_months_active=8)).met is True


def test_greater_or_equal_unmet():
    criterion = _criterion(field="shg_months_active", operator="greater_or_equal", value=6)
    assert _evaluate(criterion, _profile(shg_months_active=4)).met is False


def test_greater_or_equal_none_is_unmet_not_a_crash():
    criterion = _criterion(field="shg_months_active", operator="greater_or_equal", value=6)
    assert _evaluate(criterion, _profile(shg_months_active=None)).met is False


def test_greater_than_met():
    criterion = _criterion(field="monthly_revenue", operator="greater_than", value=1000)
    assert _evaluate(criterion, _profile(monthly_revenue=2000)).met is True


def test_contains_met():
    criterion = _criterion(field="documents", operator="contains", value="aadhaar")
    assert _evaluate(criterion, _profile(documents=["aadhaar"])).met is True


def test_contains_unmet_on_empty_list():
    criterion = _criterion(field="documents", operator="contains", value="aadhaar")
    assert _evaluate(criterion, _profile(documents=[])).met is False


def test_exists_met():
    criterion = _criterion(field="monthly_revenue", operator="exists", value=None)
    assert _evaluate(criterion, _profile(monthly_revenue=5000)).met is True


def test_exists_met_when_value_is_zero():
    # 0 is a real, provided value — must not be treated as missing.
    criterion = _criterion(field="monthly_revenue", operator="exists", value=None)
    assert _evaluate(criterion, _profile(monthly_revenue=0)).met is True


def test_exists_unmet_when_none():
    criterion = _criterion(field="monthly_revenue", operator="exists", value=None)
    assert _evaluate(criterion, _profile(monthly_revenue=None)).met is False


def test_in_met():
    criterion = _criterion(field="state", operator="in", value=["Odisha", "Bihar"])
    assert _evaluate(criterion, _profile(state="Odisha")).met is True


def test_in_unmet():
    criterion = _criterion(field="state", operator="in", value=["Odisha", "Bihar"])
    assert _evaluate(criterion, _profile(state="Kerala")).met is False


def test_result_carries_source_and_fix_metadata():
    criterion = _criterion(
        fixable=True, fix_action="Do the thing", fix_eta_from="shg_months_active", meanwhile="Wait well"
    )
    result = _evaluate(criterion, _profile())

    assert result.source == "src"
    assert result.source_url == "https://example.com"
    assert result.fix_action == "Do the thing"
    assert result.fix_eta_from == "shg_months_active"
    assert result.meanwhile == "Wait well"
