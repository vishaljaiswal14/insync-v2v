import type { CriterionResult } from "./types";

// Shared by CriterionCard and the Decision Ledger — one status vocabulary,
// shape-coded (not just color-coded) for colorblind-safety. A blocker is a
// fact about her life, not a failure; styling it as an error would be
// dishonest, so it never renders red.
export type RuleStatus = "met" | "fixable" | "blocker";

export const STATUS_GLYPH: Record<RuleStatus, { icon: string; className: string }> = {
  met: { icon: "✓", className: "border-success bg-success text-white" },
  fixable: { icon: "○", className: "border-accent text-accent" },
  blocker: { icon: "◆", className: "border-ink-faint text-ink-faint" },
};

export function statusForCriterion(criterion: Pick<CriterionResult, "met" | "fixable">): RuleStatus {
  if (criterion.met) return "met";
  return criterion.fixable ? "fixable" : "blocker";
}
