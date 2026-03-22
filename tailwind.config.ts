import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
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
