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
        ink: "#101217",
        shell: "#f6f2e8",
        muted: "#6b7280",
        line: "#d6cfbf",
        accent: "#0f766e",
        accentSoft: "#d6f0ec",
        panel: "#fffdf7",
      },
      boxShadow: {
        card: "0 12px 30px rgba(16, 18, 23, 0.08)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)"],
        mono: ["var(--font-plex-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
