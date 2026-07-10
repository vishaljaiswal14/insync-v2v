// One responsibility: present a single labeled highlight (icon + title +
// description). Used wherever the UI needs a calm, non-clickable summary
// card — Landing's feature highlights, and empty states like "you meet
// every criterion." Never nests another card.
export default function ActionCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 p-6">
      <div className="mb-3 text-2xl">{emoji}</div>
      <h3 className="mb-2 text-lg font-semibold text-brand-dark">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
