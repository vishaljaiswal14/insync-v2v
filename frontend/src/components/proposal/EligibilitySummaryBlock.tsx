import {
  computeCurrentReadiness,
  computeProjectedReadiness,
  deriveEligibilityStatus,
  derivePrimaryBlockerText,
  deriveQuickestActionText,
  deriveReasonText,
  statusLabel,
} from "@/lib/proposalSummary";
import type { CriterionResult, RoadmapStep } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  ready: "text-success",
  deferred: "text-amber",
  blocked: "text-ink",
};

// The one box in the whole document meant to be read first. Reuses the
// same "official verified box" visual language as the Executive Panel on
// Results (border-2 border-brand) so the two feel like the same product,
// but flattened — no shadow, no rounding — because this is a document
// field, not a floating card.
export default function EligibilitySummaryBlock({
  criteria,
  roadmap,
}: {
  criteria: CriterionResult[];
  roadmap: RoadmapStep[];
}) {
  const status = deriveEligibilityStatus(criteria);
  const current = computeCurrentReadiness(criteria);
  const projected = computeProjectedReadiness(criteria);

  return (
    <div className="rounded-sm border-2 border-brand bg-brand-light p-6 print:break-inside-avoid">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Status
          </span>
          <p className={`mt-0.5 font-serif text-2xl font-semibold ${STATUS_COLOR[status]}`}>
            {statusLabel(status)}
          </p>
        </div>
        <div>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Reason
          </span>
          <p className="mt-0.5 text-sm font-medium text-ink">{deriveReasonText(criteria, status)}</p>
        </div>

        <div>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Current readiness
          </span>
          <p className="mt-0.5 font-mono text-lg font-bold text-brand">{Math.round(current * 100)}%</p>
        </div>
        <div>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Estimated readiness after current action plan
          </span>
          <p className="mt-0.5 font-mono text-lg font-bold text-brand">{Math.round(projected * 100)}%</p>
        </div>

        <div>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Primary blocker
          </span>
          <p className="mt-0.5 text-sm text-ink">{derivePrimaryBlockerText(criteria)}</p>
        </div>
        <div>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Quickest action
          </span>
          <p className="mt-0.5 text-sm text-ink">{deriveQuickestActionText(criteria, roadmap)}</p>
        </div>
      </div>
    </div>
  );
}
