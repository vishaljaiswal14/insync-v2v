"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import BlockersDisclosure from "@/components/BlockersDisclosure";
import RoadmapTimeline from "@/components/RoadmapTimeline";
import TodaySummary from "@/components/TodaySummary";
import { buttonVariants } from "@/components/ui/Button";
import { useAssessment } from "@/context/AssessmentContext";
import type { RoadmapStep } from "@/lib/types";

// The choreography for "mark done" runs entirely in this page: capture the
// pre-update step list, hold it long enough for the completing checkmark to
// register, then release it so the real (shorter) list takes over and the
// ring animates. Neither the API call nor markStepDone's logic changes —
// this only controls what's displayed while that call is in flight.
const MINIMUM_HOLD_MS = 500;

export default function RoadmapPage() {
  const router = useRouter();
  const { state, markStepDone } = useAssessment();
  const [submittingStep, setSubmittingStep] = useState<string | null>(null);
  const [completingReason, setCompletingReason] = useState<string | null>(null);
  const [frozenSteps, setFrozenSteps] = useState<RoadmapStep[] | null>(null);

  useEffect(() => {
    if (!state.result) router.replace("/assess");
  }, [state.result, router]);

  if (!state.result) return null;

  const { result } = state;
  const grantCriteria = result.criteria.filter((c) => c.category === "grant");
  const grantMet = grantCriteria.filter((c) => c.met).length;
  const blockers = result.criteria.filter((c) => !c.met && !c.fixable);
  const displaySteps = frozenSteps ?? result.roadmap;

  async function handleMarkDone(step: RoadmapStep) {
    setFrozenSteps(result!.roadmap);
    setCompletingReason(step.reason);
    setSubmittingStep(step.reason);

    const hold = new Promise((resolve) => setTimeout(resolve, MINIMUM_HOLD_MS));
    await Promise.all([markStepDone(step), hold]);

    setSubmittingStep(null);
    setCompletingReason(null);
    setFrozenSteps(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-32 pt-8">
      <h1 className="font-serif text-2xl font-semibold text-ink">Your path to eligible</h1>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        Verified Scheme — {result.scheme_name}
      </p>

      <div className="mt-6">
        <TodaySummary
          score={result.grant_readiness}
          metCount={grantMet}
          totalCount={grantCriteria.length}
          roadmap={result.roadmap}
          hasBlockers={blockers.length > 0}
        />
      </div>

      {blockers.length > 0 && <BlockersDisclosure blockers={blockers} />}

      <p className="mt-8 text-sm text-ink-muted">
        Every step below is checked against a verified rule — not a guess.
      </p>

      <div className="mt-6">
        <RoadmapTimeline
          criteria={result.criteria}
          steps={displaySteps}
          hasBlockers={blockers.length > 0}
          completingReason={completingReason}
          submittingStep={submittingStep}
          onMarkDone={handleMarkDone}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 p-4 backdrop-blur">
        <Link href="/proposal" className={`mx-auto block max-w-2xl text-center ${buttonVariants("primary")}`}>
          Generate My Proposal
        </Link>
      </div>
    </div>
  );
}
