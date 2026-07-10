"""The applicant's business profile — the single input the engine evaluates."""

from pydantic import BaseModel


class Profile(BaseModel):
    gender: str
    state: str
    district: str | None = None
    business_type: str
    is_shg_member: bool
    shg_months_active: int | None = None
    category: str | None = None  # informational only (BPL/SC/ST/widow/...) — never scored
    monthly_revenue: float | None = None
    monthly_expenses: float | None = None
    documents: list[str] = []
