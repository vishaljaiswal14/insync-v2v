import type {
  CriterionResult,
  ExplainResponse,
  Profile,
  ProposalResponse,
  SchemeMetadata,
  SchemeResult,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getSchemes(): Promise<SchemeMetadata[]> {
  return request<SchemeMetadata[]>("/schemes");
}

export function evaluateProfile(
  profile: Profile,
  schemeIds: string[],
): Promise<{ results: SchemeResult[] }> {
  return request<{ results: SchemeResult[] }>("/evaluate", {
    method: "POST",
    body: JSON.stringify({ profile, scheme_ids: schemeIds }),
  });
}

export function explainCriterion(criterion: CriterionResult, language = "en"): Promise<ExplainResponse> {
  return request<ExplainResponse>("/explain", {
    method: "POST",
    body: JSON.stringify({ criterion, language }),
  });
}

export function generateProposal(
  profile: Profile,
  result: SchemeResult,
  language = "en",
): Promise<ProposalResponse> {
  return request<ProposalResponse>("/proposal", {
    method: "POST",
    body: JSON.stringify({ profile, result, verified: true, language }),
  });
}
