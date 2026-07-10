// Pure presentation — counts are computed by the caller from real data.
// Always accurate, never decorative: this strip makes the deterministic/AI
// boundary legible at a glance, on every screen that shows evaluated facts.
export default function TrustRail({
  ruleCount,
  sourceCount,
  aiCount = 0,
}: {
  ruleCount: number;
  sourceCount: number;
  aiCount?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full border border-gray-100 bg-gray-50/60 px-4 py-2 text-xs font-medium text-gray-600">
      <span>✓ {ruleCount} Verified by Rule</span>
      <span className="text-gray-300">·</span>
      <span>
        {sourceCount} Official Source{sourceCount === 1 ? "" : "s"}
      </span>
      {aiCount > 0 && (
        <>
          <span className="text-gray-300">·</span>
          <span>{aiCount} AI-Generated</span>
        </>
      )}
    </div>
  );
}
