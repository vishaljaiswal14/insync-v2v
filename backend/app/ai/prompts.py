"""Prompt templates for the AI edge.

Every prompt is built entirely from data the deterministic engine already
verified. Nothing here asks the model to decide anything — only to phrase
what's already true. `language` is threaded through now so multilingual
output later is a template change, not a redesign.
"""

from app.core.constants import SUPPORTED_LANGUAGES
from app.schemas.evaluation import CriterionResult, SchemeResult
from app.schemas.profile import Profile
from app.schemas.scheme import Scheme


def build_explain_prompt(criterion: CriterionResult, language: str) -> str:
    language_name = SUPPORTED_LANGUAGES[language]
    status = "MET (satisfied)" if criterion.met else "NOT YET MET (outstanding)"
    fix_line = (
        f"\n- Action required to resolve it: {criterion.fix_action}"
        if not criterion.met and criterion.fix_action
        else ""
    )
    meanwhile_line = (
        f"\n- Action to take while waiting: {criterion.meanwhile}"
        if not criterion.met and criterion.meanwhile
        else ""
    )
    category_desc = {
        "grant": "Core Scheme/Grant Eligibility Rules",
        "documentation": "Applicant Identity & Group Verification Documents",
        "financial_documentation": "Business Financial Disclosures & Estimates"
    }.get(criterion.category, criterion.category)

    return f"""You are explaining an already-decided eligibility check result for a government scheme.
You must explain the result clearly, objectively, and warmly in {language_name}.
The explanation must be purely explanatory: never speculate, never predict approval, never promise funding.
Do not invent any new facts, rules, IDs, dates, or numerical targets. Use only the provided facts.

Here is the deterministic verification record:
- Checked Rule: "{criterion.rule_text}"
- Rule ID: "{criterion.id}"
- Scheme Source: "{criterion.source}"
- Rule Category: "{category_desc}"
- Current Status: {status}
- Plain English Result: "{criterion.plain}"{fix_line}{meanwhile_line}

Your explanation must concisely address:
1. Why this check exists (why it was checked).
2. The current outcome (why it passed or failed).
3. The next steps the applicant must take (if unmet and fixable).
4. Any relevant effort/timeframe involved (e.g., if there is a waiting period or if it can be resolved immediately).
5. What becomes unlocked or progressed once this is solved (e.g. progressing documentation/financial readiness).
6. State the official citation or basis for this rule.

Write a single, cohesive, highly professional paragraph (3-4 sentences max) that integrates all these points. Remain explanatory only. Do not speculate on final approval."""


def build_proposal_prompt(profile: Profile, result: SchemeResult, scheme: Scheme, language: str) -> str:
    language_name = SUPPORTED_LANGUAGES[language]
    met = [c for c in result.criteria if c.met]
    remaining = [c for c in result.criteria if not c.met and c.fixable]
    blockers = [c for c in result.criteria if not c.met and not c.fixable]

    met_lines = "\n".join(f"- {c.rule_text}" for c in met) or "None yet."
    remaining_lines = "\n".join(f"- {c.rule_text} (fix: {c.fix_action})" for c in remaining) or "None."
    blocker_lines = "\n".join(f"- {c.rule_text}" for c in blockers) or "None."
    roadmap_lines = "\n".join(f"- {step.action}" for step in result.roadmap) or "None — every fixable gap is closed."
    district = f"{profile.district}, " if profile.district else ""

    return f"""Draft a short, formal grant-readiness proposal summary in {language_name}, using ONLY the verified facts below.
Do not invent numbers, dates, eligibility outcomes, or scheme rules beyond what is given.
Where you reference a rule, use the exact rule text given — do not paraphrase it into a new claim.
State plainly that this reflects the applicant's verified information, not a funding decision or approval.

Respond with ONLY valid JSON in this exact shape, no markdown fences, no commentary:
{{"sections": [{{"title": "Executive Summary", "content": "..."}}, {{"title": "Applicant Snapshot", "content": "..."}}, {{"title": "Eligibility Summary", "content": "..."}}, {{"title": "Next Steps", "content": "..."}}]}}

Verified data:
Scheme: {result.scheme_name} ({scheme.official_source}, verified {scheme.last_verified})
Business type: {profile.business_type}
Location: {district}{profile.state}
Self-Help Group member: {profile.is_shg_member}
Grant readiness: {result.grant_readiness:.0%}
Documentation readiness: {result.documentation_readiness:.0%}
Financial documentation readiness: {result.financial_doc_readiness:.0%}

Criteria met:
{met_lines}

Criteria remaining (fixable):
{remaining_lines}

Structural notes (cannot be changed by action):
{blocker_lines}

Roadmap next steps:
{roadmap_lines}"""
