"use client";

import { motion } from "framer-motion";

// The bookend. Deliberately not a card — everything else on this screen
// sits in a white bordered box; this sits directly on the page, because it
// isn't app content, it's a milestone. Reached or not, she can always see
// where the path leads.
export default function TimelineDestination({ reached, delay }: { reached: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex items-center gap-4 pt-2"
    >
      <span
        className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ${
          reached ? "bg-brand text-accent" : "border-2 border-dashed border-line text-ink-faint"
        }`}
        aria-hidden="true"
      >
        {reached ? "★" : "○"}
      </span>
      <div>
        <p className="font-serif text-lg font-semibold text-ink">Application-ready</p>
        <p className="text-sm text-ink-muted">
          {reached ? "Every criterion verified. You're ready to apply." : "Where this path leads."}
        </p>
      </div>
    </motion.div>
  );
}
