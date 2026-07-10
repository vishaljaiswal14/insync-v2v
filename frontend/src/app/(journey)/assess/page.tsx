"use client";

import { useRouter } from "next/navigation";

import AssessmentForm from "@/components/AssessmentForm";
import { useAssessment } from "@/context/AssessmentContext";
import type { Profile } from "@/lib/types";

export default function AssessPage() {
  const router = useRouter();
  const { state, submitProfile } = useAssessment();

  async function handleSubmit(profile: Profile) {
    await submitProfile(profile);
    router.push("/results");
  }

  return (
    <div>
      <div className="mx-auto max-w-xl px-6 pt-8 text-center">
        <h1 className="text-2xl font-bold text-brand-dark">Tell us about your business</h1>
        <p className="mt-2 text-sm text-gray-500">
          Two minutes, no login. Nothing is saved — this stays on your device.
        </p>
      </div>

      <AssessmentForm onSubmit={handleSubmit} submitting={state.status === "loading"} />

      {state.status === "error" && (
        <p className="mx-auto max-w-xl px-6 text-center text-sm text-red-500">{state.error}</p>
      )}
    </div>
  );
}
