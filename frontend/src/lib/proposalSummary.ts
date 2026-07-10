import type { CriterionResult, RoadmapStep } from "./types";

// Proposal-only derivations, deliberately separate from the similar-looking
// logic already inline in the Results page's Executive Panel. That logic
// stays untouched (Phase 2 does not redesign Results) — duplicating a small
// amount of branching here is the price of not risking a regression there.
export type EligibilityStatus = "ready" | "deferred" | "blocked";

export function deriveEligibilityStatus(criteria: CriterionResult[]): EligibilityStatus {
  const blockers = criteria.filter((c) => !c.met && !c.fixable);
  const unmet = criteria.filter((c) => !c.met);
  if (blockers.length > 0) return "blocked";
  if (unmet.length === 0) return "ready";
  return "deferred";
}

export function statusLabel(status: EligibilityStatus): string {
  switch (status) {
    case "ready":
      return "Application Ready";
    case "blocked":
      return "Application Blocked";
    default:
      return "Application Deferred";
  }
}

export function deriveReasonText(criteria: CriterionResult[], status: EligibilityStatus): string {
  if (status === "ready") return "Every criterion for this scheme is currently satisfied.";
  const blockers = criteria.filter((c) => !c.met && !c.fixable);
  if (status === "blocked" && blockers.length > 0) return blockers[0].plain;
  const unmet = criteria.filter((c) => !c.met);
  return unmet.length > 0 ? unmet[0].plain : "";
}

export function derivePrimaryBlockerText(criteria: CriterionResult[]): string {
  const blockers = criteria.filter((c) => !c.met && !c.fixable);
  if (blockers.length > 0) return blockers[0].rule_text;
  const unmet = criteria.filter((c) => !c.met);
  return unmet.length > 0 ? unmet[0].rule_text : "None — all requirements satisfied.";
}

export function deriveQuickestActionText(criteria: CriterionResult[], roadmap: RoadmapStep[]): string {
  const actionableNow = roadmap.find((step) => step.eligible_on === null);
  if (actionableNow) return actionableNow.action;
  if (roadmap.length > 0) return roadmap[0].action;
  return "No further action required.";
}

export function computeCurrentReadiness(criteria: CriterionResult[]): number {
  if (criteria.length === 0) return 0;
  return criteria.filter((c) => c.met).length / criteria.length;
}

// The ceiling readiness assuming every currently fixable criterion gets
// resolved. Never assumes a structural blocker changes, since nothing she
// does can change one — this is a projection over the action plan, not a
// prediction of approval.
export function computeProjectedReadiness(criteria: CriterionResult[]): number {
  if (criteria.length === 0) return 0;
  const resolvable = criteria.filter((c) => c.met || c.fixable).length;
  return resolvable / criteria.length;
}
