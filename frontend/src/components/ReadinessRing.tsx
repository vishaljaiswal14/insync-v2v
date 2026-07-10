"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STROKE_WIDTH = 10;

// Grant readiness is the headline metric — full institutional navy.
// Documentation and Financial-Documentation are supporting completeness
// checks and stay deliberately muted, so hierarchy reads at a glance.
const TONES = {
  primary: "#122B4E",
  secondary: "#B6AF9C",
} as const;

export default function ReadinessRing({
  score,
  metCount,
  totalCount,
  label,
  tone = "primary",
  size = 128,
}: {
  score: number;
  metCount: number;
  totalCount: number;
  label: string;
  tone?: keyof typeof TONES;
  size?: number;
}) {
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);
  const color = TONES[tone];

  // A brief, precise acknowledgment of change — not celebration, just a
  // legible delta — fading in and out on its own. Never fires on first
  // render, only when a real recompute moves the score.
  const previousScore = useRef(score);
  const [delta, setDelta] = useState<number | null>(null);
  useEffect(() => {
    const previous = previousScore.current;
    if (previous !== score) {
      const points = Math.round((score - previous) * 100);
      previousScore.current = score;
      if (points !== 0) {
        setDelta(points);
        const timer = setTimeout(() => setDelta(null), 1600);
        return () => clearTimeout(timer);
      }
    }
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E4DCCE" strokeWidth={STROKE_WIDTH} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={size >= 100 ? "text-2xl font-semibold text-ink" : "text-lg font-semibold text-ink"}>
            {Math.round(score * 100)}%
          </span>
          <span className="text-xs text-ink-muted">
            {metCount} of {totalCount}
          </span>
        </div>
        {delta !== null && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -right-2 -top-1 rounded-md bg-white px-1.5 py-0.5 text-xs font-semibold text-success shadow-card"
          >
            {delta > 0 ? `+${delta}%` : `${delta}%`}
          </motion.span>
        )}
      </div>
      <span className="text-sm font-medium text-ink-muted">{label}</span>
    </div>
  );
}
