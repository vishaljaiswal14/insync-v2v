"use client";

import { motion } from "framer-motion";

interface ChartPoint {
  label: string;
  score: number;
}

export default function ReadinessDeltaChart({ points }: { points: ChartPoint[] }) {
  const chartHeight = 160;
  const zeroY = 180;
  const barWidth = 48;
  const barSpacing = 90;
  const startX = 60;

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card font-sans">
      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-faint">
        Projected readiness after key actions
      </span>
      <p className="mt-1 text-xs text-ink-muted">
        Shows how the most impactful verified actions improve your eligibility score.
      </p>

      <div className="mt-6 flex justify-center">
        <svg viewBox="0 0 400 210" className="w-full max-w-lg h-auto overflow-visible select-none">
          {/* Y-axis gridlines & labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = zeroY - tick * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={45}
                  y1={y}
                  x2={380}
                  y2={y}
                  className="stroke-line"
                  strokeDasharray="2, 2"
                />
                <text
                  x={35}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-ink-faint font-mono text-[8px] font-semibold"
                >
                  {Math.round(tick * 100)}%
                </text>
              </g>
            );
          })}

          {/* Dynamic Bars */}
          {points.map((point, index) => {
            const x = startX + index * barSpacing;
            const barHeight = point.score * chartHeight;
            const y = zeroY - barHeight;

            return (
              <g key={point.label}>
                {/* Bar score text */}
                <motion.text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-ink font-mono text-[10px] font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: y - 6 }}
                  transition={{ duration: 0.3 }}
                >
                  {Math.round(point.score * 100)}%
                </motion.text>

                {/* SVG Rect with spring height transition */}
                <motion.rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  className="fill-brand"
                  initial={{ height: 0, y: zeroY }}
                  animate={{ height: barHeight, y }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
                />

                {/* X-axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={196}
                  textAnchor="middle"
                  className="fill-ink-muted font-mono text-[8px] font-bold uppercase tracking-wider"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
