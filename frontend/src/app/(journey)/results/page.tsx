"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import CriterionCard from "@/components/CriterionCard";
import ReadinessRing from "@/components/ReadinessRing";
import TrustRail from "@/components/TrustRail";
import { useAssessment } from "@/context/AssessmentContext";
import type { CriterionResult } from "@/lib/types";

const CATEGORY_SECTIONS = [
  { key: "grant", title: "Grant Eligibility" },
  { key: "documentation", title: "Documentation" },
  { key: "financial_documentation", title: "Financial Documentation" },
] as const;

function countFor(criteria: CriterionResult[], category: string) {
  const matching = criteria.filter((c) => c.category === category);
  return { met: matching.filter((c) => c.met).length, total: matching.length };
}

// Real, already-computed results stagger in on mount — never a fake spinner
// for /evaluate, which returns in under a second. This is presentation
// pacing, not simulated latency.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function ResultsPage() {
  const router = useRouter();
  const { state } = useAssessment();

  useEffect(() => {
    if (!state.result) router.replace("/assess");
  }, [state.result, router]);

  if (!state.result) return null;

  const { result } = state;
  const grant = countFor(result.criteria, "grant");
  const documentation = countFor(result.criteria, "documentation");
  const financial = countFor(result.criteria, "financial_documentation");
  const sourceCount = new Set(result.criteria.map((c) => c.source_url)).size;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-32 pt-8">
      <h1 className="text-2xl font-bold text-brand-dark">Here&apos;s where you stand</h1>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Verified Scheme</p>
      <p className="mt-1 text-sm text-gray-500">
        {result.scheme_name} — a readiness score, not an approval prediction.
      </p>

      <div className="mt-8 flex justify-center">
        <TrustRail ruleCount={result.criteria.length} sourceCount={sourceCount} />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <ReadinessRing
          score={result.grant_readiness}
          metCount={grant.met}
          totalCount={grant.total}
          label="Grant"
          tone="primary"
        />
        <ReadinessRing
          score={result.documentation_readiness}
          metCount={documentation.met}
          totalCount={documentation.total}
          label="Documentation"
          tone="secondary"
        />
        <ReadinessRing
          score={result.financial_doc_readiness}
          metCount={financial.met}
          totalCount={financial.total}
          label="Financial Docs"
          tone="secondary"
        />
      </div>

      {CATEGORY_SECTIONS.map((section) => {
        const criteria = result.criteria.filter((c) => c.category === section.key);
        if (criteria.length === 0) return null;

        return (
          <div key={section.key} className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              {section.title}
            </h2>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {criteria.map((criterion) => (
                <motion.div key={criterion.id} variants={item}>
                  <CriterionCard criterion={criterion} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
      })}

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 p-4 backdrop-blur">
        <Link
          href="/roadmap"
          className="mx-auto block max-w-3xl rounded-lg bg-brand px-6 py-3 text-center font-semibold text-white transition hover:bg-brand-dark"
        >
          View My Roadmap
        </Link>
      </div>
    </div>
  );
}
