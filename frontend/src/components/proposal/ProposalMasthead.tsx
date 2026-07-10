"use client";

import { buttonVariants } from "@/components/ui/Button";

// The letterhead. The real scheme name is used verbatim rather than a
// shortened label invented for this header — truncating "Mission Shakti
// Enterprise Grant" down to a stylized "MISSION SHAKTI" would be a small,
// needless fabrication of an official name.
export default function ProposalMasthead({
  schemeName,
  printReady,
}: {
  schemeName: string;
  /** False while the Generated Proposal section is still loading — printing
   *  mid-generation would bake a "Preparing…" placeholder into the PDF. */
  printReady: boolean;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-start justify-between gap-4 border-b-2 border-brand pb-6">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">{schemeName}</p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Application Preparation Dossier
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Prepared by ShaktiScale AI</p>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        disabled={!printReady}
        title={printReady ? undefined : "Preparing the document — available once generation finishes"}
        className={`shrink-0 print:hidden ${buttonVariants("secondary")}`}
      >
        {printReady ? "Print / Save PDF" : "Preparing document…"}
      </button>
    </div>
  );
}
