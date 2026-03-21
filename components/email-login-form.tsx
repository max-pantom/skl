"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function EmailLoginForm() {
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
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-5">
      {error ? (
        <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">Email</span>
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

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">Password</span>
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
        className="w-full rounded-full border border-ink bg-ink px-4 py-3 text-sm font-medium text-shell transition hover:bg-slate-900 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        No account?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(nextPath)}`}
          className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
