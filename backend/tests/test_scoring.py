"""Unit tests for category-based scoring — plain ratios, nothing else."""

from app.schemas.evaluation import CriterionResult
from app.services.scoring import score_category


def _result(category: str, met: bool) -> CriterionResult:
    return CriterionResult(
        id="x",
        category=category,
        met=met,
        rule_text="r",
        plain="p",
        source="s",
        source_url="https://example.com",
        fixable=False,
    )


def test_all_met_scores_one():
    results = [_result("grant", True), _result("grant", True)]
    assert score_category(results, "grant") == 1.0


def test_half_met_scores_half():
    results = [_result("grant", True), _result("grant", False)]
    assert score_category(results, "grant") == 0.5


def test_no_matching_category_scores_zero():
    results = [_result("grant", True)]
    assert score_category(results, "documentation") == 0.0


def test_ignores_other_categories():
    results = [_result("grant", True), _result("documentation", False)]
    assert score_category(results, "grant") == 1.0
