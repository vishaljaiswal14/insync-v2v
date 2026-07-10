import ConfidenceBadge from "@/components/ConfidenceBadge";
import QRPlaceholder from "./QRPlaceholder";
import { buildLedgerReference, buildVerificationId } from "@/lib/verification";
import type { Profile, ProposalResponse, SchemeMetadata, SchemeResult } from "@/lib/types";

// Every value here is either read straight from the backend (scheme
// version, last verified date) or deterministically derived from this
// exact evaluation (the two local references) — never a fabricated
// government or bank identifier. See lib/verification.ts for how the two
// reference codes are built.
export default function VerificationBlock({
  profile,
  result,
  resultFetchedAt,
  schemeMeta,
  proposal,
}: {
  profile: Profile;
  result: SchemeResult;
  resultFetchedAt: string | null;
  schemeMeta: SchemeMetadata | null;
  proposal: ProposalResponse | null;
}) {
  const verificationId = buildVerificationId(profile, result, resultFetchedAt);
  const ledgerRef = buildLedgerReference(profile, result, resultFetchedAt);

  const rows: Array<[string, string]> = [
    ["Verification ID (local)", verificationId],
    ["Generated", resultFetchedAt ? formatTimestamp(resultFetchedAt) : "Not recorded"],
    ["Decision Ledger reference", ledgerRef],
    [
      "Scheme rule version",
      schemeMeta ? `${schemeMeta.version} — last verified ${schemeMeta.last_verified}` : "Not available",
    ],
    ["Evaluation completed", resultFetchedAt ? "Yes" : "No"],
  ];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto]">
      <div>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-line last:border-b-0 print:break-inside-avoid">
                <th className="w-1/2 py-2.5 pr-4 text-left align-top font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {label}
                </th>
                <td className="py-2.5 font-mono text-xs text-ink">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex flex-wrap gap-2">
          <ConfidenceBadge variant="rule" />
          <ConfidenceBadge variant={proposal?.ai_generated ? "ai" : "rule"} />
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Deterministic engine: every eligibility decision above. AI explanation layer:{" "}
          {proposal?.ai_generated
            ? "used to draft the narrative proposal text in section 5."
            : "not used for this document — a deterministic template was used instead."}
        </p>
      </div>

      <QRPlaceholder seed={verificationId} />
    </div>
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
