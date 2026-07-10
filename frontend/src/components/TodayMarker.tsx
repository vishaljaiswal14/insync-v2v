"use client";

import { motion } from "framer-motion";

// The explicit "you are here" anchor between what's already resolved and
// what's ahead. Not a step, not a card — a labeled position on the spine,
// so the journey has a legible start, not just an open-ended list.
export default function TodayMarker({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className="relative flex items-center gap-4 pb-6"
    >
      <motion.span
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.3, delay }}
        style={{ transformOrigin: "top" }}
        className="absolute left-4 top-8 h-full border-l-2 border-dashed border-line"
        aria-hidden="true"
      />
      <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Today</span>
    </motion.div>
  );
}
