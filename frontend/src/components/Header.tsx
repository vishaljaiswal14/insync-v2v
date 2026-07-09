import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-bold text-white">
            S
          </span>
          <span className="text-lg font-semibold text-brand-dark">ShaktiScale AI</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/dashboard" className="transition hover:text-brand">
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
