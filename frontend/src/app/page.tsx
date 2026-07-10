import Link from "next/link";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TryDemoButton from "@/components/TryDemoButton";
import { buttonVariants } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6">
          <section className="flex flex-col items-center pb-16 pt-20 text-center md:pt-28">
            <span className="mb-5 rounded-md border border-line bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
              For women entrepreneurs
            </span>

            <h1 className="max-w-2xl font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">
              From &ldquo;not eligible&rdquo; to &ldquo;application-ready.&rdquo;
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              Government portals tell you how to apply. ShaktiScale checks your situation
              against verified government scheme rules, shows you exactly where you stand, and
              builds a personal, dated path to becoming eligible.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/assess" className={buttonVariants("primary")}>
                Check My Readiness
              </Link>
              <TryDemoButton />
            </div>

            <p className="mt-6 text-xs text-ink-faint">
              No login. Nothing is saved. This is a readiness guide, not a funding decision.
            </p>
          </section>

          <section className="border-t border-line py-16">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className={`flex gap-6 py-6 ${index !== STEPS.length - 1 ? "border-b border-line" : ""}`}
              >
                <span className="font-serif text-2xl text-ink-faint">{step.number}</span>
                <div>
                  <h3 className="font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Where you stand",
    description:
      "Your situation checked against verified government scheme rules — every result cites the actual guideline.",
  },
  {
    number: "02",
    title: "Your dated path",
    description:
      "Not just what's missing — exactly what to do next, and when you'll be ready, computed from your own details.",
  },
  {
    number: "03",
    title: "Nothing hidden",
    description:
      "Every score is a plain count of rules met, never a prediction. You can see the source behind every fact.",
  },
];
