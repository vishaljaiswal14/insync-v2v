"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ApplicantSummaryTable from "@/components/proposal/ApplicantSummaryTable";
import CertificateBlock from "@/components/proposal/CertificateBlock";
import DocumentSection from "@/components/proposal/DocumentSection";
import EligibilitySummaryBlock from "@/components/proposal/EligibilitySummaryBlock";
import OutstandingRequirementsTable from "@/components/proposal/OutstandingRequirementsTable";
import ProposalMasthead from "@/components/proposal/ProposalMasthead";
import RuleReferencesTable from "@/components/proposal/RuleReferencesTable";
import SupportingEvidenceList from "@/components/proposal/SupportingEvidenceList";
import VerificationBlock from "@/components/proposal/VerificationBlock";
import ProposalSection from "@/components/ProposalSection";
import SourceChip from "@/components/SourceChip";
import { useAssessment } from "@/context/AssessmentContext";
import { generateProposal, getSchemes } from "@/lib/api";
import type { Profile, ProposalResponse, SchemeMetadata, SchemeResult } from "@/lib/types";

export default function ProposalPage() {
  const router = useRouter();
  const { state } = useAssessment();

  useEffect(() => {
    if (state.hydrated && !state.result) router.replace("/assess");
  }, [state.hydrated, state.result, router]);

  if (!state.hydrated) return null;
  if (!state.result || !state.profile) return null;

  return (
    <ProposalDocument result={state.result} profile={state.profile} resultFetchedAt={state.resultFetchedAt} />
  );
}

function ProposalDocument({
  result,
  profile,
  resultFetchedAt,
}: {
  result: SchemeResult;
  profile: Profile;
  resultFetchedAt: string | null;
}) {
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemeMeta, setSchemeMeta] = useState<SchemeMetadata | null>(null);

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

  // The dossier assembles itself the moment she arrives — the rest of the
  // document (all seven other sections) is already fully deterministic and
  // renders immediately regardless of whether this one AI call succeeds.
  useEffect(() => {
    handleGenerate();
    getSchemes()
      .then((schemes) => setSchemeMeta(schemes.find((s) => s.scheme_id === result.scheme_id) ?? null))
      .catch(() => setSchemeMeta(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-paper py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-6 print:max-w-none print:px-0">
        <div className="rounded-sm border border-line bg-white px-6 py-8 shadow-card md:px-12 md:py-10 print:border-0 print:px-0 print:py-0 print:shadow-none">
          <ProposalMasthead schemeName={result.scheme_name} printReady={!generating} />

          <DocumentSection index={1} title="Applicant Summary">
            <ApplicantSummaryTable profile={profile} result={result} resultFetchedAt={resultFetchedAt} />
          </DocumentSection>

          <DocumentSection index={2} title="Eligibility Summary">
            <EligibilitySummaryBlock criteria={result.criteria} roadmap={result.roadmap} />
          </DocumentSection>

          <DocumentSection index={3} title="Outstanding Requirements">
            <OutstandingRequirementsTable criteria={result.criteria} roadmap={result.roadmap} />
          </DocumentSection>

          <DocumentSection index={4} title="Supporting Evidence">
            <SupportingEvidenceList criteria={result.criteria} />
          </DocumentSection>

          <DocumentSection index={5} title="Generated Proposal">
            {generating && !proposal && <p className="text-sm text-ink-muted">Preparing the application narrative…</p>}

            {error && !proposal && (
              <div className="space-y-2">
                <p className="text-sm text-amber">{error}</p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-sm font-semibold text-brand hover:underline print:hidden"
                >
                  Try again
                </button>
              </div>
            )}

            {proposal && (
              <div className="space-y-6">
                {proposal.sections.map((section) => (
                  <ProposalSection key={section.title} title={section.title} aiGenerated={proposal.ai_generated}>
                    {section.content}
                  </ProposalSection>
                ))}
                {proposal.citations.length > 0 && (
                  <div>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-faint mb-2">
                      Sources cited in this proposal
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {proposal.citations.map((citation) => (
                        <SourceChip key={citation.url} label={citation.label} url={citation.url} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DocumentSection>

          <DocumentSection index={6} title="Rule References">
            <RuleReferencesTable criteria={result.criteria} />
          </DocumentSection>

          <DocumentSection index={7} title="Verification">
            <VerificationBlock
              profile={profile}
              result={result}
              resultFetchedAt={resultFetchedAt}
              schemeMeta={schemeMeta}
              proposal={proposal}
            />
          </DocumentSection>

          <CertificateBlock profile={profile} result={result} resultFetchedAt={resultFetchedAt} />
        </div>
      </div>
    </div>
  );
}
