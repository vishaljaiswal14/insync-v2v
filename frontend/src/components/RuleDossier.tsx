"use client";

import { useState } from "react";

import ConfidenceBadge from "./ConfidenceBadge";
import SourceChip from "./SourceChip";
import Tag from "./ui/Tag";
import VerifyDigiLockerButton from "./VerifyDigiLockerButton";
import { explainCriterion } from "@/lib/api";
import { categoryDisplayName, computeSingleFixImpact } from "@/lib/readiness";
import { DOCUMENT_CRITERION_IDS, evidenceLabelFor, ruleEffort } from "@/lib/ledger";
import { useAssessment } from "@/context/AssessmentContext";
import type { CriterionResult, ExplainResponse, Profile, RoadmapStep } from "@/lib/types";

// Replaces ExplainDisclosure. Where that component asked the AI to narrate a
// whole criterion in one paragraph, this answers each question with the
// most deterministic source available — rule_text, fix_action, the roadmap's
// own computed eligible_on date, a readiness delta replayed from the same
// math the what-if simulator already uses — and only falls back to a
// labeled AI sentence for the one question that's genuinely narrative ("why
// does this matter, in plain language"). Nothing here is ever generated
// beyond that one clearly-badged paragraph.
export default function RuleDossier({
  criterion,
  allCriteria,
  roadmapStep,
  profile,
  compact = false,
  hideRuleText = false,
  hideCitation = false,
}: {
  criterion: CriterionResult;
  allCriteria: CriterionResult[];
  roadmapStep?: RoadmapStep | null;
  profile?: Profile | null;
  compact?: boolean;
  /** Suppress the rule-text quote — used where the caller already shows it (e.g. CriterionCard's own document column). */
  hideRuleText?: boolean;
  /** Suppress the citation/rule-id footer — used for the same reason. */
  hideCitation?: boolean;
}) {
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [explaining, setExplaining] = useState(false);
  const { state, verifyDocument } = useAssessment();

  async function handleExplain() {
    setExplaining(true);
    try {
      const response = await explainCriterion(criterion);
      setExplanation(response);
    } finally {
      setExplaining(false);
    }
  }

  const evidence = profile !== undefined ? evidenceLabelFor(criterion, profile ?? null) : null;
  const impact = !criterion.met && criterion.fixable ? computeSingleFixImpact(allCriteria, criterion.id) : null;
  const label = compact ? "text-[11px]" : "text-xs";
  const body = compact ? "text-xs" : "text-sm";

  // Mock DigiLocker verification only ever applies to a document-backed,
  // already self-declared-true criterion — you can't "verify" a document
  // the rule isn't about, or one she hasn't claimed to have yet.
  const documentId = DOCUMENT_CRITERION_IDS[criterion.id];
  const isDocumentCriterion = documentId !== undefined;
  const isVerified = isDocumentCriterion && state.verifiedDocuments.includes(documentId);

  return (
    <div className="space-y-3">
      {/* Why checked — the official rule, always deterministic */}
      {!hideRuleText && (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`${label} font-semibold uppercase tracking-wider text-ink-muted`}>Why this was checked</span>
            <ConfidenceBadge variant="rule" />
          </div>
          <p className={`${body} italic text-ink-muted leading-relaxed`}>&ldquo;{criterion.rule_text}&rdquo;</p>
        </div>
      )}

      {/* Why passed/failed — deterministic plain-language result */}
      <div className="space-y-1">
        <span className={`${label} font-semibold uppercase tracking-wider text-ink-muted`}>
          {criterion.met ? "Why this passed" : "Why this hasn't passed yet"}
        </span>
        <p className={`${body} text-ink leading-relaxed`}>{criterion.plain}</p>
      </div>

      {/* Evidence used — self-declared by default, upgradable to a mocked
          DigiLocker verification for document-backed criteria. Never
          confused with the rule engine's own verified decision above. */}
      {evidence && (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`${label} font-semibold uppercase tracking-wider text-ink-muted`}>Evidence used</span>
            <ConfidenceBadge variant={isVerified ? "verified" : "user"} />
          </div>
          <p className={`${body} text-ink-muted leading-relaxed`}>{evidence}</p>
          {isDocumentCriterion && criterion.met && (
            <VerifyDigiLockerButton verified={isVerified} onVerify={() => verifyDocument(documentId)} compact={compact} />
          )}
        </div>
      )}

      {/* What to do + estimated time & effort — omitted entirely for structural blockers */}
      {!criterion.met && criterion.fixable && (
        <div className="rounded bg-amber-light/30 border border-amber-border/40 p-2.5 space-y-1">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber">What to do</span>
          <p className={`${body} font-medium text-ink`}>{criterion.fix_action}</p>
          
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber pt-1">
            Typical effort (guidance)
          </span>
          <p className={`${body} text-ink-muted leading-relaxed`}>{ruleEffort(criterion.id)}</p>
          <p className="text-[10px] text-ink-faint italic">
            General guidance only — not a verified estimate from the scheme.
          </p>

          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber pt-1">
            Estimated time
          </span>
          <p className={`${body} text-ink-muted`}>
            {roadmapStep?.eligible_on
              ? `Eligible on ${new Date(roadmapStep.eligible_on).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`
              : "Can be resolved immediately — no waiting period."}
          </p>

          {criterion.meanwhile && (
            <>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber pt-1">
                Action while waiting
              </span>
              <p className={`${body} text-ink-muted italic`}>{criterion.meanwhile}</p>
            </>
          )}
        </div>
      )}

      {/* Unlocks — a real, computed delta. Shown per-category, not "overall":
          with 9 total criteria, resolving any single one always moves the
          overall score by the same 1/9 — showing that number would read as
          suspicious/repetitive on every criterion. The category delta
          actually varies by how many criteria that category has, which is
          what makes it meaningful evidence of *this* rule's specific impact. */}
      {impact && impact.deltaCategory > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${label} font-semibold uppercase tracking-wider text-ink-muted`}>If resolved</span>
          <Tag variant="success">
            +{impact.deltaCategory}% {categoryDisplayName(impact.categoryLabel)} readiness
          </Tag>
        </div>
      )}

      {/* Official citation + rule id */}
      {!hideCitation && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line">
          <SourceChip label={criterion.source} url={criterion.source_url} />
          <span className="font-mono text-[10px] text-ink-faint">
            [{criterion.id.toUpperCase().replace(/_/g, "-")}]
          </span>
        </div>
      )}

      {/* AI explanation — the only generated content here, clearly separate and labeled */}
      <div className="pt-1">
        {explanation ? (
          <div className="rounded-lg border border-dashed border-accent/30 bg-accent/5 p-3">
            <div className="mb-1.5">
              <ConfidenceBadge variant={explanation.ai_generated ? "ai" : "rule"} />
            </div>
            <p className={`${body} text-ink-muted leading-relaxed`}>{explanation.explanation}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleExplain}
            disabled={explaining}
            className={`${label} font-semibold text-brand hover:text-brand-dark hover:underline disabled:opacity-50 transition-colors`}
          >
            {explaining ? "Thinking…" : "Explain this in plain language"}
          </button>
        )}
      </div>
    </div>
  );
}
