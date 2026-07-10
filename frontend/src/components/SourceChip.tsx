// Distinct from ConfidenceBadge: this isn't a trust signal, it's a citation
// link. "If you can see a number, you can see where it came from" — this
// is the component that makes that literally true, one click away.
export default function SourceChip({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
    >
      {label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
