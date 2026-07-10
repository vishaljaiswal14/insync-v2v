import { statusForCriterion, type RuleStatus } from "./status";
import type { CriterionResult, Profile, RoadmapStep } from "./types";

// The Decision Ledger is a derived view, never a stored copy: every entry is
// computed fresh from the same `result.criteria` the backend returned, plus
// (for simulated entries only) a client-side hypothesis the user explicitly
// asked to preview. There is no separate persisted "ledger log" — that would
// create a second source of truth that could drift from the real evaluation.
// "Verified" entries always mirror the latest /evaluate response; only the
// simulated overlay is ever appended-to client-side.
export type LedgerOrigin = "verified" | "simulated";

export type LedgerEntry = {
  id: string;
  name: string;
  category: string;
  status: RuleStatus;
  origin: LedgerOrigin;
  evidenceLabel: string | null;
};

// Human-readable names — a display-only label over ids the backend already
// returns. Never invents a rule that doesn't exist in the scheme data.
const RULE_NAMES: Record<string, string> = {
  gender_female: "Gender Eligibility",
  odisha_resident: "State Residency",
  shg_member: "SHG Membership",
  shg_age_6m: "SHG Active Duration",
  has_aadhaar: "Aadhaar on File",
  has_shg_certificate: "SHG Certificate on File",
  has_business_quotation: "Business Quotation on File",
  has_monthly_revenue: "Monthly Revenue Declared",
  has_monthly_expenses: "Monthly Expenses Declared",
};

// Which self-declared profile field each rule actually checks, and how to
// describe its current value. Static because the rule set is small and
// known — not a generalized field-mapping engine.
const EVIDENCE_DESCRIBERS: Record<string, (profile: Profile | null) => string> = {
  gender_female: (p) => `Gender: ${p?.gender || "not provided"}`,
  odisha_resident: (p) => `State: ${p?.state || "not provided"}`,
  shg_member: (p) => `SHG member: ${p?.is_shg_member ? "Yes" : "No"}`,
  shg_age_6m: (p) => `SHG active for ${p?.shg_months_active ?? 0} month(s)`,
  has_aadhaar: (p) => `Aadhaar on file: ${p?.documents.includes("aadhaar") ? "Yes" : "No"}`,
  has_shg_certificate: (p) => `SHG certificate on file: ${p?.documents.includes("shg_certificate") ? "Yes" : "No"}`,
  has_business_quotation: (p) =>
    `Business quotation on file: ${p?.documents.includes("business_quotation") ? "Yes" : "No"}`,
  has_monthly_revenue: (p) =>
    `Monthly revenue: ${p?.monthly_revenue != null ? `₹${p.monthly_revenue.toLocaleString("en-IN")}` : "not provided"}`,
  has_monthly_expenses: (p) =>
    `Monthly expenses: ${p?.monthly_expenses != null ? `₹${p.monthly_expenses.toLocaleString("en-IN")}` : "not provided"}`,
};

export function ruleName(id: string): string {
  return RULE_NAMES[id] ?? id;
}

export function evidenceLabelFor(criterion: CriterionResult, profile: Profile | null): string | null {
  const describe = EVIDENCE_DESCRIBERS[criterion.id];
  return describe ? describe(profile) : null;
}

export function buildLedger(
  criteria: CriterionResult[],
  profile: Profile | null,
  simulatedIds: string[],
): LedgerEntry[] {
  return criteria.map((criterion) => {
    const isSimulated = !criterion.met && simulatedIds.includes(criterion.id);
    const effective = isSimulated ? { ...criterion, met: true } : criterion;

    return {
      id: criterion.id,
      name: ruleName(criterion.id),
      category: criterion.category,
      status: statusForCriterion(effective),
      origin: isSimulated ? "simulated" : "verified",
      evidenceLabel: evidenceLabelFor(criterion, profile),
    };
  });
}

export function roadmapStepFor(criterion: CriterionResult, roadmap: RoadmapStep[]): RoadmapStep | null {
  return roadmap.find((step) => step.reason === criterion.rule_text) ?? null;
}

const RULE_EFFORT: Record<string, string> = {
  gender_female: "None (Structural constraint)",
  odisha_resident: "None (Structural constraint)",
  shg_member: "High (Requires forming/joining a group of 10-20 women and local registration)",
  shg_age_6m: "Medium (Requires active participation and waiting for 6 months)",
  has_aadhaar: "Low (Requires visiting Aadhaar center or local cyber cafe, approx. 1-2 hours)",
  has_shg_certificate: "Low (Requires requesting group leader to issue certificate, approx. 1 day)",
  has_business_quotation: "Medium (Requires contacting local suppliers or vendors for quotation, approx. 2-3 days)",
  has_monthly_revenue: "Low (Requires calculating current/expected sales income, approx. 30 minutes)",
  has_monthly_expenses: "Low (Requires listing business expenses, rent, raw materials, approx. 30 minutes)",
};

export function ruleEffort(id: string): string {
  return RULE_EFFORT[id] ?? "Low";
}
