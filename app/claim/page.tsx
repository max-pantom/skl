import type { Metadata } from "next";

import { ClaimForm } from "@/components/claim-form";
import { ClaimProfileCard } from "@/components/claim-profile-card";
import { ClaimVerifiedBottomDock } from "@/components/claim-passport-recent-cluster";
import { FormNotice } from "@/components/form-notice";
import { getCurrentViewer } from "@/lib/auth";
import { isGoogleOAuthConfigured } from "@/lib/auth-env";
import { getEarlyBelieverRank, getRecentPassportClaimants } from "@/lib/data";
import { absoluteUrl } from "@/lib/email/app-base-url";
import type { RecentPassportClaimant } from "@/lib/types";
import { formatClaimCardFooterDate, publicProfilePathPrefix } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Claim your profile",
};

type ClaimPageProps = {
  searchParams: Promise<{
    pending?: string;
  }>;
};

export default async function ClaimPage({ searchParams }: ClaimPageProps) {
  const viewer = await getCurrentViewer();
  const params = await searchParams;
  const [earlyRank, recentPassportClaimants] =
    viewer?.emailVerified === true
      ? await Promise.all([
          getEarlyBelieverRank(viewer.id, viewer.createdAt),
          getRecentPassportClaimants(4),
        ])
      : [null, [] as RecentPassportClaimant[]];
  const claimCardFooterDate = formatClaimCardFooterDate(new Date());
  const verificationAvailable = Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim(),
  );

  return (
    <div className="page-shell gap-6">
      {!verificationAvailable ? (
        <FormNotice tone="error">
          Email verification is not configured yet. Set `RESEND_API_KEY` and `EMAIL_FROM` to enable the claim flow.
        </FormNotice>
      ) : null}

      {params.pending === "1" && !viewer?.emailVerified ? (
        <FormNotice tone="error">
          Verify your email before your claim card is available.
        </FormNotice>
      ) : null}

      {viewer?.emailVerified ? (
        <>
          <div className="flex min-h-[min(720px,calc(100dvh-6rem))] flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-0 pb-10 pt-4 sm:pb-16 sm:pt-6">
              <ClaimProfileCard
                avatarUrl={viewer.avatarUrl}
                cardDownloadUrl={absoluteUrl(`/api/users/${viewer.id}/claim-card.png`)}
                displayName={viewer.displayName}
                passportUrl={absoluteUrl(`/u/${viewer.username}/passport`)}
                profileUrl={absoluteUrl(`/u/${viewer.username}`)}
                role={viewer.role}
                userId={viewer.id}
                username={viewer.username}
                earlyBelieverRank={earlyRank}
                footerDate={claimCardFooterDate}
                recentPassportClaimants={recentPassportClaimants}
              />
            </div>
          </div>
          <ClaimVerifiedBottomDock
            claimants={recentPassportClaimants}
            progressStep={3}
          />
        </>
      ) : (
        <ClaimForm
          verificationAvailable={verificationAvailable}
          googleOAuthConfigured={isGoogleOAuthConfigured()}
          profileUrlPrefix={publicProfilePathPrefix()}
          initialViewer={
            viewer
              ? {
                  displayName: viewer.displayName,
                  email: viewer.email,
                  emailVerified: viewer.emailVerified,
                  username: viewer.username,
                }
              : null
          }
        />
      )}
    </div>
  );
}
