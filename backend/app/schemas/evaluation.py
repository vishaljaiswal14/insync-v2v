"""Result shapes produced by the engine, and the /evaluate request/response."""

from typing import Any

from pydantic import BaseModel

from app.schemas.profile import Profile


class CriterionResult(BaseModel):
    id: str
    category: str
    met: bool
    rule_text: str
    plain: str
    source: str
    source_url: str
    fixable: bool
    fix_action: str | None = None
    fix_eta_from: str | None = None
    target_value: Any | None = None
    meanwhile: str | None = None


class RoadmapStep(BaseModel):
    order: int
    action: str
    reason: str
    eligible_on: str | None = None
    meanwhile: str | None = None
    badge: str | None = None
    done: bool = False


class SchemeResult(BaseModel):
    scheme_id: str
    scheme_name: str
    grant_readiness: float
    documentation_readiness: float
    financial_doc_readiness: float
    criteria: list[CriterionResult]
    roadmap: list[RoadmapStep]


class EvaluateRequest(BaseModel):
    profile: Profile
    scheme_ids: list[str]


class EvaluateResponse(BaseModel):
    results: list[SchemeResult]
