"use client";

import { motion } from "framer-motion";

import RuleDossier from "./RuleDossier";
import { useAssessment } from "@/context/AssessmentContext";
import { roadmapStepFor } from "@/lib/ledger";
import type { CriterionResult, Profile, RoadmapStep } from "@/lib/types";

// Two live states, by design: every step here is already unmet-but-fixable
// (structural blockers live in BlockersDisclosure, not here). Time-gated
// steps get a date, never a button — no click can make a month pass, and
// pretending otherwise would break the product's honesty rule. A third,
// transitional "completing" state renders when mark-done is in flight, so
// the checkmark is seen before the step ever leaves the list.
export default function TimelineNode({
  step,
  criterion,
  allCriteria = [],
  roadmap = [],
  profile = null,
  completing,
  submitting,
  delay,
  onMarkDone,
}: {
  step: RoadmapStep;
  criterion: CriterionResult | null;
  allCriteria?: CriterionResult[];
  roadmap?: RoadmapStep[];
  profile?: Profile | null;
  completing: boolean;
  submitting: boolean;
  delay: number;
  onMarkDone?: () => void;
}) {
  const { openLedger } = useAssessment();
  const isTimeGated = step.eligible_on !== null;
  const roadmapStep = criterion ? roadmapStepFor(criterion, roadmap) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay }}
      className="relative flex gap-4 pb-8"
    >
      <motion.span
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.3, delay }}
        style={{ transformOrigin: "top" }}
        className="absolute left-4 top-8 h-full border-l-2 border-dashed border-line"
        aria-hidden="true"
      />

      <Marker completing={completing} isTimeGated={isTimeGated} />

      <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-card">
        <p className="text-sm font-medium text-ink">{step.action}</p>

        <p className="mt-1 text-xs text-ink-muted">
          {step.reason}
          {criterion && (
            <span className="ml-2 font-mono text-[11px] tracking-tight text-ink-faint">
              [{formatCitationCode(criterion.id)}]
            </span>
          )}
        </p>

        {isTimeGated && criterion && (
          <button
            type="button"
            onClick={() => openLedger([criterion.id])}
            className="mt-3 block font-serif text-2xl font-semibold text-accent-dark hover:underline text-left"
          >
            Eligible on {formatDate(step.eligible_on!)}
          </button>
        )}
        {isTimeGated && !criterion && (
          <p className="mt-3 font-serif text-2xl font-semibold text-accent-dark">
            Eligible on {formatDate(step.eligible_on!)}
          </p>
        )}

        {step.meanwhile && (
          <p className="mt-2 border-l-2 border-line pl-3 text-xs text-ink-muted">Meanwhile: {step.meanwhile}</p>
        )}

        {criterion && (
          <div className="mt-3 border-t border-line pt-3">
            <RuleDossier
              criterion={criterion}
              allCriteria={allCriteria}
              roadmapStep={roadmapStep}
              profile={profile}
              compact
            />
          </div>
        )}

        {!isTimeGated && onMarkDone && (
          <div className="mt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onMarkDone}
              disabled={submitting || completing}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-brand/30 px-4 text-xs font-semibold text-brand transition hover:bg-brand/5 disabled:opacity-50"
            >
              {submitting || completing ? "Updating…" : "Mark done"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Marker({ completing, isTimeGated }: { completing: boolean; isTimeGated: boolean }) {
  if (completing) {
    return (
      <span
        className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
        aria-hidden="true"
      >
        <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
          ✓
        </motion.span>
      </span>
    );
  }

  if (isTimeGated) {
    return (
      <span
        className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-accent-dark"
        aria-hidden="true"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-accent-dark" />
      </span>
    );
  }

  return (
    <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brand" aria-hidden="true" />
  );
}

function formatCitationCode(id: string): string {
  return id.toUpperCase().replace(/_/g, "-");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
