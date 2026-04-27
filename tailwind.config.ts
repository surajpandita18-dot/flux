import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        menstrual: {
          DEFAULT: "#E53E3E",
          soft: "#FED7D7",
          "soft-dark": "#4A1717",
        },
        follicular: {
          DEFAULT: "#D69E2E",
          soft: "#FEFCBF",
          "soft-dark": "#44370A",
        },
        ovulation: {
          DEFAULT: "#DD6B20",
          soft: "#FEEBC8",
          "soft-dark": "#4A2508",
        },
        luteal: {
          DEFAULT: "#6B46C1",
          soft: "#E9D8FD",
          "soft-dark": "#2D1A5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
