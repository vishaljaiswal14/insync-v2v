"""Request/response shapes for the AI edge endpoints (/explain, /proposal).

Every request here carries data the deterministic engine already produced —
these endpoints never compute eligibility, they only phrase it. The client
sends the exact CriterionResult/SchemeResult it already got from /evaluate,
since this app has no server-side session to look anything up from.
"""

from typing import Annotated

from pydantic import AfterValidator, BaseModel

from app.core.constants import SUPPORTED_LANGUAGES
from app.schemas.evaluation import CriterionResult, SchemeResult
from app.schemas.profile import Profile


def _check_supported_language(value: str) -> str:
    if value not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language: '{value}'. Supported: {list(SUPPORTED_LANGUAGES)}")
    return value


Language = Annotated[str, AfterValidator(_check_supported_language)]


class ExplainRequest(BaseModel):
    criterion: CriterionResult
    language: Language = "en"


class ExplainResponse(BaseModel):
    explanation: str
    ai_generated: bool
    source: str
    source_url: str


class ProposalRequest(BaseModel):
    profile: Profile
    result: SchemeResult
    verified: bool = True
    language: Language = "en"


class ProposalSectionContent(BaseModel):
    title: str
    content: str


class SourceCitation(BaseModel):
    label: str
    url: str


class ProposalResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    ai_generated: bool
    sections: list[ProposalSectionContent]
    citations: list[SourceCitation]
