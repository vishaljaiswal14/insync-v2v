"use client";

import { usePathname, useRouter } from "next/navigation";

// Replaces a nav bar on the journey screens by design — there are no
// destinations to choose between, only forward progress. The segments fill
// as she moves; back is always available and never destructive, since
// AssessmentContext holds state above this layout and survives navigation.
const STEPS = [
  { path: "/assess", label: "Assessment" },
  { path: "/results", label: "Results" },
  { path: "/roadmap", label: "Roadmap" },
  { path: "/proposal", label: "Proposal" },
];

export default function ProgressHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = STEPS.findIndex((step) => step.path === pathname);

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium text-gray-400 transition hover:text-gray-600"
        >
          ← Back
        </button>
        <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuenow={activeIndex + 1} aria-valuemax={STEPS.length}>
          {STEPS.map((step, index) => (
            <div
              key={step.path}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= activeIndex ? "bg-brand" : "bg-gray-100"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
