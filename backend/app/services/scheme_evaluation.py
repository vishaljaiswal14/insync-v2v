"""Ties the loader, evaluator, scoring, and roadmap together for one scheme.

This is the only place that assembles a full SchemeResult. Everything it
calls is pure except the loader, which is the sole point of file I/O.
"""

import logging
import time

from app.schemas.evaluation import SchemeResult
from app.schemas.profile import Profile
from app.services.evaluator import evaluate_scheme
from app.services.roadmap import build_roadmap
from app.services.rule_loader import load_scheme
from app.services.scoring import score_category

logger = logging.getLogger(__name__)


def evaluate_profile(profile: Profile, scheme_id: str) -> SchemeResult:
    started = time.perf_counter()
    logger.info("Evaluation started: scheme=%s", scheme_id)

    scheme = load_scheme(scheme_id)
    results = evaluate_scheme(scheme, profile)

    result = SchemeResult(
        scheme_id=scheme.scheme_id,
        scheme_name=scheme.scheme_name,
        grant_readiness=score_category(results, "grant"),
        documentation_readiness=score_category(results, "documentation"),
        financial_doc_readiness=score_category(results, "financial_documentation"),
        criteria=results,
        roadmap=build_roadmap(results, profile),
    )

    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info(
        "Evaluation completed: scheme=%s grant_readiness=%.2f took=%.1fms",
        scheme_id, result.grant_readiness, elapsed_ms,
    )
    return result
