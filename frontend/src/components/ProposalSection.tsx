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
    <div className="rounded-2xl border border-gray-100 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-brand-dark">{title}</h3>
        <ConfidenceBadge variant={aiGenerated ? "ai" : "rule"} />
      </div>
      <div className="text-sm leading-relaxed text-gray-600">{children}</div>
    </div>
  );
}
