import ConfidenceBadge from "@/components/ConfidenceBadge";
import SourceChip from "@/components/SourceChip";
import { STATUS_GLYPH, statusForCriterion } from "@/lib/status";
import type { CriterionResult } from "@/lib/types";

const STATUS_TEXT = {
  met: "Verified",
  fixable: "Outstanding",
  blocker: "Blocked",
} as const;

// The complete citation appendix — every criterion the scheme defines,
// regardless of status, each traced to its official source. Nothing here
// is filtered or summarized; it's the full rule set the evaluation ran
// against.
export default function RuleReferencesTable({ criteria }: { criteria: CriterionResult[] }) {
  return (
    <div>
      <div className="mb-4 print:hidden">
        <ConfidenceBadge variant="rule" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              {["Rule", "Description", "Source", "Status"].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap py-2 pr-4 font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint print:text-ink"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion) => {
              const status = statusForCriterion(criterion);
              const glyph = STATUS_GLYPH[status];
              return (
                <tr key={criterion.id} className="border-b border-line align-top last:border-b-0">
                  <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs text-ink-faint print:text-ink">
                    [{criterion.id.toUpperCase().replace(/_/g, "-")}]
                  </td>
                  <td className="py-3 pr-4 text-ink-muted print:text-ink">{criterion.rule_text}</td>
                  <td className="py-3 pr-4">
                    <SourceChip label={criterion.source} url={criterion.source_url} />
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4">
                    <span className={`inline-flex items-center gap-1.5 font-medium ${textColorFor(status)}`}>
                      <span aria-hidden="true">{glyph.icon}</span>
                      {STATUS_TEXT[status]}
                    </span>
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

function textColorFor(status: "met" | "fixable" | "blocker"): string {
  if (status === "met") return "text-success";
  if (status === "fixable") return "text-accent-dark";
  return "text-ink-faint";
}
