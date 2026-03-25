import Link from "next/link";

import { HeaderAccountNav } from "@/components/header-account-nav";
import { SklLogo } from "@/components/skl-logo";
import { getCurrentViewer } from "@/lib/auth";

export async function SiteHeader() {
  const viewer = await getCurrentViewer();

  return (
    <header className="mx-auto mb-10 mt-6 flex w-full max-w-[1056px] flex-wrap items-start justify-between gap-3 sm:gap-4">
      <Link href="/" className="shrink-0">
        <div className="site-header-brand flex items-start gap-1.5">
          <SklLogo />
          <span className="inline-flex rounded-[90px] bg-[rgba(36,36,36,0.14)] px-1.5 py-[2px] text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-[#242424]">
            Beta
          </span>
        </div>
      </Link>

      <HeaderAccountNav viewer={viewer} />
    </header>
  );
}
