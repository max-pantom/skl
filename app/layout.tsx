import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

const themeScript = `
(() => {
  const storageKey = "skl-theme";
  const stored = window.localStorage.getItem(storageKey);
  const theme =
    stored === "light" || stored === "dark"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
})();
`;

export const metadata: Metadata = {
  title: {
    default: "SKL",
    template: "%s | SKL",
  },
  description: "Portable AI skills. Publish, browse, fork, and download reusable instruction packages.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans text-[15px] leading-relaxed text-zinc-800 antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
          <SiteHeader />
          <main className="flex-1 py-8 sm:py-11">{children}</main>
        </div>
      </body>
    </html>
  );
}
