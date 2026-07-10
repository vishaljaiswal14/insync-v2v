"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/Button";
import { useAssessment } from "@/context/AssessmentContext";
import { SAMPLE_PROFILES } from "@/lib/sampleProfiles";

// A single click that runs the entire deterministic + AI flow on a real,
// realistic profile — no typing required. Reuses the exact same
// submitProfile path manual entry uses; this is a shortcut to the form,
// not a separate code path.
const DEMO_PROFILE = SAMPLE_PROFILES.find((sample) => sample.id === "sunita_partial")!.profile;

export default function TryDemoButton() {
  const router = useRouter();
  const { submitProfile } = useAssessment();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await submitProfile(DEMO_PROFILE);
    router.push("/results");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={buttonVariants("secondary")}
    >
      {loading ? "Loading demo…" : "Try Demo — no typing needed"}
    </button>
  );
}
