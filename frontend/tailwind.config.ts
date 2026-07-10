import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Institutional navy — trust carried through structure, not decoration.
        // Echoes the blue used across Indian public digital infrastructure
        // (RBI, official portals) rather than generic SaaS violet.
        brand: {
          DEFAULT: "#122B4E",
          dark: "#0B1F3A",
          light: "#F2F5FA",
        },
        // Gold is reserved deliberately — the single most important action
        // or verified outcome per screen, never a decorative accent.
        accent: {
          DEFAULT: "#C9932E",
          // Text-safe variant: the DEFAULT gold measures 2.73:1 as text on
          // white — fails WCAG AA even at large size (needs 3:1). This
          // darkened value passes at 4.96:1. Used specifically where gold
          // renders as text (e.g. the eligibility date), never for
          // backgrounds, where DEFAULT already has enough contrast against
          // the dark text sitting on top of it.
          dark: "#916916",
        },
        // A separate, more muted ochre for "in progress" marks (fixable gap
        // indicators) — distinct from CTA gold so gold keeps its meaning.
        amber: {
          DEFAULT: "#A9761A",
          light: "#FBF0DC",
          border: "#EFD49B",
        },
        success: {
          DEFAULT: "#1F5C3F",
          light: "#E7F1EA",
          border: "#BEDCC7",
        },
        // Warm neutrals replacing default cool grays for text/background —
        // this is what makes the page feel like paper, not a SaaS panel.
        ink: {
          DEFAULT: "#171410",
          muted: "#6E6757",
          // Darkened from the export's raw extraction (#918A76 measured at
          // 3.3:1 on paper — fails WCAG AA for the small text it's used on,
          // e.g. captions and the eyebrow tag). This passes at 4.65:1.
          faint: "#787160",
        },
        paper: "#FCFAF6",
        line: "#E4DCCE",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Shadows tinted with ink, not neutral black — a soft, considered detail.
        card: "0 2px 6px 0 rgba(23, 20, 16, 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
