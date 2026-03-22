"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export function EmailLoginForm({ googleAuthEnabled = false }: { googleAuthEnabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/explore";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const { error: signError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: nextPath,
    });

    setPending(false);

    if (signError) {
      setError(signError.message ?? "Could not sign in.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[560px] space-y-8">
      {googleAuthEnabled ? (
        <>
          <GoogleSignInButton callbackURL={nextPath} />
          <div className="flex items-center gap-4 text-[14px] font-medium text-[#8f8f8f]">
            <span className="h-px flex-1 bg-zinc-200" />
            or
            <span className="h-px flex-1 bg-zinc-200" />
          </div>
        </>
      ) : null}
      <form
        onSubmit={onSubmit}
        className={`space-y-8 ${googleAuthEnabled ? "" : "border-t border-zinc-200 pt-8"}`}
      >
      {error ? (
        <p className="border-y border-red-200 py-3 text-[16px] font-medium text-red-700">{error}</p>
      ) : null}

      <label className="profile-field-row block">
        <span className="profile-field-label">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="skl-input"
        />
      </label>

      <label className="profile-field-row block">
        <span className="profile-field-label">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="skl-input"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="skl-btn skl-btn-primary w-full justify-center"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-[16px] font-medium text-[#8f8f8f]">
        No account?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(nextPath)}`}
          className="profile-link"
        >
          Create one
        </Link>
      </p>
    </form>
    </div>
  );
}
