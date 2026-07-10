import Card from "./ui/Card";
import ReadinessRing from "./ReadinessRing";
import type { RoadmapStep } from "@/lib/types";

// Zone B: the emotional starting point before she walks the timeline.
// Compact and quiet on purpose — this orients, it doesn't perform. The
// timeline below is the screen's dominant element, not this card.
export default function TodaySummary({
  score,
  metCount,
  totalCount,
  roadmap,
  hasBlockers,
}: {
  score: number;
  metCount: number;
  totalCount: number;
  roadmap: RoadmapStep[];
  hasBlockers: boolean;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
      <ReadinessRing score={score} metCount={metCount} totalCount={totalCount} label="Today" size={72} />
      <div className="flex-1 space-y-1 text-center sm:text-left">
        <p className="text-sm font-medium text-ink">
          {roadmap.length} step{roadmap.length === 1 ? "" : "s"} remaining
        </p>
        <p className="text-sm text-ink-muted">{describeEligibilityTiming(roadmap, hasBlockers)}</p>
      </div>
    </Card>
  );
}

function describeEligibilityTiming(roadmap: RoadmapStep[], hasBlockers: boolean): string {
  const dated = roadmap.find((step) => step.eligible_on !== null);
  if (dated?.eligible_on) {
    return `Projected ready by ${formatDate(dated.eligible_on)}`;
  }
  if (roadmap.length > 0) {
    return "No waiting — every remaining step is something you can do today.";
  }
  if (hasBlockers) {
    return "No further steps available for this scheme right now.";
  }
  return "You're application-ready.";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
