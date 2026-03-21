import { Suspense } from "react";

import { EmailSignupForm } from "@/components/email-signup-form";
import { SectionHeading } from "@/components/section-heading";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-lg space-y-10">
      <SectionHeading
        eyebrow="Account"
        title="Create an account"
        description="Pick a username for your profile URL. You can publish skills as soon as you are signed in."
      />
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <EmailSignupForm />
      </Suspense>
    </div>
  );
}
