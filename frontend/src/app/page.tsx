import Link from "next/link";

import ActionCard from "@/components/ActionCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TryDemoButton from "@/components/TryDemoButton";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6">
          <section className="flex flex-col items-center py-20 text-center md:py-28">
            <span className="mb-4 rounded-full bg-brand/10 px-4 py-1 text-sm font-medium text-brand">
              For women entrepreneurs
            </span>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-brand-dark md:text-5xl">
              From &ldquo;not eligible&rdquo; to &ldquo;application-ready.&rdquo;
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-gray-600">
              Government portals tell you how to apply. ShaktiScale checks your situation
              against verified government scheme rules, shows you exactly where you stand, and
              builds a personal, dated path to becoming eligible.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/assess"
                className="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
              >
                Check My Readiness
              </Link>
              <TryDemoButton />
            </div>

            <p className="mt-6 text-xs text-gray-400">
              No login. Nothing is saved. This is a readiness guide, not a funding decision.
            </p>
          </section>

          <section id="how-it-works" className="grid gap-6 pb-24 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <ActionCard key={feature.title} {...feature} />
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const FEATURES = [
  {
    emoji: "📊",
    title: "Where you stand",
    description:
      "Your situation checked against verified government scheme rules — every result cites the actual guideline.",
  },
  {
    emoji: "🗺️",
    title: "Your dated path",
    description:
      "Not just what's missing — exactly what to do next, and when you'll be ready, computed from your own details.",
  },
  {
    emoji: "✓",
    title: "Nothing hidden",
    description:
      "Every score is a plain count of rules met, never a prediction. You can see the source behind every fact.",
  },
];
