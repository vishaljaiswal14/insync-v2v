"""Pure rule evaluator.

Knows six generic operators and nothing else — no scheme names, no criterion
ids, no business meaning. If a scheme's rules change, only its JSON changes;
this module never does.
"""

from typing import Any, Callable

from app.schemas.evaluation import CriterionResult
from app.schemas.profile import Profile
from app.schemas.scheme import Criterion, Scheme


def _equals(actual: Any, expected: Any) -> bool:
    return actual == expected


def _greater_than(actual: Any, expected: Any) -> bool:
    return actual is not None and actual > expected


def _greater_or_equal(actual: Any, expected: Any) -> bool:
    return actual is not None and actual >= expected


def _in(actual: Any, expected: Any) -> bool:
    return actual in expected


def _contains(actual: Any, expected: Any) -> bool:
    return actual is not None and expected in actual


def _exists(actual: Any, _expected: Any) -> bool:
    return actual is not None and actual != ""


OPERATORS: dict[str, Callable[[Any, Any], bool]] = {
    "equals": _equals,
    "greater_than": _greater_than,
    "greater_or_equal": _greater_or_equal,
    "in": _in,
    "contains": _contains,
    "exists": _exists,
}


def evaluate_criterion(
    criterion: Criterion,
    profile: Profile,
    source_label: str,
    source_url: str,
) -> CriterionResult:
    actual = getattr(profile, criterion.field, None)
    is_met = OPERATORS[criterion.operator](actual, criterion.value)

    return CriterionResult(
        id=criterion.id,
        category=criterion.category,
        met=is_met,
        rule_text=criterion.rule_text,
        plain=criterion.plain,
        source=source_label,
        source_url=source_url,
        fixable=criterion.fixable,
        fix_action=criterion.fix_action,
        fix_eta_from=criterion.fix_eta_from,
        target_value=criterion.value,
        meanwhile=criterion.meanwhile,
    )


def evaluate_scheme(scheme: Scheme, profile: Profile) -> list[CriterionResult]:
    return [
        evaluate_criterion(criterion, profile, scheme.source_label, scheme.source_url)
        for criterion in scheme.criteria
    ]
