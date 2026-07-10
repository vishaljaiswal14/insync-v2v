"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProposalSection from "@/components/ProposalSection";
import SourceChip from "@/components/SourceChip";
import TrustRail from "@/components/TrustRail";
import { useAssessment } from "@/context/AssessmentContext";
import { generateProposal } from "@/lib/api";
import type { Profile, ProposalResponse, SchemeResult } from "@/lib/types";

export default function ProposalPage() {
  const router = useRouter();
  const { state } = useAssessment();

  useEffect(() => {
    if (!state.result) router.replace("/assess");
  }, [state.result, router]);

  if (!state.result || !state.profile) return null;

  const { result, profile } = state;
  const sourceCount = new Set(result.criteria.map((c) => c.source_url)).size;

  return <ProposalContent result={result} profile={profile} sourceCount={sourceCount} />;
}

function ProposalContent({
  result,
  profile,
  sourceCount,
}: {
  result: SchemeResult;
  profile: Profile;
  sourceCount: number;
}) {
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const response = await generateProposal(profile, result);
      setProposal(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate a proposal right now.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-8">
      <h1 className="text-2xl font-bold text-brand-dark">Your proposal</h1>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Verified Scheme — {result.scheme_name}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Drafted only from your verified information — nothing invented, nothing beyond what&apos;s
        already on the Results screen.
      </p>

      {!proposal && (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-500">
            Ready when you are. This uses only what&apos;s already verified — your profile and the{" "}
            {result.criteria.length} rule results above.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {generating ? "Drafting…" : "Generate My Proposal"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      {proposal && (
        <div className="mt-8 space-y-4">
          <TrustRail
            ruleCount={result.criteria.length}
            sourceCount={sourceCount}
            aiCount={proposal.ai_generated ? proposal.sections.length : 0}
          />
          {proposal.sections.map((section) => (
            <ProposalSection key={section.title} title={section.title} aiGenerated={proposal.ai_generated}>
              {section.content}
            </ProposalSection>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            {proposal.citations.map((citation) => (
              <SourceChip key={citation.url} label={citation.label} url={citation.url} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          What&apos;s verified so far
        </h2>
        <TrustRail ruleCount={result.criteria.length} sourceCount={sourceCount} />
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-400">Business</dt>
            <dd className="text-gray-700">{profile.business_type}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Location</dt>
            <dd className="text-gray-700">
              {profile.district ? `${profile.district}, ` : ""}
              {profile.state}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">Grant readiness</dt>
            <dd className="text-gray-700">{Math.round(result.grant_readiness * 100)}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
