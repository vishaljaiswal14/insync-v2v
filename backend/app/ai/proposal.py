"""Drafts a proposal from verified facts only.

AI never decides eligibility here — it only phrases what the deterministic
engine already computed. Citations always come from result.criteria, never
from the model's own output, even on the AI-success path: a model asked to
list sources could hallucinate one, but it's never asked to. If the AI
provider is unavailable or returns something that doesn't parse, a
deterministic template — same shape, same citations — takes over. The
frontend never has to know which path ran; only `ai_generated` differs.
"""

import json
import logging
import re

from pydantic import ValidationError

from app.ai.openrouter_client import AIUnavailableError, generate
from app.ai.prompts import build_proposal_prompt
from app.schemas.ai import ProposalResponse, ProposalSectionContent, SourceCitation
from app.schemas.evaluation import SchemeResult
from app.schemas.profile import Profile
from app.services.rule_loader import load_scheme

logger = logging.getLogger(__name__)


def generate_proposal(profile: Profile, result: SchemeResult, language: str = "en") -> ProposalResponse:
    scheme = load_scheme(result.scheme_id)
    citations = _citations(result)

    try:
        prompt = build_proposal_prompt(profile, result, scheme, language)
        raw = generate(prompt)
        payload = json.loads(_extract_json(raw))
        sections = [ProposalSectionContent(**section) for section in payload["sections"]]

        logger.info("Proposal generated via AI: scheme=%s", result.scheme_id)
        return ProposalResponse(
            scheme_id=result.scheme_id,
            scheme_name=result.scheme_name,
            ai_generated=True,
            sections=sections,
            citations=citations,
        )
    except (AIUnavailableError, ValueError, KeyError, TypeError, ValidationError) as exc:
        logger.info("Proposal falling back to deterministic template: %s", exc)
        return ProposalResponse(
            scheme_id=result.scheme_id,
            scheme_name=result.scheme_name,
            ai_generated=False,
            sections=_fallback_sections(profile, result),
            citations=citations,
        )


def _fallback_sections(profile: Profile, result: SchemeResult) -> list[ProposalSectionContent]:
    met = [c for c in result.criteria if c.met]
    district = f"{profile.district}, " if profile.district else ""

    return [
        ProposalSectionContent(
            title="Executive Summary",
            content=(
                f"{profile.business_type.title()} business in {district}{profile.state}. "
                f"{result.grant_readiness:.0%} of grant criteria verified as met for {result.scheme_name}."
            ),
        ),
        ProposalSectionContent(
            title="Applicant Snapshot",
            content=(
                f"Self-Help Group member: {'Yes' if profile.is_shg_member else 'No'}. "
                f"Documentation readiness: {result.documentation_readiness:.0%}. "
                f"Financial documentation readiness: {result.financial_doc_readiness:.0%}."
            ),
        ),
        ProposalSectionContent(
            title="Eligibility Summary",
            content="; ".join(f"Met: {c.rule_text}" for c in met) or "No criteria met yet.",
        ),
        ProposalSectionContent(
            title="Next Steps",
            content="; ".join(step.action for step in result.roadmap) or "No further steps required.",
        ),
    ]


def _citations(result: SchemeResult) -> list[SourceCitation]:
    seen = {(c.source, c.source_url) for c in result.criteria}
    return [SourceCitation(label=label, url=url) for label, url in sorted(seen)]


def _extract_json(text: str) -> str:
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in AI response")
    return text[start : end + 1]
