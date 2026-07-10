import ConfidenceBadge from "@/components/ConfidenceBadge";
import SourceChip from "@/components/SourceChip";
import { ruleName } from "@/lib/ledger";
import type { CriterionResult } from "@/lib/types";

// The narrative counterpart to Rule References below: only the criteria
// already confirmed true, read as a plain statement of what's already been
// established — proof of completion, not a technical appendix.
export default function SupportingEvidenceList({ criteria }: { criteria: CriterionResult[] }) {
  const met = criteria.filter((c) => c.met);

  if (met.length === 0) {
    return <p className="text-sm text-ink-muted">No criteria are verified yet.</p>;
  }

  return (
    <div>
      <div className="mb-4 print:hidden">
        <ConfidenceBadge variant="rule" />
      </div>
      <ul className="space-y-3">
        {met.map((criterion) => (
          <li
            key={criterion.id}
            className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-b-0 print:break-inside-avoid"
          >
            <div>
              <p className="text-sm font-medium text-ink print:text-ink">{ruleName(criterion.id)}</p>
              <p className="mt-0.5 text-sm text-ink-muted print:text-ink">{criterion.plain}</p>
            </div>
            <SourceChip label={criterion.source} url={criterion.source_url} />
          </li>
        ))}
      </ul>
    </div>
  );
}
