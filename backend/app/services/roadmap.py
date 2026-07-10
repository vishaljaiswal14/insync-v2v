"""Turns unmet, fixable criteria into an ordered set of next actions.

Unmet, non-fixable criteria are real blockers but never become steps here —
there's no action to take. Nothing in this module is specific to any one
scheme or criterion id: a criterion opts into a computed ETA purely through
its own fix_eta_from / target_value data, same as the evaluator's operators.
"""

import calendar
from datetime import date

from app.schemas.evaluation import CriterionResult, RoadmapStep
from app.schemas.profile import Profile


def build_roadmap(results: list[CriterionResult], profile: Profile) -> list[RoadmapStep]:
    gaps = [r for r in results if not r.met and r.fixable]

    return [
        RoadmapStep(
            order=order,
            action=result.fix_action or result.plain,
            reason=result.rule_text,
            eligible_on=_eligible_on(result, profile),
            meanwhile=result.meanwhile,
            badge="Verified by Rule",
        )
        for order, result in enumerate(gaps, start=1)
    ]


def _eligible_on(result: CriterionResult, profile: Profile) -> str | None:
    if not result.fix_eta_from or result.target_value is None:
        return None

    current = getattr(profile, result.fix_eta_from, None)
    if current is None:
        return None

    months_needed = result.target_value - current
    if months_needed <= 0:
        return None

    return _add_months(date.today(), months_needed).isoformat()


def _add_months(start: date, months: int) -> date:
    month_index = start.month - 1 + months
    year = start.year + month_index // 12
    month = month_index % 12 + 1
    day = min(start.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)
