"""POST /explain — AI-phrased explanation of an already-evaluated criterion.

Never decides met/unmet; that's already been decided by /evaluate. Always
returns 200 — AI provider failures degrade to the criterion's own
deterministic `plain` text rather than erroring.
"""

from fastapi import APIRouter

from app.ai.explain import explain_criterion
from app.schemas.ai import ExplainRequest, ExplainResponse

router = APIRouter(tags=["ai"])


@router.post("/explain", response_model=ExplainResponse)
def explain(request: ExplainRequest) -> ExplainResponse:
    return explain_criterion(request.criterion, request.language)
