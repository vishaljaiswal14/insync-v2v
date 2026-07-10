import ConfidenceBadge from "@/components/ConfidenceBadge";
import SourceChip from "@/components/SourceChip";
import Tag from "@/components/ui/Tag";
import { ruleName } from "@/lib/ledger";
import { categoryDisplayName, computeSingleFixImpact } from "@/lib/readiness";
import type { CriterionResult, RoadmapStep } from "@/lib/types";

// Sourced directly from result.roadmap — the backend already generates
// exactly one step per unmet, fixable criterion, so there is nothing to
// recompute here. Structural blockers are deliberately absent: there is no
// "Required Action" for something nothing she does can change, so they
// belong in the Eligibility Summary's "Primary blocker" field instead, not
// in a table implying an action exists.
export default function OutstandingRequirementsTable({
  criteria,
  roadmap,
}: {
  criteria: CriterionResult[];
  roadmap: RoadmapStep[];
}) {
  if (roadmap.length === 0) {
    return <p className="text-sm text-ink-muted">No outstanding requirements — every fixable criterion is met.</p>;
  }

  return (
    <div>
      <div className="mb-4 print:hidden">
        <ConfidenceBadge variant="rule" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              {["Requirement", "Status", "Required Action", "Estimated Timing", "Impact", "Official Basis"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap py-2 pr-4 font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint print:text-ink"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {roadmap.map((step) => {
              const criterion = criteria.find((c) => c.rule_text === step.reason);
              if (!criterion) return null;
              const isTimeGated = step.eligible_on !== null;
              const impact = computeSingleFixImpact(criteria, criterion.id);

              return (
                <tr key={step.reason} className="border-b border-line align-top last:border-b-0 print:break-inside-avoid">
                  <td className="py-3 pr-4 font-medium text-ink print:text-ink">{ruleName(criterion.id)}</td>
                  <td className="py-3 pr-4">
                    <Tag variant={isTimeGated ? "amber" : "neutral"}>
                      {isTimeGated ? "Time-Gated" : "Actionable Now"}
                    </Tag>
                  </td>
                  <td className="py-3 pr-4 text-ink-muted print:text-ink">{step.action}</td>
                  <td className="py-3 pr-4 text-ink-muted print:text-ink">
                    {step.eligible_on ? formatDate(step.eligible_on) : "Immediate"}
                  </td>
                  <td className="py-3 pr-4 text-ink-muted print:text-ink">
                    {impact.deltaCategory > 0
                      ? `+${impact.deltaCategory}% ${categoryDisplayName(impact.categoryLabel)}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <SourceChip label={criterion.source} url={criterion.source_url} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
