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
      },
    },
  },
  plugins: [],
};

export default config;
