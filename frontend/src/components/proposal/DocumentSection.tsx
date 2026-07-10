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
    <section className="py-8 border-b border-line last:border-b-0 print:break-inside-avoid">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-sm font-bold text-brand">{String(index).padStart(2, "0")}</span>
        <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
