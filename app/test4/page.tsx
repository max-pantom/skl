import type { Metadata } from "next";

import { ClaimProfileCard } from "@/components/claim-profile-card";
import { ClaimVerifiedBottomDock } from "@/components/claim-passport-recent-cluster";
import { absoluteUrl } from "@/lib/email/app-base-url";
import type { RecentPassportClaimant, UserRole } from "@/lib/types";
import { formatClaimCardFooterDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Passport preview",
};

/** New random preview on each request (no login). */
export const dynamic = "force-dynamic";

const DISPLAY_NAMES = [
  "Alex Rivera",
  "Sam Chen",
  "Jordan Lee",
  "Riley Morgan",
  "Casey Brooks",
  "Morgan Blake",
  "Jamie Park",
  "Taylor Reed",
] as const;

const ROLES: UserRole[] = ["user", "pro", "admin"];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randomClaimant(): RecentPassportClaimant {
  const id = crypto.randomUUID();
  return {
    id,
    username: `u_${id.replace(/-/g, "").slice(0, 10)}`,
    displayName: pick(DISPLAY_NAMES),
    /** Same as passport: no upload → {@link ProfileAvatar} shield / admin tile from `userId`. */
    avatarUrl: null,
    role: pick(ROLES),
  };
}

/** Passport layout mock — only SKL seeded avatars (no external photos). */
export default function Test4Page() {
  const userId = crypto.randomUUID();
  const displayName = pick(DISPLAY_NAMES);
  const username = `preview_${userId.replace(/-/g, "").slice(0, 8)}`;
  const role = pick(ROLES);
  const earlyBelieverRank = 1 + Math.floor(Math.random() * 800);
  const recentPassportClaimants = Array.from({ length: 4 }, () => randomClaimant());

  return (
    <div className="page-shell gap-6">
      <div className="flex min-h-[min(720px,calc(100dvh-6rem))] flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-0 pb-10 pt-4 sm:pb-16 sm:pt-6">
          <ClaimProfileCard
            avatarUrl={null}
            cardDownloadUrl={absoluteUrl(`/api/users/${userId}/claim-card.png`)}
            displayName={displayName}
            passportUrl={absoluteUrl("/test4")}
            profileUrl={absoluteUrl("/test4")}
            role={role}
            userId={userId}
            username={username}
            earlyBelieverRank={earlyBelieverRank}
            footerDate={formatClaimCardFooterDate(new Date())}
            recentPassportClaimants={recentPassportClaimants}
          />
        </div>
      </div>
      <ClaimVerifiedBottomDock claimants={recentPassportClaimants} />
    </div>
  );
}
