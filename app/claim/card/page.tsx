import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClaimProfileCard } from "@/components/claim-profile-card";
import { PageIntro } from "@/components/page-intro";
import { requireCurrentViewer } from "@/lib/auth";
import { absoluteUrl } from "@/lib/email/app-base-url";

export const metadata: Metadata = {
  title: "Your claim card",
};

export default async function ClaimCardPage() {
  const viewer = await requireCurrentViewer("/claim");

  if (!viewer.emailVerified) {
    redirect("/claim?pending=1");
  }

  return (
    <div className="page-shell gap-10">
      <PageIntro
        eyebrow="Verified"
        title="Your card is ready"
        description="Share your profile or save the generated card while everything is fresh."
      />

      <ClaimProfileCard
        cardDownloadUrl={absoluteUrl(`/api/users/${viewer.id}/claim-card.svg`)}
        displayName={viewer.displayName}
        email={viewer.email}
        profileUrl={absoluteUrl(`/u/${viewer.username}`)}
        role={viewer.role}
        userId={viewer.id}
        username={viewer.username}
      />
    </div>
  );
}
