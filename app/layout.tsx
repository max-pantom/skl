import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <SiteHeader />
          <main className="flex-1 py-10 sm:py-12">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
