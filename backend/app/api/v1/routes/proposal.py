"""POST /proposal — drafts a proposal from verified facts only.

Rejects with 400 if the caller hasn't verified their data (forward-looking
guard for when /extract exists — today every profile reaching this endpoint
is already self-entered or engine-verified, so this is inert but correct).
AI provider failures degrade to a deterministic template; this endpoint
never 500s because the AI provider is down.
"""

from fastapi import APIRouter, HTTPException

from app.ai.proposal import generate_proposal
from app.schemas.ai import ProposalRequest, ProposalResponse

router = APIRouter(tags=["ai"])


@router.post("/proposal", response_model=ProposalResponse)
def proposal(request: ProposalRequest) -> ProposalResponse:
    if not request.verified:
        raise HTTPException(status_code=400, detail="Profile data must be verified before generating a proposal")
    return generate_proposal(request.profile, request.result, request.language)
