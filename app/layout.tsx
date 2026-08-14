import type { Metadata } from "next";
import { Agentation } from "agentation";
import { Analytics } from "@vercel/analytics/next";

import "@/app/globals.css";
import { openRunde } from "@/app/fonts";
import { ConditionalFooter } from "@/components/conditional-footer";
import { SiteHeader } from "@/components/site-header";
import { publicAppOrigin } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Light UI only — strip legacy `dark` class / preference. */
const lightOnlyScript = `
(() => {
  document.documentElement.classList.remove("dark");
  document.documentElement.dataset.theme = "light";
  try {
    localStorage.setItem("skl-theme", "light");
  } catch (_) {}
})();
`;

export const metadata: Metadata = {
  title: {
    default: "SKL",
    template: "%s | SKL",
  },
  description: "Portable AI skills. Publish, browse, fork, and download reusable instruction packages.",
  metadataBase: publicAppOrigin(),
  openGraph: {
    title: "SKL",
    description: "Portable AI skills. Publish, browse, fork, and download reusable instruction packages.",
    siteName: "SKL",
    type: "website",
    images: [
      {
        url: "/sklx-og.png",
        width: 1200,
        height: 630,
        alt: "SKL",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKL",
    description: "Portable AI skills. Publish, browse, fork, and download reusable instruction packages.",
    images: ["/sklx-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={openRunde.variable} suppressHydrationWarning>
      <body className="font-sans text-[15px] leading-relaxed text-[#242424] antialiased">
        <script dangerouslySetInnerHTML={{ __html: lightOnlyScript }} />
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-6 lg:px-10">
          <SiteHeader />
          <main className="flex min-h-0 flex-1 flex-col py-8 sm:py-11">{children}
          <script src="https://inflight.co/widget.js" data-org="tbwuvhdp" async></script></main>
          <ConditionalFooter />
        </div>
        {process.env.NODE_ENV === "development" && <Agentation />}
        <Analytics />
      </body>
    </html>
  );
}
