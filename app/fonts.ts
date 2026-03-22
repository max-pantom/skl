import localFont from "next/font/local";

/**
 * Open Runde v1.0.1 — self-hosted at repo root `fonts/open-runde/*.woff2` (same layout as `OpenRunde-1.0.1/web/`).
 * Paths are relative to this file: `app/fonts.ts` → `../fonts/open-runde/`.
 * Source: https://github.com/lauridskern/open-runde (OFL-1.1).
 */
export const openRunde = localFont({
  src: [
    { path: "../fonts/open-runde/OpenRunde-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/open-runde/OpenRunde-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/open-runde/OpenRunde-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/open-runde/OpenRunde-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-open-runde",
  display: "swap",
});
