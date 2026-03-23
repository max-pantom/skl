import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "shutter-flash": {
          "0%": { opacity: "0" },
          "14%": { opacity: "0.93" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "shutter-flash": "shutter-flash 0.34s ease-out forwards",
      },
      colors: {
        ink: "#18181b",
        shell: "#f4f4f5",
        muted: "#71717a",
        line: "#e4e4e7",
        accent: "#18181b",
        accentSoft: "#f4f4f5",
        panel: "#ffffff",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-open-runde)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
