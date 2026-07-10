"use client";

import { motion } from "framer-motion";

const SIZE = 128;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Grant readiness is the headline metric — full brand violet. Documentation
// and Financial-Documentation are supporting completeness checks and stay
// deliberately muted, so hierarchy reads at a glance, not just on close reading.
const TONES = {
  primary: "#6d28d9",
  secondary: "#94a3b8",
} as const;

export default function ReadinessRing({
  score,
  metCount,
  totalCount,
  label,
  tone = "primary",
}: {
  score: number;
  metCount: number;
  totalCount: number;
  label: string;
  tone?: keyof typeof TONES;
}) {
  const offset = CIRCUMFERENCE * (1 - score);
  const color = TONES[tone];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={STROKE_WIDTH} />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-brand-dark">{Math.round(score * 100)}%</span>
          <span className="text-xs text-gray-500">
            {metCount} of {totalCount}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}
