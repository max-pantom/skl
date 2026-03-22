"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";

/** Omit footer on public profile routes (`/u/:username`). */
export function ConditionalFooter() {
  const pathname = usePathname() ?? "";

  if (pathname === "/u" || pathname.startsWith("/u/")) {
    return null;
  }

  return <SiteFooter />;
}
