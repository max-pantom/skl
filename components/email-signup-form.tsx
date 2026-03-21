"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { sanitizeUsername } from "@/lib/utils";

export function EmailSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/explore";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const cleanUser = sanitizeUsername(username);

    const { error: signError } = await authClient.signUp.email({
      email,
      password,
      name: displayName.trim() || cleanUser,
      // `username` is configured as an additional field on the user model in `lib/auth.ts`
      username: cleanUser,
    } as Parameters<typeof authClient.signUp.email>[0]);

    setPending(false);

    if (signError) {
      setError(signError.message ?? "Could not create account.");
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
        <span className="text-sm font-medium text-ink">Username</span>
        <input
          type="text"
          name="username"
          autoComplete="username"
          required
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          className="skl-input"
        />
        <span className="text-xs text-zinc-500">Lowercase letters, numbers, and hyphens. Used in your profile URL.</span>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">Display name</span>
        <input
          type="text"
          name="displayName"
          autoComplete="name"
          required
          value={displayName}
          onChange={(ev) => setDisplayName(ev.target.value)}
          className="skl-input"
        />
      </label>

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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="skl-input"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="skl-btn skl-btn-primary w-full py-3 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Already registered?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
