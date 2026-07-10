"use client";

import { useEffect, useRef } from "react";

import LedgerEntryRow from "./LedgerEntryRow";
import { useAssessment } from "@/context/AssessmentContext";
import { buildLedger } from "@/lib/ledger";

// The one persistent surface every derived number in the app links back
// into. Rendered once, in the journey layout, so Results/Roadmap/Proposal
// all open the same instance rather than each mounting their own copy.
export default function LedgerDrawer() {
  const { state, closeLedger } = useAssessment();
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const criteria = state.result?.criteria ?? [];
  const roadmap = state.result?.roadmap ?? [];
  const entries = buildLedger(criteria, state.profile, state.simulatedMetIds);
  const focusIds = state.ledgerFocusIds;

  useEffect(() => {
    if (!state.ledgerOpen || !focusIds || focusIds.length === 0) return;
    const firstId = focusIds[0];
    const node = rowRefs.current[firstId];
    if (node) {
      node.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [state.ledgerOpen, focusIds]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeLedger();
    }
    if (state.ledgerOpen) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [state.ledgerOpen, closeLedger]);

  if (!state.result) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/20 transition-opacity duration-200 print:hidden ${
          state.ledgerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeLedger}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-label="Decision Ledger"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col border-l border-line bg-white shadow-card transition-transform duration-200 print:hidden sm:max-w-[440px] ${
          state.ledgerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-ink-faint">
              Decision Ledger
            </span>
            <h2 className="font-serif text-lg font-semibold text-ink">
              {entries.length} entr{entries.length === 1 ? "y" : "ies"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeLedger}
            className="rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-muted hover:border-brand/30 hover:text-brand"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {entries.map((entry, index) => {
            const criterion = criteria.find((c) => c.id === entry.id);
            if (!criterion) return null;
            return (
              <LedgerEntryRow
                key={entry.id}
                ref={(node) => {
                  rowRefs.current[entry.id] = node;
                }}
                index={index}
                entry={entry}
                criterion={criterion}
                allCriteria={criteria}
                roadmap={roadmap}
                profile={state.profile}
                highlighted={focusIds?.includes(entry.id) ?? false}
                defaultExpanded={focusIds?.includes(entry.id) ?? false}
              />
            );
          })}
        </div>

        <div className="border-t border-line px-5 py-3">
          <p className="font-mono text-[10px] text-ink-faint">
            Every entry above is the actual rule engine response — nothing here is generated.
          </p>
        </div>
      </div>
    </>
  );
}
