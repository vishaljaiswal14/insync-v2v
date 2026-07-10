"""Typed shape of a scheme's rule config, loaded from JSON.

A scheme is entirely data. Adding or changing eligibility rules means editing
a JSON file under data/schemes/ — nothing here or in the engine changes.

Validation happens once, at parse time: required fields are enforced by the
model itself, operators are restricted to the Literal below, and criterion
ids are checked for uniqueness. A malformed scheme fails here, not mid-request.
"""

from typing import Any, Literal

from pydantic import BaseModel, model_validator

Operator = Literal["equals", "greater_than", "greater_or_equal", "in", "contains", "exists"]


class Criterion(BaseModel):
    id: str
    category: str
    rule_text: str
    field: str
    operator: Operator
    value: Any
    plain: str
    fixable: bool = False
    fix_action: str | None = None
    fix_eta_from: str | None = None  # profile field to compute an ETA date from, if applicable
    meanwhile: str | None = None  # suggestion shown while waiting on this criterion


class Scheme(BaseModel):
    schema_version: str  # version of this JSON's shape/contract
    scheme_id: str
    scheme_name: str
    grant_type: str
    version: str  # version of this scheme's own rule set
    last_verified: str
    official_source: str
    source_url: str
    source_label: str
    criteria: list[Criterion]

    @model_validator(mode="after")
    def check_unique_criterion_ids(self) -> "Scheme":
        ids = [c.id for c in self.criteria]
        duplicates = {i for i in ids if ids.count(i) > 1}
        if duplicates:
            raise ValueError(
                f"Duplicate criterion ids in scheme '{self.scheme_id}': {sorted(duplicates)}"
            )
        return self
