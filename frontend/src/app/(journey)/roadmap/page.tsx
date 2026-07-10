"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ReadinessRing from "@/components/ReadinessRing";
import RoadmapTimeline from "@/components/RoadmapTimeline";
import TrustRail from "@/components/TrustRail";
import { useAssessment } from "@/context/AssessmentContext";
import type { RoadmapStep } from "@/lib/types";

export default function RoadmapPage() {
  const router = useRouter();
  const { state, markStepDone } = useAssessment();
  const [submittingStep, setSubmittingStep] = useState<string | null>(null);

  useEffect(() => {
    if (!state.result) router.replace("/assess");
  }, [state.result, router]);

  if (!state.result) return null;

  const { result } = state;
  const grantCriteria = result.criteria.filter((c) => c.category === "grant");
  const grantMet = grantCriteria.filter((c) => c.met).length;
  const sourceCount = new Set(result.criteria.map((c) => c.source_url)).size;

  async function handleMarkDone(step: RoadmapStep) {
    setSubmittingStep(step.reason);
    await markStepDone(step);
    setSubmittingStep(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-32 pt-8">
      <h1 className="text-2xl font-bold text-brand-dark">Your path to eligible</h1>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Verified Scheme — {result.scheme_name}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Every step below closes one real gap. Mark one done and watch your readiness move.
      </p>

      <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-gray-100 p-6">
        <ReadinessRing
          score={result.grant_readiness}
          metCount={grantMet}
          totalCount={grantCriteria.length}
          label="Grant Readiness"
          tone="primary"
        />
        <TrustRail ruleCount={result.criteria.length} sourceCount={sourceCount} />
      </div>

      <div className="mt-10">
        <RoadmapTimeline steps={result.roadmap} submittingStep={submittingStep} onMarkDone={handleMarkDone} />
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 p-4 backdrop-blur">
        <Link
          href="/proposal"
          className="mx-auto block max-w-2xl rounded-lg bg-brand px-6 py-3 text-center font-semibold text-white transition hover:bg-brand-dark"
        >
          Generate My Proposal
        </Link>
      </div>
    </div>
  );
}
