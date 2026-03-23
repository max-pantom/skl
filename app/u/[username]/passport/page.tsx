import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ClaimProfileCard } from "@/components/claim-profile-card";
import { ClaimVerifiedBottomDock } from "@/components/claim-passport-recent-cluster";
import { getCurrentViewer, requireCurrentViewer } from "@/lib/auth";
import { getEarlyBelieverRank, getRecentPassportClaimants } from "@/lib/data";
import { absoluteUrl } from "@/lib/email/app-base-url";
import { formatClaimCardFooterDate } from "@/lib/utils";

type PassportPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({ params }: PassportPageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} Passport`,
  };
}

export default async function PassportPage({ params }: PassportPageProps) {
  const { username } = await params;
  const viewer = await requireCurrentViewer(`/u/${username}/passport`);

  if (viewer.username !== username) {
    notFound();
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
    redirect("/login");
  }

  return (
    <div className="page-shell gap-6">
      <div className="flex min-h-[calc(100dvh-8rem)] flex-1 flex-col sm:min-h-[min(720px,calc(100dvh-6rem))]">
        <div className="flex flex-1 flex-col items-center justify-start px-0 pt-2 sm:justify-center sm:pb-16 sm:pt-6">
          <ClaimProfileCard
            avatarUrl={freshViewer.avatarUrl}
            adminPortraitClipCircle={false}
            cardDownloadUrl={absoluteUrl(`/api/users/${freshViewer.id}/claim-card.png`)}
            compactMobile
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
