import type { Profile, SchemeResult } from "./types";

// A small, dependency-free, deterministic hash (djb2) — not cryptographic,
// not a government or bank ID system. It exists only so that the same
// evaluation always produces the same local reference, and a different
// evaluation produces a different one. Every label attached to its output
// says "local" or "prototype" for exactly this reason: it is never a
// stand-in for a real government-issued identifier.
function deterministicHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

function canonicalize(profile: Profile, result: SchemeResult, fetchedAt: string | null): string {
  return [
    result.scheme_id,
    profile.gender,
    profile.state,
    profile.district ?? "",
    profile.business_type,
    profile.is_shg_member,
    profile.shg_months_active ?? "",
    [...profile.documents].sort().join(","),
    result.criteria.map((c) => `${c.id}:${c.met}`).join("|"),
    fetchedAt ?? "",
  ].join("::");
}

export function buildVerificationId(profile: Profile, result: SchemeResult, fetchedAt: string | null): string {
  return `SS-${deterministicHash(canonicalize(profile, result, fetchedAt))}`;
}

export function buildLedgerReference(profile: Profile, result: SchemeResult, fetchedAt: string | null): string {
  return `LEDGER-${deterministicHash(`ledger::${canonicalize(profile, result, fetchedAt)}`)}`;
}
