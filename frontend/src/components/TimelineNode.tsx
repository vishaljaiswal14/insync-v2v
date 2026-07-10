"use client";

import { motion } from "framer-motion";

import ConfidenceBadge from "./ConfidenceBadge";
import type { RoadmapStep } from "@/lib/types";

// Two states only, by design: every step on this screen is already an
// unmet-but-fixable gap (the backend filters out structural blockers before
// it ever reaches here — those live on the Results screen instead).
// Time-gated steps get a date, never a button — no click can make a month
// pass, and pretending otherwise would break the product's honesty rule.
export default function TimelineNode({
  step,
  isLast,
  submitting,
  onMarkDone,
}: {
  step: RoadmapStep;
  isLast: boolean;
  submitting: boolean;
  onMarkDone?: () => void;
}) {
  const isTimeGated = step.eligible_on !== null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.25 }}
      className="relative flex gap-4 pb-8"
    >
      {!isLast && (
        <span className="absolute left-[15px] top-8 h-full w-px bg-gray-200" aria-hidden="true" />
      )}

      <span
        className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
          isTimeGated ? "border-accent bg-accent/10 text-accent" : "border-brand/40 text-brand"
        }`}
        aria-hidden="true"
      >
        {isTimeGated ? "📅" : "○"}
      </span>

      <div className="flex-1 rounded-2xl border border-gray-100 p-4">
        <p className="text-sm font-medium text-gray-800">{step.action}</p>
        <p className="mt-1 text-xs text-gray-500">{step.reason}</p>

        {isTimeGated && (
          <p className="mt-3 text-lg font-semibold text-accent">Eligible on {formatDate(step.eligible_on!)}</p>
        )}

        {step.meanwhile && (
          <p className="mt-2 border-l-2 border-gray-100 pl-3 text-xs text-gray-500">
            Meanwhile: {step.meanwhile}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <ConfidenceBadge variant="rule" />
          {!isTimeGated && onMarkDone && (
            <button
              type="button"
              onClick={onMarkDone}
              disabled={submitting}
              className="rounded-lg border border-brand/30 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/5 disabled:opacity-50"
            >
              {submitting ? "Updating…" : "Mark done"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
