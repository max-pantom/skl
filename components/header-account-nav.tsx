"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProfileAvatar } from "@/components/profile-avatar";
import type { AppViewer } from "@/lib/types";
import { cn } from "@/lib/utils";

const linkClass = {
  create:
    "rounded-[20px] px-3 py-2 text-base font-medium leading-none transition bg-[#e7e7e7] text-[#242424] hover:bg-[#dbdbdb]",
  settings:
    "rounded-[20px] px-3 py-2 text-base font-medium leading-none transition bg-[rgba(228,228,228,0.2)] text-[#8f8f8f] hover:bg-[rgba(228,228,228,0.32)] hover:text-[#5f5f5f]",
} as const;

export function HeaderAccountNav({ viewer }: { viewer: AppViewer | null }) {
  const pathname = usePathname() ?? "";
  const profileMatch = /^\/u\/([^/]+)\/?$/.exec(pathname);
  const profileUsername = profileMatch?.[1] ? decodeURIComponent(profileMatch[1]) : null;
  const isOwnProfile = !!(viewer && profileUsername && viewer.username === profileUsername);

  const createHref = viewer ? "/new" : "/login?next=%2Fnew";
  const settingsHref = viewer ? "/settings" : "/login?next=%2Fsettings";

  return (
    <div className="flex items-center gap-2">
      <Link href={createHref} className={linkClass.create}>
        Create
      </Link>
      {viewer ? (
        isOwnProfile ? (
          <Link
            href={settingsHref}
            className={cn(
              "shrink-0 rounded-full ring-offset-2 transition hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
            )}
            aria-label="Settings"
          >
            <ProfileAvatar
              avatarUrl={viewer.avatarUrl}
              displayName={viewer.displayName}
              userId={viewer.id}
              size={40}
            />
          </Link>
        ) : (
          <Link href={settingsHref} className={linkClass.settings}>
            Settings
          </Link>
        )
      ) : (
        <Link href={settingsHref} className={linkClass.settings}>
          Settings
        </Link>
      )}
    </div>
  );
}
