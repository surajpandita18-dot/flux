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
          DEFAULT: "#E11D48",
          soft: "#FFF1F2",
          "soft-dark": "#4C0519",
        },
        follicular: {
          DEFAULT: "#D97706",
          soft: "#FFFBEB",
          "soft-dark": "#451A03",
        },
        ovulation: {
          DEFAULT: "#F97316",
          soft: "#FFF7ED",
          "soft-dark": "#431407",
        },
        luteal: {
          DEFAULT: "#7C3AED",
          soft: "#F5F3FF",
          "soft-dark": "#2E1065",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        "soft": "0 2px 16px rgba(0,0,0,0.06)",
        "card": "0 4px 32px rgba(0,0,0,0.08)",
        "lift": "0 8px 48px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-up":    "fadeUp 0.35s ease-out",
        "fade-in":    "fadeIn 0.25s ease-out",
        "scale-in":   "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
