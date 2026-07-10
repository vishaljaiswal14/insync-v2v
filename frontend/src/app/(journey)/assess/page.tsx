"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AssessmentForm from "@/components/AssessmentForm";
import { useAssessment } from "@/context/AssessmentContext";
import { SAMPLE_PROFILES } from "@/lib/sampleProfiles";
import type { Profile, SchemeResult } from "@/lib/types";

// Builds the replay log entirely from the real /evaluate response — one
// entry per item in `result.criteria`, in the order the backend returned
// them. There is no hardcoded rule id, no cherry-picked subset: whatever the
// rule engine actually decided is exactly what gets typed out. This is the
// creation event of the Decision Ledger — by the time this finishes, the
// same `result.criteria` array is already what the docked Ledger pill in
// the header reads from.
function buildReplayLog(result: SchemeResult): string[] {
  const logs: string[] = [];
  logs.push("Loading applicant profile...");
  logs.push("✓ Complete");
  logs.push("");
  logs.push(`Checking rules against the ${result.scheme_name}...`);
  logs.push("");

  result.criteria.forEach((criterion) => {
    logs.push(`[${criterion.id.toUpperCase().replace(/_/g, "-")}] ${criterion.rule_text}`);
    if (criterion.met) {
      logs.push(`✓ ${criterion.plain}`);
    } else if (criterion.fixable) {
      logs.push(`○ ${criterion.plain}`);
    } else {
      logs.push(`◆ ${criterion.plain}`);
    }
    logs.push("");
  });

  const blockers = result.criteria.filter((c) => !c.met && !c.fixable);
  const unmetCriteria = result.criteria.filter((c) => !c.met);
  const metCount = result.criteria.filter((c) => c.met).length;

  let decision = "Eligible";
  if (blockers.length > 0) {
    decision = "Eligibility Blocked";
  } else if (unmetCriteria.length > 0) {
    decision = "Eligibility Deferred";
  }

  logs.push("Decision:");
  logs.push(decision);
  logs.push("");
  logs.push(`${metCount} of ${result.criteria.length} rules verified.`);
  logs.push("");
  logs.push("Ready");

  return logs;
}

export default function AssessPage() {
  const router = useRouter();
  const { state, submitProfile } = useAssessment();
  const [isReplaying, setIsReplaying] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  // Guards against React 18 Strict Mode's dev-only double-invoke of effects,
  // which would otherwise start two concurrent reveal timers for the same
  // result and print every line twice. Keyed to the actual result object, so
  // a genuinely new evaluation still replays normally.
  const replayedResultRef = useRef<typeof state.result>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1" && !state.result && state.status === "idle" && !isReplaying) {
        const demoProfile = SAMPLE_PROFILES.find((sample) => sample.id === "sunita_partial")!.profile;
        handleSubmit(demoProfile);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.result, state.status, isReplaying]);

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
    if (isReplaying && state.result && replayedResultRef.current !== state.result) {
      replayedResultRef.current = state.result;
      const logs = buildReplayLog(state.result);

      let currentLine = 0;
      setDisplayedLogs([]);

      const printNextLine = () => {
        if (currentLine < logs.length) {
          const line = logs[currentLine];
          setDisplayedLogs((prev) => [...prev, line]);
          currentLine++;

          let delay = 100;
          if (line.startsWith("Checking rules")) {
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
  }, [isReplaying, state.result, router]);

  if (isReplaying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6 font-sans">
        <div className="w-full max-w-lg rounded-xl border border-line bg-white p-6 shadow-card min-h-[460px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-line pb-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-muted">
                Decision Ledger — Live Replay
              </span>
              <h2 className="font-serif text-lg font-semibold text-ink mt-1">
                {state.result ? state.result.scheme_name : "Evaluating profile..."}
              </h2>
            </div>

            <div className="font-mono text-[11px] text-ink leading-relaxed space-y-1.5 select-none">
              {!state.result ? (
                <div className="text-ink-muted animate-pulse">Connecting to deterministic engine...</div>
              ) : (
                displayedLogs.map((log, index) => {
                  if (log === "") return <div key={index} className="h-2" />;

                  let textColor = "text-ink-muted";
                  let decoration = "";

                  if (log.startsWith("✓")) {
                    textColor = "text-success font-semibold";
                  } else if (log.startsWith("○")) {
                    textColor = "text-accent font-semibold";
                  } else if (log.startsWith("◆")) {
                    textColor = "text-ink-faint font-semibold";
                  } else if (log.startsWith("[")) {
                    textColor = "text-ink-faint";
                  } else if (log === "Eligibility Deferred" || log === "Eligibility Blocked") {
                    textColor = "text-amber font-bold uppercase tracking-wide text-xs";
                    decoration = "bg-amber-light/20 border border-amber-border/40 px-2 py-1 rounded inline-block mt-1";
                  } else if (log === "Eligible") {
                    textColor = "text-success font-bold uppercase tracking-wide text-xs";
                    decoration = "bg-success/10 border border-success/20 px-2 py-1 rounded inline-block mt-1";
                  } else if (log === "Decision:" || log.startsWith("Checking rules against")) {
                    textColor = "text-ink font-bold uppercase text-[9px] tracking-wider mt-4 block border-b border-line pb-0.5";
                  }

                  return (
                    <div key={index} className={`${textColor} ${decoration}`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[10px] text-ink-faint font-mono uppercase tracking-wider">
            <span>Decision Ledger v2</span>
            <span className="animate-pulse text-brand font-semibold">
              {state.result ? "Writing the Ledger..." : "Authenticating..."}
            </span>
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
          Two minutes, no login. Nothing is saved to a server — this stays on your device for this
          session.
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
