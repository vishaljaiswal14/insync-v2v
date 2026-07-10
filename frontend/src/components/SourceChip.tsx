// Distinct from ConfidenceBadge: this isn't a trust signal, it's a citation
// link. "If you can see a number, you can see where it came from" — this
// is the component that makes that literally true, one click away.
export default function SourceChip({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded border border-line bg-paper px-2 py-0.5 font-mono text-[10px] font-medium tracking-tight text-ink-muted transition hover:border-brand/30 hover:text-brand"
    >
      {label}
      <span className="text-[9px]" aria-hidden="true">↗</span>
    </a>
  );
}
