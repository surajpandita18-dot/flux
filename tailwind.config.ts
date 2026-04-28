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
        // Phase display colors (ring segments)
        menstrual: {
          DEFAULT: "#F4A0B4",
          soft: "#FDF2F5",
          "soft-dark": "#3D1020",
        },
        follicular: {
          DEFAULT: "#8CCBA8",
          soft: "#EFF7F3",
          "soft-dark": "#0E2D1E",
        },
        ovulation: {
          DEFAULT: "#F5D07A",
          soft: "#FBF6E6",
          "soft-dark": "#3D2D08",
        },
        luteal: {
          DEFAULT: "#A8C4E8",
          soft: "#EEF3FB",
          "soft-dark": "#0E2040",
        },
        // Phase earthy accents (FLUX_THEME)
        "phase-menstrual": "#C76B4A",
        "phase-follicular": "#7A8F5C",
        "phase-ovulation": "#D49A3D",
        "phase-luteal": "#8B6F8C",
        // Warm cream surfaces
        surface: {
          DEFAULT: "#F7F1E9",
          card:    "#FBF6EE",
          sunken:  "#F2E8D9",
          dark:    "#1A1612",
          "card-dark": "#1F1A14",
        },
        // Deep teal ink
        ink: {
          DEFAULT: "#1F4E4A",
          body:    "#3F5A57",
          muted:   "#8FA09E",
        },
        // Contrast anchors
        teal:    "#1F4E4A",
        saffron: "#E8A33D",
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
      },
      boxShadow: {
        "soft": "0 2px 18px rgba(80,52,30,0.06)",
        "card": "0 4px 24px rgba(80,52,30,0.07)",
        "lift": "0 8px 32px rgba(80,52,30,0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-up":       "fadeUp 0.35s ease-out",
        "fade-in":       "fadeIn 0.25s ease-out",
        "scale-in":      "scaleIn 0.2s ease-out",
        "pulse-soft":    "pulseSoft 2s ease-in-out infinite",
        "breathe":       "breathe 3.5s ease-in-out infinite",
        "stagger-rise":  "staggerRise 520ms cubic-bezier(0.22,1,0.36,1) both",
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
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.7" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.028)" },
        },
        staggerRise: {
          "0%":   { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
