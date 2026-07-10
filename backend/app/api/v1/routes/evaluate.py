"""POST /evaluate — deterministic scheme evaluation. No AI in this path."""

from fastapi import APIRouter

from app.schemas.evaluation import EvaluateRequest, EvaluateResponse
from app.services.scheme_evaluation import evaluate_profile

router = APIRouter(tags=["evaluate"])


@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate(request: EvaluateRequest) -> EvaluateResponse:
    results = [evaluate_profile(request.profile, scheme_id) for scheme_id in request.scheme_ids]
    return EvaluateResponse(results=results)
