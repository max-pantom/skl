import Link from "next/link";

import { SklLogo } from "@/components/skl-logo";
import { getCurrentViewer } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/new", label: "Create" },
  { href: "/settings", label: "Settings" },
];

export async function SiteHeader() {
  const viewer = await getCurrentViewer();
  const createHref = viewer ? "/new" : "/login?next=%2Fnew";
  const settingsHref = viewer ? "/settings" : "/login?next=%2Fsettings";

  return (
    <header className="mx-auto mb-10 mt-6 flex w-full max-w-[1056px] items-start justify-between">
      <Link href="/" className="shrink-0">
        <SklLogo />
      </Link>

      <div className="flex items-center gap-4">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href === "/new" ? createHref : settingsHref}
            className={cn(
              "rounded-[20px] px-3 py-2 text-base font-medium leading-none transition",
              item.href === "/new"
                ? "bg-[#e7e7e7] text-[#242424] hover:bg-[#dbdbdb]"
                : "bg-[rgba(228,228,228,0.2)] text-[#8f8f8f] hover:bg-[rgba(228,228,228,0.32)] hover:text-[#5f5f5f]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
