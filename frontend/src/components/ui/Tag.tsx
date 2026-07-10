// Deliberately not a pill. Shape carries meaning across this app: fully
// rounded means interactive (buttons, cards you act on); this small,
// mostly-square radius means factual (a verified status, never a
// decoration) — reserved for genuinely meaningful states, used sparingly.
const VARIANTS = {
  success: "border-success/30 bg-success-light text-success",
  amber: "border-amber-border bg-amber-light text-amber",
  neutral: "border-line bg-white text-ink-muted",
} as const;

export type TagVariant = keyof typeof VARIANTS;

export default function Tag({ variant = "neutral", children }: { variant?: TagVariant; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
