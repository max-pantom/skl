import { Suspense } from "react";

import { EmailLoginForm } from "@/components/email-login-form";
import { PageIntro } from "@/components/page-intro";

export default function LoginPage() {
  return (
    <div className="page-shell gap-10">
      <PageIntro
        eyebrow="Account"
        title="Sign in"
        description="Email and password. Sessions are stored in your PostgreSQL database via Better Auth."
      />
      <Suspense fallback={<p className="text-[16px] font-medium text-[#8f8f8f]">Loading…</p>}>
        <EmailLoginForm />
      </Suspense>
    </div>
  );
}
