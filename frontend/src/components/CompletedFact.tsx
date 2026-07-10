"use client";

import { motion } from "framer-motion";

// Facts already true about her, shown above "Today" — the distance already
// covered before this session even started. Deliberately lightweight: no
// card, no citation, no expand. These are settled; the timeline's focus is
// what's ahead, not re-proving what Results already proved.
export default function CompletedFact({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="relative flex gap-4 pb-6"
    >
      <motion.span
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.3, delay }}
        style={{ transformOrigin: "top" }}
        className="absolute left-4 top-8 h-full border-l-2 border-brand/60"
        aria-hidden="true"
      />
      <span
        className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
        aria-hidden="true"
      >
        ✓
      </span>
      <p className="pt-1 text-sm text-ink-muted">{text}</p>
    </motion.div>
  );
}
