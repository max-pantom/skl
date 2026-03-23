import dynamic from "next/dynamic";
import { Suspense } from "react";

import { PageIntro } from "@/components/page-intro";
import { isGoogleAuthConfigured } from "@/lib/google-auth";

const formLoading = (
  <p className="text-[16px] font-medium text-[#8f8f8f]">Loading…</p>
);

/** Separate chunk from the route shell — avoids flaky dev ChunkLoadError when `app/login/page` HMR gets out of sync. */
const EmailLoginForm = dynamic(
  () => import("@/components/email-login-form").then((m) => ({ default: m.EmailLoginForm })),
  { loading: () => formLoading },
);

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
      <Suspense fallback={formLoading}>
        <EmailLoginForm googleAuthEnabled={googleAuth} />
      </Suspense>
    </div>
  );
}
