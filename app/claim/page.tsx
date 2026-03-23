import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClaimForm } from "@/components/claim-form";
import { FormNotice } from "@/components/form-notice";
import { PageIntro } from "@/components/page-intro";
import { getCurrentViewer } from "@/lib/auth";

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
  const verificationAvailable = Boolean(process.env.RESEND_API_KEY?.trim());

  if (viewer?.emailVerified) {
    redirect("/claim/card");
  }

  return (
    <div className="page-shell gap-10">
      <PageIntro
        eyebrow="Claim"
        title="Claim your SKL card"
        description="Use your email and username, verify your inbox."
      />

      {!verificationAvailable ? (
        <FormNotice tone="error">
          Email verification is not configured yet. Set `RESEND_API_KEY` and `EMAIL_FROM` to enable the claim flow.
        </FormNotice>
      ) : null}

      {params.pending === "1" ? (
        <FormNotice tone="error">
          Verify your email before your claim card is available.
        </FormNotice>
      ) : null}

      <ClaimForm
        verificationAvailable={verificationAvailable}
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
    </div>
  );
}
