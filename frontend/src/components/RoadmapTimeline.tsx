"use client";

import { AnimatePresence, motion } from "framer-motion";

import CompletedFact from "./CompletedFact";
import TimelineDestination from "./TimelineDestination";
import TimelineNode from "./TimelineNode";
import TodayMarker from "./TodayMarker";
import type { CriterionResult, Profile, RoadmapStep } from "@/lib/types";

const BASE_DELAY = 0.1;
const STEP_DELAY = 0.09;

// Assembles the full bookended journey from raw result data: what's already
// true (completed facts), where she stands (Today), what remains (steps or
// an honest empty message), and where it all leads (the destination). The
// shape of the journey is always visible, whether she's reached the end or not.
function getStepPriority(step: RoadmapStep): 1 | 2 | 3 {
  if (step.reason.includes("member of a Self-Help Group") || step.action.toLowerCase().includes("join")) {
    return 1;
  }
  if (step.eligible_on !== null) {
    return 2;
  }
  return 3;
}

export default function RoadmapTimeline({
  criteria,
  roadmap = [],
  profile = null,
  steps,
  hasBlockers,
  completingReason,
  submittingStep,
  onMarkDone,
}: {
  criteria: CriterionResult[];
  roadmap?: RoadmapStep[];
  profile?: Profile | null;
  steps: RoadmapStep[];
  hasBlockers: boolean;
  completingReason: string | null;
  submittingStep: string | null;
  onMarkDone: (step: RoadmapStep) => void;
}) {
  const completedFacts = criteria.filter((c) => c.met);
  const reached = steps.length === 0 && !hasBlockers;

  let index = 0;
  const nextDelay = () => BASE_DELAY + index++ * STEP_DELAY;

  const priority1 = steps.filter((s) => getStepPriority(s) === 1);
  const priority2 = steps.filter((s) => getStepPriority(s) === 2);
  const priority3 = steps.filter((s) => getStepPriority(s) === 3);

  const renderNode = (step: RoadmapStep) => {
    const criterion = criteria.find((c) => c.rule_text === step.reason) ?? null;
    return (
      <TimelineNode
        key={step.reason}
        step={step}
        criterion={criterion}
        allCriteria={criteria}
        roadmap={roadmap}
        profile={profile}
        completing={completingReason === step.reason}
        submitting={submittingStep === step.reason}
        delay={nextDelay()}
        onMarkDone={step.eligible_on === null ? () => onMarkDone(step) : undefined}
      />
    );
  };

  return (
    <div className="relative">
      {completedFacts.map((criterion) => (
        <CompletedFact key={criterion.id} text={criterion.plain} delay={nextDelay()} />
      ))}

      <TodayMarker delay={nextDelay()} />

      {steps.length === 0 ? (
        <EmptyRow hasBlockers={hasBlockers} delay={nextDelay()} />
      ) : (
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {priority1.length > 0 && (
              <div key="priority-1" className="space-y-4">
                <div className="flex items-center gap-2 pl-12 pb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-dark">
                    Priority 1: Immediate Prerequisites
                  </span>
                </div>
                {priority1.map(renderNode)}
              </div>
            )}

            {priority2.length > 0 && (
              <div key="priority-2" className="space-y-4">
                <div className="flex items-center gap-2 pl-12 pb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand">
                    Priority 2: Clock-Starters (Time-Gated)
                  </span>
                </div>
                {priority2.map(renderNode)}
              </div>
            )}

            {priority3.length > 0 && (
              <div key="priority-3" className="space-y-4">
                <div className="flex items-center gap-2 pl-12 pb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-success">
                    Priority 3: Operational Quick Wins
                  </span>
                </div>
                {priority3.map(renderNode)}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      <TimelineDestination reached={reached} delay={nextDelay() + 0.2} />
    </div>
  );
}

function EmptyRow({ hasBlockers, delay }: { hasBlockers: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className="relative flex gap-4 pb-8"
    >
      <motion.span
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.3, delay }}
        style={{ transformOrigin: "top" }}
        className="absolute left-4 top-8 h-full border-l-2 border-dashed border-line"
        aria-hidden="true"
      />
      <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line" aria-hidden="true" />
      <p className="pt-1 text-sm text-ink-muted">
        {hasBlockers
          ? "There's nothing further to act on for this scheme right now."
          : "Every criterion for this scheme is already verified."}
      </p>
    </motion.div>
  );
}
