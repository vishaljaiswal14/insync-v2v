"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AssessmentForm from "@/components/AssessmentForm";
import { useAssessment } from "@/context/AssessmentContext";
import type { Profile } from "@/lib/types";

export default function AssessPage() {
  const router = useRouter();
  const { state, submitProfile } = useAssessment();
  const [isReplaying, setIsReplaying] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

  async function handleSubmit(profile: Profile) {
    try {
      setIsReplaying(true);
      await submitProfile(profile);
    } catch (err) {
      setIsReplaying(false);
      console.error("Evaluation failed", err);
    }
  }

  useEffect(() => {
    if (isReplaying && state.result) {
      const result = state.result;
      const profile = state.profile;

      const logs: string[] = [];
      logs.push("Mission Shakti Eligibility Engine v1.2");
      logs.push("");
      logs.push("Loading applicant profile...");
      logs.push("✓ Complete");
      logs.push("");
      logs.push("Verifying identity...");

      const gender = result.criteria.find((c) => c.id === "gender_female");
      if (gender) {
        logs.push(gender.met ? "✓ Gender verified" : "✗ Gender mismatch");
      }

      logs.push("");
      logs.push("Verifying scheme requirements...");

      const resident = result.criteria.find((c) => c.id === "odisha_resident");
      if (resident) {
        logs.push(resident.met ? "✓ Odisha residency verified" : "✗ Odisha residency check failed");
      }

      const shgMember = result.criteria.find((c) => c.id === "shg_member");
      if (shgMember) {
        logs.push(shgMember.met ? "✓ SHG membership registered" : "✗ SHG membership not found");
      }

      const shgAge = result.criteria.find((c) => c.id === "shg_age_6m");
      if (shgAge) {
        if (shgAge.met) {
          logs.push("✓ SHG active age verified");
        } else if (shgMember && shgMember.met) {
          const months = profile?.shg_months_active ?? 0;
          logs.push(`✗ SHG active period: ${months} month${months === 1 ? "" : "s"}`);
        } else {
          logs.push("✗ SHG active age unchecked (Membership missing)");
        }
      }

      logs.push("");
      logs.push("Applying Rule MS-04...");
      logs.push("Decision:");

      const blockers = result.criteria.filter((c) => !c.met && !c.fixable);
      const unmetCriteria = result.criteria.filter((c) => !c.met);

      let decision = "Eligible";
      if (blockers.length > 0) {
        decision = "Eligibility Blocked";
      } else if (unmetCriteria.length > 0) {
        decision = "Eligibility Deferred";
      }
      logs.push(decision);
      logs.push("");

      if (decision === "Eligibility Blocked") {
        logs.push("Reason:");
        logs.push(blockers[0].rule_text);
      } else if (decision === "Eligibility Deferred") {
        logs.push("Reason:");
        if (shgMember && !shgMember.met) {
          logs.push("Missing Self-Help Group registration prerequisite.");
        } else if (shgAge && !shgAge.met) {
          const months = profile?.shg_months_active ?? 0;
          logs.push(`SHG membership active for ${months} month${months === 1 ? "" : "s"}.`);
          logs.push("Minimum required: 6 months.");
          logs.push("");
          logs.push("Next milestone:");
          const step = result.roadmap.find((s) => s.reason === shgAge.rule_text);
          if (step && step.eligible_on) {
            const targetDate = new Date(step.eligible_on).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            logs.push(targetDate);
          } else {
            logs.push("6 active months complete");
          }
        } else {
          logs.push(`Missing documentation or financials (${unmetCriteria.length} outstanding rules).`);
        }
      } else {
        logs.push("All verified criteria satisfied.");
      }

      logs.push("");
      logs.push("Generating personalized roadmap...");
      logs.push("✓ Complete");
      logs.push("");
      logs.push("Preparing explainability...");
      logs.push("✓ Complete");
      logs.push("");
      logs.push("Ready");

      let currentLine = 0;
      setDisplayedLogs([]);

      const printNextLine = () => {
        if (currentLine < logs.length) {
          const line = logs[currentLine];
          setDisplayedLogs((prev) => [...prev, line]);
          currentLine++;

          let delay = 100;
          if (line.startsWith("Verifying") || line.startsWith("Applying") || line.startsWith("Generating")) {
            delay = 250;
          } else if (line.startsWith("Decision:") || line === "Ready") {
            delay = 300;
          }

          setTimeout(printNextLine, delay);
        } else {
          setTimeout(() => {
            router.push("/results");
          }, 800);
        }
      };

      printNextLine();
    }
  }, [isReplaying, state.result, state.profile, router]);

  if (isReplaying && state.result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6 font-sans">
        <div className="w-full max-w-lg rounded-xl border border-line bg-white p-6 shadow-card min-h-[460px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-line pb-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-muted">
                Official Verification Sandbox
              </span>
              <h2 className="font-serif text-lg font-semibold text-ink mt-1">
                Mission Shakti Eligibility Engine
              </h2>
            </div>

            <div className="font-mono text-[11px] text-ink leading-relaxed space-y-1.5 select-none">
              {displayedLogs.map((log, index) => {
                if (log === "") return <div key={index} className="h-2" />;
                if (log.startsWith("Mission Shakti")) return null;

                let textColor = "text-ink-muted";
                let decoration = "";

                if (log.startsWith("✓")) {
                  textColor = "text-success font-semibold";
                } else if (log.startsWith("✗")) {
                  textColor = "text-amber font-semibold";
                } else if (log === "Eligibility Deferred" || log === "Eligibility Blocked") {
                  textColor = "text-amber font-bold uppercase tracking-wide text-xs";
                  decoration = "bg-amber-light/20 border border-amber-border/40 px-2 py-1 rounded inline-block mt-1";
                } else if (log === "Eligible") {
                  textColor = "text-success font-bold uppercase tracking-wide text-xs";
                  decoration = "bg-success/10 border border-success/20 px-2 py-1 rounded inline-block mt-1";
                } else if (
                  log === "Decision" ||
                  log === "Reason" ||
                  log === "Next milestone" ||
                  log === "Verifying identity..." ||
                  log === "Verifying scheme requirements..." ||
                  log === "Applying Rule MS-04..."
                ) {
                  textColor = "text-ink font-bold uppercase text-[9px] tracking-wider mt-4 block border-b border-line pb-0.5";
                }

                return (
                  <div key={index} className={`${textColor} ${decoration}`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[10px] text-ink-faint font-mono uppercase tracking-wider">
            <span>Engine Sandbox v1.2</span>
            <span className="animate-pulse text-brand font-semibold">Running Compliance Audit...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-xl px-6 pt-10 text-center font-sans">
        <h1 className="font-serif text-2xl font-semibold text-ink">Tell us about your business</h1>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
          Two minutes, no login. Nothing is saved — this stays on your device.
        </p>
      </div>

      <AssessmentForm
        onSubmit={handleSubmit}
        submitting={state.status === "loading"}
        initialProfile={state.profile}
      />

      {state.status === "error" && (
        <p className="mx-auto max-w-xl px-6 text-center text-sm font-medium text-amber">{state.error}</p>
      )}
    </div>
  );
}
