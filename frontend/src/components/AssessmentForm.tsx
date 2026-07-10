"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SAMPLE_PROFILES } from "@/lib/sampleProfiles";
import type { Profile } from "@/lib/types";
import Button from "./ui/Button";

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
  "mt-2 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all font-sans";

export default function AssessmentForm({
  onSubmit,
  submitting,
  initialProfile = null,
}: {
  onSubmit: (profile: Profile) => void;
  submitting: boolean;
  initialProfile?: Profile | null;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile || BLANK_PROFILE);
  const [touched, setTouched] = useState(false);

  const isValid =
    profile.gender.trim() !== "" && profile.state.trim() !== "" && profile.business_type.trim() !== "";

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "is_shg_member" && value === false) {
        next.shg_months_active = null;
      }
      return next;
    });
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-8 px-6 pb-36 pt-8 font-sans">
      <div className="rounded-xl border border-dashed border-amber-border bg-amber-light/30 p-4 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wider text-amber font-mono">
          Try an example (development only)
        </label>
        <select
          className="mt-2 w-full rounded-lg border border-amber-border/60 bg-white px-4 py-2.5 text-sm text-ink shadow-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/10 transition-all"
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

      <fieldset className="space-y-5">
        <legend className="font-serif text-lg font-semibold text-ink border-b border-line pb-1.5 w-full block">
          About You
        </legend>
        <Field label="Gender" required>
          <select className={inputClass} value={profile.gender} onChange={(e) => update("gender", e.target.value)}>
            <option value="">Select…</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          {touched && profile.gender === "" && (
            <span className="text-[10px] font-bold text-amber block mt-1.5 uppercase tracking-wider">
              Gender is required
            </span>
          )}
        </Field>
        <Field label="State" required>
          <input
            className={inputClass}
            value={profile.state}
            onChange={(e) => update("state", e.target.value)}
            placeholder="e.g. Odisha"
          />
          {touched && profile.state.trim() === "" && (
            <span className="text-[10px] font-bold text-amber block mt-1.5 uppercase tracking-wider">
              State is required
            </span>
          )}
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

      <fieldset className="space-y-5">
        <legend className="font-serif text-lg font-semibold text-ink border-b border-line pb-1.5 w-full block">
          Self-Help Group (SHG) Status
        </legend>
        <div className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Are you a Self-Help Group member?
          </span>
          <div className="flex gap-3">
            <ToggleButton active={profile.is_shg_member} onClick={() => update("is_shg_member", true)}>
              Yes
            </ToggleButton>
            <ToggleButton active={!profile.is_shg_member} onClick={() => update("is_shg_member", false)}>
              No
            </ToggleButton>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {profile.is_shg_member && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-serif text-lg font-semibold text-ink border-b border-line pb-1.5 w-full block">
          Your Business Details
        </legend>
        <Field label="Business type" required>
          <input
            className={inputClass}
            value={profile.business_type}
            onChange={(e) => update("business_type", e.target.value)}
            placeholder="e.g. Tailoring, Grocery, Poultry"
          />
          {touched && profile.business_type.trim() === "" && (
            <span className="text-[10px] font-bold text-amber block mt-1.5 uppercase tracking-wider">
              Business type is required
            </span>
          )}
        </Field>
        <Field label="Category (optional — context only, never affects score)">
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

      <fieldset className="space-y-5">
        <legend className="font-serif text-lg font-semibold text-ink border-b border-line pb-1.5 w-full block">
          Finances
        </legend>
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
        <legend className="font-serif text-lg font-semibold text-ink border-b border-line pb-1.5 w-full block">
          Documents Available
        </legend>
        <div className="space-y-2.5 pt-2">
          {DOCUMENT_OPTIONS.map((doc) => (
            <label key={doc.id} className="flex items-center gap-3 text-sm font-medium text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={profile.documents.includes(doc.id)}
                onChange={() => toggleDocument(doc.id)}
                className="h-4 w-4 rounded border-line text-brand focus:ring-2 focus:ring-brand/20 bg-white"
              />
              {doc.label}
            </label>
          ))}
        </div>
      </fieldset>

      {touched && !isValid && (
        <p className="text-sm font-medium text-amber">Please fill in your gender, state, and business type.</p>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/98 p-4 shadow-card md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <Button
          type="submit"
          disabled={submitting}
          className="mx-auto block w-full max-w-xl"
        >
          {submitting ? "Checking…" : "See My Readiness"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
      <span>{label}</span>
      {required && <span className="text-accent ml-1 font-bold">*</span>}
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
      className={`rounded-lg border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
        active
          ? "border-brand bg-brand text-white shadow-sm"
          : "border-line bg-white text-ink-muted hover:border-brand/30 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
