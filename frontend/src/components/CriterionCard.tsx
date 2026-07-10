"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import ConfidenceBadge from "./ConfidenceBadge";
import SourceChip from "./SourceChip";
import { explainCriterion } from "@/lib/api";
import type { CriterionResult, ExplainResponse } from "@/lib/types";

// Three states, shape-coded (not just color-coded) for colorblind-safety:
// met = filled check, fixable gap = open circle in accent amber, structural
// blocker = a diamond in neutral slate — never red. A blocker is a fact
// about her life, not a failure; styling it as an error would be dishonest.
const STATUS = {
  met: { icon: "✓", className: "border-success bg-success text-white" },
  fixable: { icon: "○", className: "border-accent text-accent" },
  blocker: { icon: "◆", className: "border-slate-400 text-slate-400" },
} as const;

function statusFor(criterion: CriterionResult): keyof typeof STATUS {
  if (criterion.met) return "met";
  return criterion.fixable ? "fixable" : "blocker";
}

export default function CriterionCard({ criterion }: { criterion: CriterionResult }) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [explaining, setExplaining] = useState(false);
  const status = statusFor(criterion);
  const { icon, className } = STATUS[status];

  async function handleExplain() {
    setExplaining(true);
    try {
      const response = await explainCriterion(criterion);
      setExplanation(response);
    } finally {
      setExplaining(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
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
        <span className="flex-1 text-sm text-gray-800">{criterion.plain}</span>
        <span className="text-gray-400" aria-hidden="true">
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
            <div className="ml-9 mt-3 space-y-2 border-l-2 border-gray-100 pl-3">
              <p className="text-sm italic text-gray-500">&ldquo;{criterion.rule_text}&rdquo;</p>
              <SourceChip label={criterion.source} url={criterion.source_url} />
              {criterion.fixable && criterion.fix_action && (
                <p className="text-sm text-gray-700">{criterion.fix_action}</p>
              )}

              {!explanation && (
                <button
                  type="button"
                  onClick={handleExplain}
                  disabled={explaining}
                  className="block text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                >
                  {explaining ? "Thinking…" : "Why? Explain this"}
                </button>
              )}

              {explanation && (
                <div className="mt-2 rounded-xl bg-gradient-to-r from-brand/5 to-accent/5 p-3">
                  <div className="mb-1">
                    <ConfidenceBadge variant={explanation.ai_generated ? "ai" : "rule"} />
                  </div>
                  <p className="text-sm text-gray-700">{explanation.explanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
