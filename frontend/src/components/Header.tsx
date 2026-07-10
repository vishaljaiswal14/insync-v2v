import Link from "next/link";

// Marketing-only chrome — used on the Landing page alone. The journey
// screens (/assess onward) use ProgressHeader instead; there is no nav bar
// shared across the app, by design.
export default function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <nav className="mx-auto flex max-w-3xl items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-serif text-sm font-semibold text-white">
            S
          </span>
          <span className="font-serif text-lg font-semibold text-ink">ShaktiScale</span>
          {/* The one place "AI" appears — small and quiet on purpose. */}
          <span className="rounded-md border border-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
            AI
          </span>
        </Link>
      </nav>
    </header>
  );
}
