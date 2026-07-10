import Link from "next/link";

// Marketing-only chrome — used on the Landing page alone. The journey
// screens (/assess onward) use ProgressHeader instead; there is no nav bar
// shared across the app, by design.
export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-bold text-white">
            S
          </span>
          <span className="text-lg font-semibold text-brand-dark">ShaktiScale AI</span>
        </Link>
      </nav>
    </header>
  );
}
