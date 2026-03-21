import Link from "next/link";

import { FormNotice } from "@/components/form-notice";
import { SignupForm } from "@/components/signup-form";
import { isAppConfigured } from "@/lib/auth";

export default function SignupPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4 rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Auth</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">Create account</h1>
        <p className="text-sm leading-7 text-slate-600">
          This creates a Better Auth user record and the matching public profile used by SKL skill authorship.
        </p>
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-accent underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>

      <div className="space-y-5 rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        {!isAppConfigured() ? (
          <FormNotice tone="info">
            Set <code>DATABASE_URL</code> and <code>BETTER_AUTH_SECRET</code> before creating an account.
          </FormNotice>
        ) : null}
        <SignupForm />
      </div>
    </section>
  );
}
