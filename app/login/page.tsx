import { Suspense } from "react";

import { EmailLoginForm } from "@/components/email-login-form";
import { SectionHeading } from "@/components/section-heading";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg space-y-10">
      <SectionHeading
        eyebrow="Account"
        title="Sign in"
        description="Email and password. Sessions are stored in your PostgreSQL database via Better Auth."
      />
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <EmailLoginForm />
      </Suspense>
    </div>
  );
}
