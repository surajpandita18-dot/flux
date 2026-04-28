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
        // Phase colors — pastel, soft, warm (ring segments + history pills)
        menstrual: {
          DEFAULT: "#F4A0B4",   // soft rose
          dark:    "#E8627C",   // stronger rose (accent use only)
          soft:    "#FDF2F5",
          "soft-dark": "#3D1020",
        },
        follicular: {
          DEFAULT: "#8CCBA8",   // sage green
          dark:    "#3D9E6E",
          soft:    "#EFF7F3",
          "soft-dark": "#0E2D1E",
        },
        ovulation: {
          DEFAULT: "#F5D07A",   // warm golden yellow
          dark:    "#C8960A",
          soft:    "#FBF6E6",
          "soft-dark": "#3D2D08",
        },
        luteal: {
          DEFAULT: "#A8C4E8",   // periwinkle blue
          dark:    "#4A80C8",
          soft:    "#EEF3FB",
          "soft-dark": "#0E2040",
        },
        // Primary interactive color — rose, used for all CTAs and today dots
        rose: {
          DEFAULT: "#E8627C",
          soft:    "#FCEEF1",
          "soft-dark": "#4A1020",
        },
        // Warm cream surfaces
        surface: {
          DEFAULT: "#FBF8F5",
          card:    "#FFFFFF",
          "card-2": "#F7F4F1",
          dark:    "#111110",
          "card-dark": "#1C1B1A",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft": "0 2px 16px rgba(0,0,0,0.06)",
        "card": "0 4px 24px rgba(0,0,0,0.07)",
        "lift": "0 8px 40px rgba(0,0,0,0.10)",
        "ring": "0 0 0 3px rgba(232,98,124,0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-up":  "fadeUp 0.35s ease-out",
        "fade-in":  "fadeIn 0.25s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
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
      },
    },
  },
  plugins: [],
};

export default config;
