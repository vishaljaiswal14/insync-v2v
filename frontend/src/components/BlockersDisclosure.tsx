"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import CriterionCard from "./CriterionCard";
import type { CriterionResult } from "@/lib/types";

// Zone C of the Roadmap story: "why am I currently ineligible, and what
// can't change." Stated calmly, collapsed by default so it never competes
// with the timeline for attention — but always present, never hidden
// entirely, because a blocker is a fact she deserves to see, not a dead end.
export default function BlockersDisclosure({ blockers }: { blockers: CriterionResult[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 border-t border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left text-sm font-medium text-ink-muted"
      >
        <span>
          {blockers.length} thing{blockers.length === 1 ? "" : "s"} that can&apos;t change for this scheme
        </span>
        <span aria-hidden="true">{open ? "−" : "→"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {blockers.map((criterion) => (
                <CriterionCard key={criterion.id} criterion={criterion} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
