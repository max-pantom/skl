import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClaimProfileCard } from "@/components/claim-profile-card";
import { ClaimVerifiedBottomDock } from "@/components/claim-passport-recent-cluster";
import { getCurrentViewer } from "@/lib/auth";
import { getEarlyBelieverRank, getRecentPassportClaimants } from "@/lib/data";
import { absoluteUrl } from "@/lib/email/app-base-url";
import { formatClaimCardFooterDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Passport (test)",
};

/** Visual clone of `/u/[username]/passport` for the signed-in user (same layout and data). */
export default async function Test4Page() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent("/test4")}`);
  }

  if (!viewer.emailVerified) {
    redirect("/claim");
  }

  const [freshViewer, earlyRank, recentPassportClaimants] = await Promise.all([
    getCurrentViewer(),
    getEarlyBelieverRank(viewer.id, viewer.createdAt),
    getRecentPassportClaimants(4),
  ]);

  if (!freshViewer) {
    redirect(`/login?next=${encodeURIComponent("/test4")}`);
  }

  return (
    <div className="page-shell gap-6">
      <div className="flex min-h-[min(720px,calc(100dvh-6rem))] flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-0 pb-10 pt-4 sm:pb-16 sm:pt-6">
          <ClaimProfileCard
            avatarUrl={freshViewer.avatarUrl}
            cardDownloadUrl={absoluteUrl(`/api/users/${freshViewer.id}/claim-card.png`)}
            displayName={freshViewer.displayName}
            passportUrl={absoluteUrl(`/u/${freshViewer.username}/passport`)}
            profileUrl={absoluteUrl(`/u/${freshViewer.username}`)}
            role={freshViewer.role}
            userId={freshViewer.id}
            username={freshViewer.username}
            earlyBelieverRank={earlyRank}
            footerDate={formatClaimCardFooterDate(new Date())}
            recentPassportClaimants={recentPassportClaimants}
          />
        </div>
      </div>
      <ClaimVerifiedBottomDock claimants={recentPassportClaimants} />
    </div>
  );
}
