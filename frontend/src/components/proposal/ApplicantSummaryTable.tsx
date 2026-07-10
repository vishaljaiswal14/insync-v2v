import ConfidenceBadge from "@/components/ConfidenceBadge";
import { computeCurrentReadiness } from "@/lib/proposalSummary";
import type { Profile, SchemeResult } from "@/lib/types";

// Every row here is a field that already exists on Profile or SchemeResult —
// there is deliberately no "Applicant" name row, because Profile carries no
// name field at all. Inventing one to match a generic template would be
// exactly the kind of fabrication this product exists to avoid.
export default function ApplicantSummaryTable({
  profile,
  result,
  resultFetchedAt,
}: {
  profile: Profile;
  result: SchemeResult;
  resultFetchedAt: string | null;
}) {
  const readiness = computeCurrentReadiness(result.criteria);

  const rows: Array<[string, string]> = [
    ["Gender", capitalize(profile.gender) || "Not provided"],
    ["Category", profile.category ? capitalize(profile.category) : "Not specified"],
    ["Business type", profile.business_type || "Not provided"],
    ["State", profile.state || "Not provided"],
    ["District", profile.district || "Not specified"],
    [
      "SHG membership",
      profile.is_shg_member
        ? `Active — ${profile.shg_months_active ?? 0} month${profile.shg_months_active === 1 ? "" : "s"}`
        : "Not a member",
    ],
    [
      "Monthly revenue",
      profile.monthly_revenue != null ? `₹${profile.monthly_revenue.toLocaleString("en-IN")}` : "Not provided",
    ],
    [
      "Monthly expenses",
      profile.monthly_expenses != null ? `₹${profile.monthly_expenses.toLocaleString("en-IN")}` : "Not provided",
    ],
    ["Current readiness", `${Math.round(readiness * 100)}%`],
    ["Evaluation completed", resultFetchedAt ? formatTimestamp(resultFetchedAt) : "Not recorded"],
  ];

  return (
    <div>
      <div className="mb-4 print:hidden">
        <ConfidenceBadge variant="user" />
      </div>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-line last:border-b-0">
              <th className="w-1/3 py-2.5 pr-4 text-left align-top font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint print:text-ink">
                {label}
              </th>
              <td className="py-2.5 text-ink print:text-ink">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function capitalize(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
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
