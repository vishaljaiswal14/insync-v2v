import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex flex-col items-center py-20 text-center md:py-28">
        <span className="mb-4 rounded-full bg-brand/10 px-4 py-1 text-sm font-medium text-brand">
          For women entrepreneurs
        </span>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-brand-dark md:text-5xl">
          Grow your business with AI that actually knows your options.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-gray-600">
          ShaktiScale AI assesses where your business stands, finds the government
          schemes you qualify for, and builds a step-by-step roadmap to scale.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
          >
            Open dashboard
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
          >
            How it works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="grid gap-6 pb-24 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="mb-3 text-2xl">{feature.emoji}</div>
            <h3 className="mb-2 text-lg font-semibold text-brand-dark">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

const FEATURES = [
  {
    emoji: "📊",
    title: "Business assessment",
    description:
      "Answer a few questions and get a clear read on your business's growth stage.",
  },
  {
    emoji: "🏛️",
    title: "Scheme discovery",
    description:
      "See the government schemes you're eligible for, matched to your profile.",
  },
  {
    emoji: "🗺️",
    title: "Growth roadmap",
    description:
      "Get a practical, prioritized plan for the next steps to scale up.",
  },
];
