import { Suspense } from "react";

import { EmailLoginForm } from "@/components/email-login-form";
import { PageIntro } from "@/components/page-intro";
import { isGoogleAuthConfigured } from "@/lib/google-auth";

export default function LoginPage() {
  const googleAuth = isGoogleAuthConfigured();

  return (
    <div className="page-shell gap-10">
      <PageIntro
        eyebrow="Account"
        title="Sign in"
        description={
          googleAuth
            ? "Continue with Google or use your email and password."
            : "Use your email and password to continue."
        }
      />
      <Suspense fallback={<p className="text-[16px] font-medium text-[#8f8f8f]">Loading…</p>}>
        <EmailLoginForm googleAuthEnabled={googleAuth} />
      </Suspense>
    </div>
  );
}
