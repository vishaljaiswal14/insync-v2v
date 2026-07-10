"use client";

import { useState } from "react";

import ConfidenceBadge from "./ConfidenceBadge";
import { explainCriterion } from "@/lib/api";
import type { CriterionResult, ExplainResponse } from "@/lib/types";

// Shared by CriterionCard and TimelineNode — identical "Why? Explain this"
// behavior in both places, so it lives once. AI content stays the quietest
// element wherever this appears: last in reading order, smallest text.
export default function ExplainDisclosure({
  criterion,
  compact = false,
}: {
  criterion: CriterionResult;
  compact?: boolean;
}) {
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [explaining, setExplaining] = useState(false);

  async function handleExplain() {
    setExplaining(true);
    try {
      const response = await explainCriterion(criterion);
      setExplanation(response);
    } finally {
      setExplaining(false);
    }
  }

  if (explanation) {
    return (
      <div className="mt-2 rounded-lg border border-line bg-brand-light p-3">
        <div className="mb-1.5">
          <ConfidenceBadge variant={explanation.ai_generated ? "ai" : "rule"} />
        </div>
        <p className={compact ? "text-xs text-ink-muted leading-relaxed" : "text-sm text-ink leading-relaxed"}>
          {explanation.explanation}
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleExplain}
      disabled={explaining}
      className={`block font-semibold text-brand hover:text-brand-dark hover:underline disabled:opacity-50 transition-colors ${
        compact ? "text-[11px]" : "text-xs"
      }`}
    >
      {explaining ? "Thinking…" : "Why? Explain this"}
    </button>
  );
}
