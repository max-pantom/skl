import Link from "next/link";

import { FormNotice } from "@/components/form-notice";
import { LoginForm } from "@/components/login-form";
import { isAppConfigured } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next || "/explore";

  return (
    <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4 rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Auth</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">Sign in</h1>
        <p className="text-sm leading-7 text-slate-600">
          Better Auth handles the session layer. Drizzle writes skills, stars, forks, and profile updates into the Supabase Postgres database.
        </p>
        <p className="text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/signup" className="text-accent underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>

      <div className="space-y-5 rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        {!isAppConfigured() ? (
          <FormNotice tone="info">
            Set <code>DATABASE_URL</code> and <code>BETTER_AUTH_SECRET</code> before signing in.
          </FormNotice>
        ) : null}
        <LoginForm nextPath={nextPath} />
      </div>
    </section>
  );
}
