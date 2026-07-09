// Shown automatically by Next.js while the dashboard route loads.
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-4 w-80 animate-pulse rounded bg-gray-100" />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="min-h-[180px] animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>
    </div>
  );
}
