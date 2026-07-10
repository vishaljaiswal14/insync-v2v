import type { ReactNode } from "react";

import ConfidenceBadge from "./ConfidenceBadge";

// Document-style card, distinct from CriterionCard: generous padding, longer
// line-height for sustained reading. The badge reflects which path actually
// ran — "ai" when Gemini wrote it, "rule" when the deterministic template
// did. Same card, same shape, honest either way.
export default function ProposalSection({
  title,
  aiGenerated,
  children,
}: {
  title: string;
  aiGenerated: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
        <ConfidenceBadge variant={aiGenerated ? "ai" : "rule"} />
      </div>
      <div className="text-sm leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}
