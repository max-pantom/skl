import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ClaimProfileCard } from "@/components/claim-profile-card";
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
      <div className="flex min-h-[min(720px,calc(100dvh-6rem))] flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-0 pb-10 pt-4 sm:pb-16 sm:pt-6">
          <ClaimProfileCard
            avatarUrl={freshViewer.avatarUrl}
            cardDownloadUrl={absoluteUrl(`/api/users/${freshViewer.id}/claim-card.png`)}
            displayName={freshViewer.displayName}
            passportUrl={absoluteUrl(`/u/${freshViewer.username}/passport`)}
            profileUrl={absoluteUrl(`/u/${freshViewer.username}`)}
            recentPassportClaimants={recentPassportClaimants}
            role={freshViewer.role}
            userId={freshViewer.id}
            username={freshViewer.username}
            earlyBelieverRank={earlyRank}
            footerDate={formatClaimCardFooterDate(new Date())}
          />
        </div>
      </div>
    </div>
  );
}
