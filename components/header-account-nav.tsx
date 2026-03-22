"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProfileAvatar } from "@/components/profile-avatar";
import type { AppViewer } from "@/lib/types";
import { cn } from "@/lib/utils";

const linkClass = {
  create:
    "inline-flex h-8 items-center justify-center rounded-[20px] px-3 text-base font-medium leading-none transition bg-[#e7e7e7] text-[#242424] hover:bg-[#dbdbdb]",
  settings:
    "inline-flex h-8 items-center justify-center rounded-[20px] px-3 text-base font-medium leading-none transition bg-[rgba(228,228,228,0.2)] text-[#8f8f8f] hover:bg-[rgba(228,228,228,0.32)] hover:text-[#5f5f5f]",
} as const;

function isUserDashPath(pathname: string) {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}

export function HeaderAccountNav({ viewer }: { viewer: AppViewer | null }) {
  const pathname = usePathname() ?? "";
  const onUserDash = isUserDashPath(pathname);

  const createHref = viewer ? "/new" : "/login?next=%2Fnew";
  const settingsHref = "/settings";
  const profileHref = viewer ? `/u/${viewer.username}` : "/settings";

  return (
    <div className="flex items-center gap-2">
      <Link href={createHref} className={linkClass.create}>
        Create
      </Link>
      {viewer ? (
        onUserDash ? (
          <Link href={settingsHref} className={linkClass.settings}>
            Settings
          </Link>
        ) : (
          <Link
            href={profileHref}
            className={cn(
              "size-8 shrink-0 overflow-hidden rounded-full ring-offset-2 transition hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
            )}
            aria-label="Your profile"
          >
            <ProfileAvatar
              avatarUrl={viewer.avatarUrl}
              displayName={viewer.displayName}
              userId={viewer.id}
              size={32}
            />
          </Link>
        )
      ) : null}
    </div>
  );
}
