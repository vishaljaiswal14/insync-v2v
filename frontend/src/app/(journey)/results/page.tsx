"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import CriterionCard from "@/components/CriterionCard";
import ReadinessDeltaChart from "@/components/ReadinessDeltaChart";
import ReadinessRing from "@/components/ReadinessRing";
import TrustRail from "@/components/TrustRail";
import { buttonVariants } from "@/components/ui/Button";
import { useAssessment } from "@/context/AssessmentContext";
import { countFor, idsForCategory } from "@/lib/readiness";

const CATEGORY_SECTIONS = [
  { key: "grant", title: "Grant Eligibility" },
  { key: "documentation", title: "Documentation" },
  { key: "financial_documentation", title: "Financial Documentation" },
] as const;

// Real, already-computed results stagger in on mount — never a fake spinner
// for /evaluate, which returns in under a second. This is presentation
// pacing, not simulated latency.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function ResultsPage() {
  const router = useRouter();
  const { state, toggleSimulate, resetSimulate, openLedger } = useAssessment();
  const simulatedMetIds = state.simulatedMetIds;

  useEffect(() => {
    if (state.hydrated && !state.result) router.replace("/assess");
  }, [state.hydrated, state.result, router]);

  if (!state.hydrated) return null;
  if (!state.result) return null;

  const { result, profile } = state;
  const sourceCount = new Set(result.criteria.map((c) => c.source_url)).size;

  // Intercept criteria and inject simulated states
  const simulatedCriteria = result.criteria.map((c) => ({
    ...c,
    met: simulatedMetIds.includes(c.id) ? true : c.met,
  }));

  const grant = countFor(simulatedCriteria, "grant");
  const documentation = countFor(simulatedCriteria, "documentation");
  const financial = countFor(simulatedCriteria, "financial_documentation");

  const simulatedGrantReadiness = grant.total > 0 ? grant.met / grant.total : 0;
  const simulatedDocReadiness = documentation.total > 0 ? documentation.met / documentation.total : 0;
  const simulatedFinReadiness = financial.total > 0 ? financial.met / financial.total : 0;

  // Dynamic calculations for the Executive Intelligence Panel
  const blockers = result.criteria.filter((c) => !c.met && !c.fixable);
  const unmetCriteria = simulatedCriteria.filter((c) => !c.met);

  let statusText = "";
  if (blockers.length > 0) {
    statusText = "Blocked — Ineligible";
  } else if (unmetCriteria.length === 0) {
    statusText = "Eligible — Application Ready";
  } else {
    const pendingSteps = result.roadmap.filter((step) =>
      !simulatedMetIds.includes(result.criteria.find((c) => c.rule_text === step.reason)?.id ?? "")
    );
    const dates = pendingSteps
      .map((s) => s.eligible_on)
      .filter((d): d is string => d !== null);
    if (dates.length > 0) {
      const latestDate = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
      const months = Math.ceil((latestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.4));
      statusText = `Ready in ${months} Month${months === 1 ? "" : "s"}`;
    } else {
      statusText = "Action Required";
    }
  }

  let pathText = "";
  if (blockers.length > 0) {
    pathText = "No path available (unfixable structural blocker)";
  } else if (unmetCriteria.length === 0) {
    pathText = "Verify and submit application today";
  } else {
    const pendingSteps = result.roadmap.filter((step) =>
      !simulatedMetIds.includes(result.criteria.find((c) => c.rule_text === step.reason)?.id ?? "")
    );
    const dates = pendingSteps
      .map((s) => s.eligible_on)
      .filter((d): d is string => d !== null);
    if (dates.length > 0) {
      const latestDate = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
      pathText = `Projected eligible on ${latestDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
    } else {
      pathText = "Ready immediately after resolving pending gaps";
    }
  }

  let blockerText = "";
  if (blockers.length > 0) {
    blockerText = `Structural: ${blockers[0].rule_text}`;
  } else if (unmetCriteria.length === 0) {
    blockerText = "None — all requirements satisfied";
  } else {
    const ageGap = unmetCriteria.find((c) => c.id === "shg_age_6m");
    if (ageGap) {
      blockerText = `Time-Gate: ${ageGap.rule_text}`;
    } else {
      const shgMemberGap = unmetCriteria.find((c) => c.id === "shg_member");
      if (shgMemberGap) {
        blockerText = `Prerequisite: ${shgMemberGap.rule_text}`;
      } else {
        blockerText = `Operational Gaps (${unmetCriteria.length} pending)`;
      }
    }
  }

  let impactText = "";
  if (blockers.length > 0) {
    impactText = "None (Structural blocker cannot be resolved)";
  } else if (unmetCriteria.length === 0) {
    impactText = "Submit final application document";
  } else {
    const shgMember = unmetCriteria.find((c) => c.id === "shg_member");
    if (shgMember) {
      impactText = shgMember.fix_action || shgMember.plain;
    } else {
      const ageGap = unmetCriteria.find((c) => c.id === "shg_age_6m");
      if (ageGap) {
        impactText = ageGap.fix_action || ageGap.plain;
      } else {
        const missingDoc = unmetCriteria.find((c) => c.category === "documentation");
        if (missingDoc) {
          impactText = missingDoc.fix_action || missingDoc.plain;
        } else {
          impactText = unmetCriteria[0].fix_action || unmetCriteria[0].plain;
        }
      }
    }
  }

  let quickWinText = "";
  if (blockers.length > 0) {
    quickWinText = "None (Blocked)";
  } else if (unmetCriteria.length === 0) {
    quickWinText = "Submit application";
  } else {
    const fin = unmetCriteria.find((c) => c.id === "has_monthly_revenue" || c.id === "has_monthly_expenses");
    if (fin) {
      quickWinText = fin.fix_action || fin.plain;
    } else {
      const aadhaar = unmetCriteria.find((c) => c.id === "has_aadhaar");
      if (aadhaar) {
        quickWinText = aadhaar.fix_action || aadhaar.plain;
      } else {
        const doc = unmetCriteria.find((c) => c.category === "documentation");
        if (doc) {
          quickWinText = doc.fix_action || doc.plain;
        } else {
          quickWinText = unmetCriteria[0].fix_action || unmetCriteria[0].plain;
        }
      }
    }
  }

  // Derived rule trace IDs for Decision Ledger linking
  let primaryGapId: string | null = null;
  if (blockers.length > 0) {
    primaryGapId = blockers[0].id;
  } else if (unmetCriteria.length > 0) {
    const ageGap = unmetCriteria.find((c) => c.id === "shg_age_6m");
    if (ageGap) {
      primaryGapId = "shg_age_6m";
    } else {
      const shgMemberGap = unmetCriteria.find((c) => c.id === "shg_member");
      if (shgMemberGap) {
        primaryGapId = "shg_member";
      } else {
        primaryGapId = unmetCriteria[0].id;
      }
    }
  }

  let impactGapId: string | null = null;
  if (blockers.length > 0) {
    impactGapId = blockers[0].id;
  } else if (unmetCriteria.length > 0) {
    const shgMember = unmetCriteria.find((c) => c.id === "shg_member");
    if (shgMember) {
      impactGapId = "shg_member";
    } else {
      const ageGap = unmetCriteria.find((c) => c.id === "shg_age_6m");
      if (ageGap) {
        impactGapId = "shg_age_6m";
      } else {
        const missingDoc = unmetCriteria.find((c) => c.category === "documentation");
        if (missingDoc) {
          impactGapId = missingDoc.id;
        } else {
          impactGapId = unmetCriteria[0].id;
        }
      }
    }
  }

  let quickWinId: string | null = null;
  if (blockers.length > 0) {
    quickWinId = blockers[0].id;
  } else if (unmetCriteria.length > 0) {
    const fin = unmetCriteria.find((c) => c.id === "has_monthly_revenue" || c.id === "has_monthly_expenses");
    if (fin) {
      quickWinId = fin.id;
    } else {
      const aadhaar = unmetCriteria.find((c) => c.id === "has_aadhaar");
      if (aadhaar) {
        quickWinId = "has_aadhaar";
      } else {
        const doc = unmetCriteria.find((c) => c.category === "documentation");
        if (doc) {
          quickWinId = doc.id;
        } else {
          quickWinId = unmetCriteria[0].id;
        }
      }
    }
  }

  const metCount = simulatedCriteria.filter((c) => c.met).length;
  const totalCount = simulatedCriteria.length;

  const currentScore = totalCount > 0 ? metCount / totalCount : 0;

  // Compute progressive projection scores
  const docCriteriaIds = result.criteria.filter((c) => c.category === "documentation").map((c) => c.id);
  const withDocsMetCount = simulatedCriteria.filter((c) => c.met || docCriteriaIds.includes(c.id)).length;
  const docsScore = totalCount > 0 ? withDocsMetCount / totalCount : 0;

  const withSHGMetCount = simulatedCriteria.filter((c) =>
    c.met || docCriteriaIds.includes(c.id) || c.id === "shg_member" || c.id === "shg_age_6m"
  ).length;
  const shgScore = totalCount > 0 ? withSHGMetCount / totalCount : 0;

  const chartPoints = [
    { label: "Current", score: currentScore },
    { label: "+ Aadhaar/Docs", score: Math.max(currentScore, docsScore) },
    { label: "+ Join SHG", score: Math.max(currentScore, docsScore, shgScore) },
    { label: "Ready", score: 1.0 },
  ];

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pb-36 pt-10 font-sans">
        <h1 className="font-serif text-3xl font-semibold text-ink">Here&apos;s where you stand</h1>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Verified Scheme</p>
        <p className="mt-1.5 font-serif text-base text-ink-muted leading-relaxed mb-6">
          {result.scheme_name} — a readiness score, not an approval prediction.
        </p>

        {/* Simulation Warning Banner */}
        {simulatedMetIds.length > 0 && (
          <div className="mt-4 mb-6 rounded-lg bg-amber-light border border-amber-border px-4 py-3 text-xs font-semibold text-amber uppercase tracking-wider flex items-center justify-between shadow-sm">
            <span>⚠️ Interactive Mode: Simulating {simulatedMetIds.length} resolved criteria</span>
            <button
              type="button"
              onClick={resetSimulate}
              className="underline hover:text-amber/80 transition-colors"
            >
              Reset Simulation
            </button>
          </div>
        )}

        {/* Executive Intelligence Panel */}
        <div className="rounded-xl border-2 border-brand bg-brand-light p-6 md:p-8 shadow-card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand/10 pb-4">
            <div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand/70">
                Verified Executive Assessment
              </span>
              <h2 className="font-serif text-3xl font-semibold text-brand mt-1">
                {statusText}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openLedger(null)}
              className="rounded-lg bg-white border border-brand/10 hover:border-brand/30 px-4 py-2 text-right transition cursor-pointer group text-left"
            >
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-muted group-hover:text-brand">
                Rules Verified 🔍
              </span>
              <span className="font-mono text-lg font-bold text-brand">
                {metCount} <span className="text-ink-faint font-normal">/ {totalCount}</span>
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                  Fastest Verified Path
                </span>
                <p className="font-serif text-base font-semibold text-brand mt-0.5">
                  {pathText}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                    Primary Gap / Blocker
                  </span>
                  {primaryGapId && (
                    <button
                      type="button"
                      onClick={() => openLedger([primaryGapId])}
                      className="font-mono text-[9px] text-brand hover:underline cursor-pointer font-bold"
                    >
                      [Trace to Rule]
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-ink mt-0.5">
                  {blockerText}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                    Highest Impact Action
                  </span>
                  {impactGapId && (
                    <button
                      type="button"
                      onClick={() => openLedger([impactGapId])}
                      className="font-mono text-[9px] text-brand hover:underline cursor-pointer font-bold"
                    >
                      [Trace to Rule]
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-accent-dark mt-0.5">
                  {impactText}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                    Quickest Win (Instant)
                  </span>
                  {quickWinId && (
                    <button
                      type="button"
                      onClick={() => openLedger([quickWinId])}
                      className="font-mono text-[9px] text-brand hover:underline cursor-pointer font-bold"
                    >
                      [Trace to Rule]
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-ink mt-0.5">
                  {quickWinText}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center border-t border-brand/10 pt-4">
            <TrustRail ruleCount={result.criteria.length} sourceCount={sourceCount} />
          </div>
        </div>

        {/* Dynamic SVG Readiness Delta Chart */}
        <div className="mb-8">
          <ReadinessDeltaChart points={chartPoints} />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <button type="button" onClick={() => openLedger(idsForCategory(result.criteria, "grant"))} className="w-full text-left">
            <ReadinessRing
              score={simulatedGrantReadiness}
              metCount={grant.met}
              totalCount={grant.total}
              label="Grant"
              tone="primary"
            />
          </button>
          <button
            type="button"
            onClick={() => openLedger(idsForCategory(result.criteria, "documentation"))}
            className="w-full text-left"
          >
            <ReadinessRing
              score={simulatedDocReadiness}
              metCount={documentation.met}
              totalCount={documentation.total}
              label="Documentation"
              tone="secondary"
            />
          </button>
          <button
            type="button"
            onClick={() => openLedger(idsForCategory(result.criteria, "financial_documentation"))}
            className="w-full text-left"
          >
            <ReadinessRing
              score={simulatedFinReadiness}
              metCount={financial.met}
              totalCount={financial.total}
              label="Financial Docs"
              tone="secondary"
            />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-faint">Tap a ring to see the rules behind it</p>

        {/* Financial Snapshot — strictly the numbers she entered, no speculation
            about what a reviewer or committee might conclude from them. */}
        {profile && typeof profile.monthly_revenue === "number" && typeof profile.monthly_expenses === "number" && (
          <div className="mt-8 rounded-xl border border-line bg-white p-5 shadow-card font-sans">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-faint">
              Financial Snapshot
            </span>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-line pb-3">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-ink-muted">Monthly Revenue</span>
                <span className="font-mono text-base font-semibold text-ink">₹{profile.monthly_revenue.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-ink-muted">Monthly Expenses</span>
                <span className="font-mono text-base font-semibold text-ink">₹{profile.monthly_expenses.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-ink-muted">Net Surplus</span>
                <span className={`font-mono text-base font-semibold ${profile.monthly_revenue - profile.monthly_expenses >= 0 ? "text-success" : "text-amber"}`}>
                  ₹{(profile.monthly_revenue - profile.monthly_expenses).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-ink-muted">
              {profile.monthly_revenue - profile.monthly_expenses >= 0 ? (
                <p>
                  Your monthly revenue currently exceeds your monthly expenses by ₹
                  {(profile.monthly_revenue - profile.monthly_expenses).toLocaleString("en-IN")}. This is a
                  self-declared figure, shown here exactly as you entered it — it is not an approval
                  probability or a lender&apos;s assessment.
                </p>
              ) : (
                <p>
                  Your monthly expenses currently exceed your monthly revenue by ₹
                  {(profile.monthly_expenses - profile.monthly_revenue).toLocaleString("en-IN")}. This is a
                  self-declared figure, shown here exactly as you entered it — it does not predict
                  whether any grant or loan will be approved. See the roadmap for concrete next steps.
                </p>
              )}
            </div>
          </div>
        )}

        {CATEGORY_SECTIONS.map((section) => {
          const criteria = simulatedCriteria.filter((c) => c.category === section.key);
          if (criteria.length === 0) return null;

          return (
            <div key={section.key} className="mt-12">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted border-b border-line pb-1.5">
                {section.title}
              </h2>
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                {criteria.map((criterion) => {
                  const original = result.criteria.find((c) => c.id === criterion.id);
                  const isOriginallyMet = original ? original.met : false;

                  return (
                    <motion.div key={criterion.id} variants={item}>
                      <CriterionCard
                        criterion={criterion}
                        allCriteria={simulatedCriteria}
                        roadmap={result.roadmap}
                        profile={profile}
                        simulated={simulatedMetIds.includes(criterion.id)}
                        canSimulate={!isOriginallyMet}
                        onToggleSimulate={() => toggleSimulate(criterion.id)}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          );
        })}

        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/98 p-4 shadow-card">
          <Link
            href="/roadmap"
            className={`mx-auto block max-w-3xl text-center ${buttonVariants("primary")}`}
          >
            View My Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
