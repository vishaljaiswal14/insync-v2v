import type { Profile } from "./types";

// Known coupling point: RoadmapStep doesn't carry a criterion id (only
// `reason`, which mirrors rule_text), and CriterionResult doesn't carry the
// field/operator that produced it. So "mark done" can only simulate a
// profile change per known criterion id — it never decides eligibility.
// The /evaluate call that follows is what's actually authoritative.
//
// Time-gated criteria (shg_age_6m) are deliberately absent here: no click
// can honestly make a month pass, so those steps get no action at all.
export const CRITERION_ACTIONS: Record<string, (profile: Profile) => Partial<Profile>> = {
  shg_member: () => ({ is_shg_member: true }),
  has_aadhaar: (profile) => ({ documents: addDocument(profile, "aadhaar") }),
  has_shg_certificate: (profile) => ({ documents: addDocument(profile, "shg_certificate") }),
  has_business_quotation: (profile) => ({ documents: addDocument(profile, "business_quotation") }),
  has_monthly_revenue: () => ({ monthly_revenue: 8000 }),
  has_monthly_expenses: () => ({ monthly_expenses: 5000 }),
};

function addDocument(profile: Profile, document: string): string[] {
  return profile.documents.includes(document) ? profile.documents : [...profile.documents, document];
}
