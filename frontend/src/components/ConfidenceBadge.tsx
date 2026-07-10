// The trust boundary made visible. "rule" and "user" share one flat,
// official visual language; "ai" deliberately breaks it with a soft
// gradient — so a reader can tell "fact" from "AI phrasing" by texture
// alone, without reading a word. Never used for the "Official Source"
// citation itself — that's SourceChip's job.
const VARIANTS = {
  rule: {
    label: "Verified by Rule",
    className: "border border-brand/30 bg-brand/5 text-brand-dark",
  },
  user: {
    label: "Verified by User",
    className: "border border-gray-300 bg-gray-50 text-gray-600",
  },
  ai: {
    label: "AI Generated",
    className: "bg-gradient-to-r from-brand/15 to-accent/15 text-brand-dark",
  },
} as const;

export type ConfidenceVariant = keyof typeof VARIANTS;

export default function ConfidenceBadge({ variant }: { variant: ConfidenceVariant }) {
  const { label, className } = VARIANTS[variant];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
