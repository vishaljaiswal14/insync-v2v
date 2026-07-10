"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import ExplainDisclosure from "./ExplainDisclosure";
import SourceChip from "./SourceChip";
import type { CriterionResult } from "@/lib/types";

// Three states, shape-coded (not just color-coded) for colorblind-safety:
// met = filled check, fixable gap = open circle in accent amber, structural
// blocker = a diamond in neutral slate — never red. A blocker is a fact
// about her life, not a failure; styling it as an error would be dishonest.
const STATUS = {
  met: { icon: "✓", className: "border-success bg-success text-white" },
  fixable: { icon: "○", className: "border-accent text-accent" },
  blocker: { icon: "◆", className: "border-ink-faint text-ink-faint" },
} as const;

function statusFor(criterion: CriterionResult): keyof typeof STATUS {
  if (criterion.met) return "met";
  return criterion.fixable ? "fixable" : "blocker";
}

export default function CriterionCard({
  criterion,
  simulated = false,
  canSimulate = false,
  onToggleSimulate,
}: {
  criterion: CriterionResult;
  simulated?: boolean;
  canSimulate?: boolean;
  onToggleSimulate?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = statusFor(criterion);
  const { icon, className } = STATUS[status];

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-card">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${className}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="flex-1 text-sm font-medium text-ink">{criterion.plain}</span>
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
            <div className="ml-9 mt-3 pt-3 border-t border-line">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Official Rule */}
                <div className="space-y-2 border-r-0 md:border-r border-line md:pr-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                      Official Rule [{criterion.id.toUpperCase().replace(/_/g, "-")}]
                    </span>
                  </div>
                  <div className="bg-paper border border-line p-3 rounded font-mono text-xs text-ink leading-relaxed relative overflow-hidden">
                    <span className="absolute right-1.5 bottom-1 text-[24px] text-ink-faint/5 font-serif select-none">§</span>
                    &ldquo;{criterion.rule_text}&rdquo;
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-ink-faint">Source:</span>
                    <SourceChip label={criterion.source} url={criterion.source_url} />
                  </div>
                </div>

                {/* Right Column: Copilot Translation & Actions */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                      Copilot Explanation
                    </span>
                    <ExplainDisclosure criterion={criterion} compact />
                  </div>
                  
                  {criterion.fixable && criterion.fix_action && (
                    <div className="mt-2 rounded bg-amber-light/30 border border-amber-border/40 p-2.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-amber">
                        Action Required
                      </span>
                      <p className="text-xs font-medium text-ink mt-0.5">{criterion.fix_action}</p>
                    </div>
                  )}

                  {canSimulate && onToggleSimulate && (
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-ink-muted cursor-pointer uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={simulated}
                          onChange={onToggleSimulate}
                          className="h-3.5 w-3.5 rounded border-line text-brand focus:ring-1 focus:ring-brand/20 bg-white"
                        />
                        Simulate meeting this rule
                      </label>
                      {simulated && (
                        <span className="font-mono text-[9px] font-bold text-success uppercase tracking-wider animate-pulse">
                          Simulator Active
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
