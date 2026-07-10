// Mirrors data/sample_profiles/*.json verbatim — kept here only because the
// browser can't reach across the repo boundary to read those files at
// runtime. Used solely for the Assessment form's dev "try an example"
// helper; real submissions always go through the form, never these directly.
import type { Profile } from "./types";

export const SAMPLE_PROFILES: { id: string; label: string; profile: Profile }[] = [
  {
    id: "sunita_partial",
    label: "Sunita — partially eligible (SHG 4 months)",
    profile: {
      gender: "female",
      state: "Odisha",
      district: "Koraput",
      business_type: "tailoring",
      is_shg_member: true,
      shg_months_active: 4,
      category: "general",
      monthly_revenue: null,
      monthly_expenses: null,
      documents: [],
    },
  },
  {
    id: "fully_eligible",
    label: "Fully eligible",
    profile: {
      gender: "female",
      state: "Odisha",
      district: "Khordha",
      business_type: "grocery",
      is_shg_member: true,
      shg_months_active: 12,
      category: "general",
      monthly_revenue: 15000,
      monthly_expenses: 9000,
      documents: ["aadhaar", "shg_certificate", "business_quotation"],
    },
  },
  {
    id: "not_odisha",
    label: "Not an Odisha resident (structural blocker)",
    profile: {
      gender: "female",
      state: "West Bengal",
      district: "Kolkata",
      business_type: "handicrafts",
      is_shg_member: true,
      shg_months_active: 10,
      category: "general",
      monthly_revenue: null,
      monthly_expenses: null,
      documents: [],
    },
  },
  {
    id: "not_shg_member",
    label: "Not an SHG member yet",
    profile: {
      gender: "female",
      state: "Odisha",
      district: "Puri",
      business_type: "food_stall",
      is_shg_member: false,
      shg_months_active: null,
      category: "widow",
      monthly_revenue: null,
      monthly_expenses: null,
      documents: [],
    },
  },
  {
    id: "missing_documents",
    label: "Grant-ready, missing documents",
    profile: {
      gender: "female",
      state: "Odisha",
      district: "Cuttack",
      business_type: "poultry",
      is_shg_member: true,
      shg_months_active: 8,
      category: "SC",
      monthly_revenue: null,
      monthly_expenses: null,
      documents: [],
    },
  },
];
