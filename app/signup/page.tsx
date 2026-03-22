import { Suspense } from "react";

import { EmailSignupForm } from "@/components/email-signup-form";
import { PageIntro } from "@/components/page-intro";
import { isGoogleAuthConfigured } from "@/lib/google-auth";

export default function SignupPage() {
  const googleAuth = isGoogleAuthConfigured();

  return (
    <div className="page-shell gap-10">
      <PageIntro
        eyebrow="Account"
        title="Create an account"
        description={
          googleAuth
            ? "Use Google or pick a username for your profile URL. You can publish skills as soon as you are signed in."
            : "Pick a username for your profile URL. You can publish skills as soon as you are signed in."
        }
      />
      <Suspense fallback={<p className="text-[16px] font-medium text-[#8f8f8f]">Loading…</p>}>
        <EmailSignupForm googleAuthEnabled={googleAuth} />
      </Suspense>
    </div>
  );
}
