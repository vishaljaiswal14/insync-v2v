"use client";

import { useAssessment } from "@/context/AssessmentContext";

// The docked affordance — present from the moment a real evaluation exists
// (including during the assess-page replay itself) through Results, Roadmap,
// and Proposal. Deliberately a single compact pill, not a sidebar: it must
// lose the fight for attention to whatever content it explains.
export default function LedgerPill() {
  const { state, openLedger } = useAssessment();

  if (!state.result) return null;

  const count = state.result.criteria.length;

  return (
    <button
      type="button"
      onClick={() => openLedger(null)}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted transition hover:border-brand/30 hover:text-brand"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
      {count} entr{count === 1 ? "y" : "ies"} · Ledger
    </button>
  );
}
