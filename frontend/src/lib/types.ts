// Mirrors backend/app/schemas — kept in sync by hand since there's no shared
// codegen. If a backend field changes, this is the one place to update.

export type Profile = {
  gender: string;
  state: string;
  district?: string | null;
  business_type: string;
  is_shg_member: boolean;
  shg_months_active?: number | null;
  category?: string | null;
  monthly_revenue?: number | null;
  monthly_expenses?: number | null;
  documents: string[];
};

export type CriterionResult = {
  id: string;
  category: string;
  met: boolean;
  rule_text: string;
  plain: string;
  source: string;
  source_url: string;
  fixable: boolean;
  fix_action: string | null;
  fix_eta_from: string | null;
  target_value: unknown;
  meanwhile: string | null;
};

export type RoadmapStep = {
  order: number;
  action: string;
  reason: string;
  eligible_on: string | null;
  meanwhile: string | null;
  badge: string | null;
  done: boolean;
};

export type SchemeResult = {
  scheme_id: string;
  scheme_name: string;
  grant_readiness: number;
  documentation_readiness: number;
  financial_doc_readiness: number;
  criteria: CriterionResult[];
  roadmap: RoadmapStep[];
};

export type SchemeMetadata = {
  scheme_id: string;
  scheme_name: string;
  grant_type: string;
  version: string;
  last_verified: string;
  official_source: string;
  source_label: string;
  source_url: string;
};

export type ExplainResponse = {
  explanation: string;
  ai_generated: boolean;
  source: string;
  source_url: string;
};

export type ProposalSectionContent = {
  title: string;
  content: string;
};

export type SourceCitation = {
  label: string;
  url: string;
};

export type ProposalResponse = {
  scheme_id: string;
  scheme_name: string;
  ai_generated: boolean;
  sections: ProposalSectionContent[];
  citations: SourceCitation[];
};
