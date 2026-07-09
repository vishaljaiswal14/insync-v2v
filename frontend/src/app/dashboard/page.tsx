export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Your assessment, scheme matches, and roadmap will appear here.
      </p>

      {/* Empty state — real widgets land in later milestones. */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {["Assessment", "Eligible schemes", "Roadmap"].map((title) => (
          <div
            key={title}
            className="flex min-h-[180px] flex-col rounded-2xl border border-dashed border-gray-200 p-6"
          >
            <h2 className="font-semibold text-gray-700">{title}</h2>
            <div className="mt-auto text-sm text-gray-400">Coming soon</div>
          </div>
        ))}
      </div>
    </div>
  );
}
