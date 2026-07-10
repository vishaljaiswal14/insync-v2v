import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — "shakti" = strength. Deep violet + warm saffron.
        brand: {
          DEFAULT: "#6d28d9",
          dark: "#4c1d95",
          light: "#a78bfa",
        },
        accent: {
          DEFAULT: "#f59e0b",
        },
        // Muted sage, not checkout-green — "met" should feel calm, not celebratory-loud.
        success: {
          DEFAULT: "#4d7c5f",
          light: "#e8f0ea",
        },
      },
    },
  },
  plugins: [],
};

export default config;
