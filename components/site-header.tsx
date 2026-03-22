import Link from "next/link";

import { HeaderAccountNav } from "@/components/header-account-nav";
import { SklLogo } from "@/components/skl-logo";
import { getCurrentViewer } from "@/lib/auth";

export async function SiteHeader() {
  const viewer = await getCurrentViewer();

  return (
    <header className="mx-auto mb-10 mt-6 flex w-full max-w-[1056px] items-start justify-between">
      <Link href="/" className="shrink-0">
        <SklLogo />
      </Link>

      <HeaderAccountNav viewer={viewer} />
    </header>
  );
}
