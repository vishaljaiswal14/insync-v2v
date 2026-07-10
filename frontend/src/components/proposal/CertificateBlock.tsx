import { buildLedgerReference } from "@/lib/verification";
import type { Profile, SchemeResult } from "@/lib/types";

// The closing acknowledgement — deliberately not styled as a badge or seal
// implying an outcome. Its entire purpose is the disclaimer line: this is
// an application preparation aid, not an approval certificate.
export default function CertificateBlock({
  profile,
  result,
  resultFetchedAt,
}: {
  profile: Profile;
  result: SchemeResult;
  resultFetchedAt: string | null;
}) {
  const ledgerRef = buildLedgerReference(profile, result, resultFetchedAt);

  return (
    <section className="pt-8 print:break-inside-avoid">
      <p className="font-serif text-sm italic leading-relaxed text-ink-muted">
        Prepared using deterministic eligibility evaluation. This document summarizes the applicant
        profile, verified rule evaluation, outstanding requirements, and generated proposal.
      </p>
      <p className="mt-2 font-serif text-sm italic leading-relaxed text-ink-muted">
        It is intended as an application preparation aid.{" "}
        <span className="font-semibold not-italic text-ink">It is NOT an approval certificate.</span>
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-double border-ink-faint pt-6">
        <div className="print:text-ink">
          <p className="font-serif text-sm font-semibold text-ink">Verified By</p>
          <p className="mt-1 text-sm text-ink-muted print:text-ink">ShaktiScale AI Copilot</p>
          <p className="font-mono text-[10px] text-ink-faint print:text-ink">Decision Ledger — {ledgerRef}</p>
          <p className="font-mono text-[10px] text-ink-faint print:text-ink">
            Timestamp — {resultFetchedAt ? formatTimestamp(resultFetchedAt) : "Not recorded"}
          </p>
        </div>
        <div className="flex flex-col justify-between">
          <div className="print:text-ink">
            <p className="font-serif text-sm font-semibold text-ink">Applicant Signature</p>
            <p className="mt-1 text-xs text-ink-faint print:text-ink leading-relaxed">
              I confirm that all self-declared information provided in this profile is true and accurate.
            </p>
          </div>
          <div className="mt-6 border-b border-dashed border-ink-faint w-48 h-8"></div>
        </div>
      </div>
    </section>
  );
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
