"use client";

import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useState } from "react";

import RuleDossier from "@/components/RuleDossier";
import Tag from "@/components/ui/Tag";
import { STATUS_GLYPH } from "@/lib/status";
import { roadmapStepFor, type LedgerEntry } from "@/lib/ledger";
import type { CriterionResult, Profile, RoadmapStep } from "@/lib/types";

// One row per criterion the backend actually returned — a running line
// number (passbook-style), the status glyph, the rule name and id. Nothing
// else is visible until expanded: a ledger that shows all fourteen fields
// at once is a wall of text, not evidence.
const LedgerEntryRow = forwardRef<
  HTMLDivElement,
  {
    index: number;
    entry: LedgerEntry;
    criterion: CriterionResult;
    allCriteria: CriterionResult[];
    roadmap: RoadmapStep[];
    profile: Profile | null;
    highlighted?: boolean;
    defaultExpanded?: boolean;
  }
>(function LedgerEntryRow(
  { index, entry, criterion, allCriteria, roadmap, profile, highlighted = false, defaultExpanded = false },
  ref,
) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const glyph = STATUS_GLYPH[entry.status];
  const roadmapStep = roadmapStepFor(criterion, roadmap);

  return (
    <div
      ref={ref}
      className={`border-b border-line last:border-b-0 transition-colors duration-700 ${
        highlighted ? "bg-accent/10" : "bg-transparent"
      } ${entry.origin === "simulated" ? "border-l-2 border-dashed border-amber pl-2" : "border-l-2 border-transparent pl-2"}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 py-3 pr-3 text-left"
      >
        <span className="w-6 shrink-0 font-mono text-[10px] text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${glyph.className}`}
          aria-hidden="true"
        >
          {glyph.icon}
        </span>
        <span className="flex-1 text-sm font-medium text-ink">{entry.name}</span>
        {entry.origin === "simulated" && <Tag variant="amber">Simulated</Tag>}
        <span className="font-mono text-[10px] text-ink-faint">
          [{entry.id.toUpperCase().replace(/_/g, "-")}]
        </span>
        <span className="text-ink-faint" aria-hidden="true">
          {expanded ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-9 pr-3">
              <RuleDossier
                criterion={criterion}
                allCriteria={allCriteria}
                roadmapStep={roadmapStep}
                profile={profile}
                compact
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default LedgerEntryRow;
