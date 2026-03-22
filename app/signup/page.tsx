import { Suspense } from "react";

import { EmailSignupForm } from "@/components/email-signup-form";
import { PageIntro } from "@/components/page-intro";

export default function SignupPage() {
  return (
    <div className="page-shell gap-10">
      <PageIntro
        eyebrow="Account"
        title="Create an account"
        description="Pick a username for your profile URL. You can publish skills as soon as you are signed in."
      />
      <Suspense fallback={<p className="text-[16px] font-medium text-[#8f8f8f]">Loading…</p>}>
        <EmailSignupForm />
      </Suspense>
    </div>
  );
}
