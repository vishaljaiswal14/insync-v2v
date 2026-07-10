"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { SAMPLE_PROFILES } from "@/lib/sampleProfiles";
import type { Profile } from "@/lib/types";

const BLANK_PROFILE: Profile = {
  gender: "",
  state: "",
  district: "",
  business_type: "",
  is_shg_member: false,
  shg_months_active: null,
  category: "",
  monthly_revenue: null,
  monthly_expenses: null,
  documents: [],
};

const DOCUMENT_OPTIONS = [
  { id: "aadhaar", label: "Aadhaar card" },
  { id: "shg_certificate", label: "SHG membership certificate" },
  { id: "business_quotation", label: "Business quotation or estimate" },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

export default function AssessmentForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (profile: Profile) => void;
  submitting: boolean;
}) {
  const [profile, setProfile] = useState<Profile>(BLANK_PROFILE);
  const [touched, setTouched] = useState(false);

  const isValid =
    profile.gender.trim() !== "" && profile.state.trim() !== "" && profile.business_type.trim() !== "";

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDocument(id: string) {
    setProfile((prev) => ({
      ...prev,
      documents: prev.documents.includes(id)
        ? prev.documents.filter((doc) => doc !== id)
        : [...prev.documents, id],
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit(profile);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-8 px-6 pb-32 pt-8">
      <div>
        <label className="block text-xs font-medium text-gray-400">Try an example (development only)</label>
        <select
          className={inputClass}
          defaultValue=""
          onChange={(event) => {
            const sample = SAMPLE_PROFILES.find((s) => s.id === event.target.value);
            if (sample) setProfile(sample.profile);
          }}
        >
          <option value="" disabled>
            Choose a sample profile…
          </option>
          {SAMPLE_PROFILES.map((sample) => (
            <option key={sample.id} value={sample.id}>
              {sample.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-brand-dark">You</legend>
        <Field label="Gender">
          <select className={inputClass} value={profile.gender} onChange={(e) => update("gender", e.target.value)}>
            <option value="">Select…</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="State">
          <input
            className={inputClass}
            value={profile.state}
            onChange={(e) => update("state", e.target.value)}
            placeholder="e.g. Odisha"
          />
        </Field>
        <Field label="District (optional)">
          <input
            className={inputClass}
            value={profile.district ?? ""}
            onChange={(e) => update("district", e.target.value)}
            placeholder="e.g. Koraput"
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-brand-dark">Your SHG</legend>
        <div>
          <span className="block text-sm font-medium text-gray-600">
            Are you a Self-Help Group member?
          </span>
          <div className="mt-1 flex gap-2">
            <ToggleButton active={profile.is_shg_member} onClick={() => update("is_shg_member", true)}>
              Yes
            </ToggleButton>
            <ToggleButton active={!profile.is_shg_member} onClick={() => update("is_shg_member", false)}>
              No
            </ToggleButton>
          </div>
        </div>
        {profile.is_shg_member && (
          <Field label="How many months has your SHG been active?">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={profile.shg_months_active ?? ""}
              onChange={(e) =>
                update("shg_months_active", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-brand-dark">Your Business</legend>
        <Field label="Business type">
          <input
            className={inputClass}
            value={profile.business_type}
            onChange={(e) => update("business_type", e.target.value)}
            placeholder="e.g. Tailoring, Grocery, Poultry"
          />
        </Field>
        <Field label="Category (optional — for context only, never affects your score)">
          <select
            className={inputClass}
            value={profile.category ?? ""}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Prefer not to say</option>
            <option value="general">General</option>
            <option value="BPL">BPL</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="widow">Widow</option>
            <option value="single">Single</option>
          </select>
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-brand-dark">Your Finances</legend>
        <Field label="Monthly revenue (optional)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={profile.monthly_revenue ?? ""}
            onChange={(e) =>
              update("monthly_revenue", e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="₹"
          />
        </Field>
        <Field label="Monthly expenses (optional)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={profile.monthly_expenses ?? ""}
            onChange={(e) =>
              update("monthly_expenses", e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="₹"
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold text-brand-dark">Documents you have</legend>
        {DOCUMENT_OPTIONS.map((doc) => (
          <label key={doc.id} className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={profile.documents.includes(doc.id)}
              onChange={() => toggleDocument(doc.id)}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            {doc.label}
          </label>
        ))}
      </fieldset>

      {touched && !isValid && (
        <p className="text-sm text-red-500">Please fill in your gender, state, and business type.</p>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 p-4 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <button
          type="submit"
          disabled={submitting}
          className="mx-auto block w-full max-w-xl rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? "Checking…" : "See My Readiness"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-600">
      {label}
      {children}
    </label>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
        active ? "border-brand bg-brand/10 text-brand-dark" : "border-gray-200 text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}
