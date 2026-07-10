import type { ReactNode } from "react";

import ConfidenceBadge from "./ConfidenceBadge";

// One numbered sub-section of the generated proposal narrative. No card
// border, no shadow, no rounding — inside the Proposal dossier, "AI wrote
// this" is communicated by the badge alone, not by a separate floating
// container, so the whole document reads as one continuous body of text
// rather than a stack of app cards.
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
    <div className="print:break-inside-avoid">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-serif text-base font-semibold text-ink">{title}</h3>
        <ConfidenceBadge variant={aiGenerated ? "ai" : "rule"} />
      </div>
      <div className="whitespace-pre-line text-sm leading-relaxed text-ink-muted print:text-ink">{children}</div>
    </div>
  );
}
