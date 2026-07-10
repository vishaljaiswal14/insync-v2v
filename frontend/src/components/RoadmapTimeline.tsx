"use client";

import { AnimatePresence } from "framer-motion";

import ActionCard from "./ActionCard";
import TimelineNode from "./TimelineNode";
import type { RoadmapStep } from "@/lib/types";

// Container's only job: render the vertical line of steps, or the honest
// empty state when there's nothing left to fix. Uses step.reason as the
// stable key — the backend doesn't expose a criterion id on RoadmapStep,
// and rule_text (mirrored into reason) is unique per scheme today.
export default function RoadmapTimeline({
  steps,
  submittingStep,
  onMarkDone,
}: {
  steps: RoadmapStep[];
  submittingStep: string | null;
  onMarkDone: (step: RoadmapStep) => void;
}) {
  if (steps.length === 0) {
    return (
      <ActionCard
        emoji="✓"
        title="You meet every criterion for this scheme"
        description="There's nothing left to close for grant eligibility right now."
      />
    );
  }

  return (
    <div>
      <AnimatePresence initial={false}>
        {steps.map((step, index) => (
          <TimelineNode
            key={step.reason}
            step={step}
            isLast={index === steps.length - 1}
            submitting={submittingStep === step.reason}
            onMarkDone={step.eligible_on === null ? () => onMarkDone(step) : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
