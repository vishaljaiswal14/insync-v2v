"""Deterministic scoring — a ratio of criteria met, per category.

Never an approval probability. category is read directly off each
CriterionResult; this module has no idea which categories a scheme uses.
"""

from app.schemas.evaluation import CriterionResult


def score_category(results: list[CriterionResult], category: str) -> float:
    matching = [r for r in results if r.category == category]
    if not matching:
        return 0.0

    met = sum(1 for r in matching if r.met)
    return round(met / len(matching), 2)
