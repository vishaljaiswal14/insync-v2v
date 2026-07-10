import type { ReactNode } from "react";

// The document's numbered-heading rhythm, used identically by every major
// section of the dossier. Deliberately not a card: a hairline rule and a
// mono index number, not a rounded shadowed box — this is a document, not
// another dashboard widget.
export default function DocumentSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="py-8 border-b border-line last:border-b-0">
      {/* Only the heading itself is protected from an orphaned page break —
          the section body (tables in particular) can be taller than one A4
          page, so forcing the whole section to avoid breaking would just
          push it entirely onto the next page instead of splitting cleanly
          between rows. Per-row/per-item break control lives in each
          section's own component (see e.g. OutstandingRequirementsTable). */}
      <div className="mb-5 flex items-baseline gap-3 print:break-after-avoid">
        <span className="font-mono text-sm font-bold text-brand">{String(index).padStart(2, "0")}</span>
        <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
