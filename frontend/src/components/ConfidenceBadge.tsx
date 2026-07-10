// The trust boundary made visible. "rule" and "user" share one flat,
// official visual language; "ai" deliberately breaks it with a soft
// gradient — so a reader can tell "fact" from "AI phrasing" by texture
// alone, without reading a word. Never used for the "Official Source"
// citation itself — that's SourceChip's job.
const VARIANTS = {
  rule: {
    label: "Verified by Rule",
    className: "border border-brand/20 bg-brand/5 text-brand",
  },
  user: {
    label: "Verified by User",
    className: "border border-line bg-paper text-ink-muted",
  },
  ai: {
    label: "AI Generated",
    className: "border border-dashed border-accent/40 bg-accent/5 text-accent-dark",
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
