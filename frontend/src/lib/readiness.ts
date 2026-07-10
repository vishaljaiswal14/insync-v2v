import type { CriterionResult } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
  grant: "Grant",
  documentation: "Documentation",
  financial_documentation: "Financial Documentation",
};

export function categoryDisplayName(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

// Pure scoring math — the single source of truth for "how many of this
// category are met." Used by the Results page's rings and by the Rule
// Dossier's "if resolved" projection, so the two can never silently diverge.
export function countFor(criteria: CriterionResult[], category: string): { met: number; total: number } {
  const matching = criteria.filter((c) => c.category === category);
  return { met: matching.filter((c) => c.met).length, total: matching.length };
}

export function idsForCategory(criteria: CriterionResult[], category: string): string[] {
  return criteria.filter((c) => c.category === category).map((c) => c.id);
}

// What a single unmet, fixable criterion is actually worth — computed by
// replaying the same met/total math with just that one criterion flipped.
// Never a guess: if the criterion is already met, or doesn't exist, the
// delta is zero rather than fabricated.
export function computeSingleFixImpact(
  criteria: CriterionResult[],
  id: string,
): { deltaOverall: number; deltaCategory: number; categoryLabel: string } {
  const target = criteria.find((c) => c.id === id);
  if (!target || target.met) {
    return { deltaOverall: 0, deltaCategory: 0, categoryLabel: target?.category ?? "" };
  }

  const total = criteria.length;
  const currentMet = criteria.filter((c) => c.met).length;
  const currentScore = total > 0 ? currentMet / total : 0;
  const projectedScore = total > 0 ? (currentMet + 1) / total : 0;

  const categoryCriteria = criteria.filter((c) => c.category === target.category);
  const catTotal = categoryCriteria.length;
  const catMet = categoryCriteria.filter((c) => c.met).length;
  const catScore = catTotal > 0 ? catMet / catTotal : 0;
  const catProjected = catTotal > 0 ? (catMet + 1) / catTotal : 0;

  return {
    deltaOverall: Math.round((projectedScore - currentScore) * 100),
    deltaCategory: Math.round((catProjected - catScore) * 100),
    categoryLabel: target.category,
  };
}
