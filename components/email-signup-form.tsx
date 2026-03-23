"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { isUsernameAvailableForRegistration } from "@/lib/username-registration";
import { formatSignUpErrorMessage, hasValidDisplayNameStart, sanitizeUsername, startsWithLetterOrNumber } from "@/lib/utils";

export function EmailSignupForm({ googleAuthEnabled = false }: { googleAuthEnabled?: boolean }) {
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
    const cleanDisplayName = displayName.trim();

    if (cleanUser.length < 3) {
      setError("Username must be at least 3 characters.");
      setPending(false);
      return;
    }

    if (!startsWithLetterOrNumber(username)) {
      setError("Username must start with a letter or number.");
      setPending(false);
      return;
    }

    if (cleanDisplayName.length < 3) {
      setError("Display name must be at least 3 characters.");
      setPending(false);
      return;
    }

    if (!hasValidDisplayNameStart(displayName)) {
      setError("Display name must start with a letter or number.");
      setPending(false);
      return;
    }

    const usernameFree = await isUsernameAvailableForRegistration(username);
    if (!usernameFree) {
      setPending(false);
      setError("That username is already taken.");
      return;
    }

    const { error: signError } = await authClient.signUp.email({
      email,
      password,
      name: cleanDisplayName,
      // `username` is configured as an additional field on the user model in `lib/auth.ts`
      username: cleanUser,
    } as Parameters<typeof authClient.signUp.email>[0]);

    setPending(false);

    if (signError) {
      setError(formatSignUpErrorMessage(signError.message, "Could not create account."));
      return;
    }

    try {
      await fetch("/api/account/bootstrap", {
        method: "POST",
      });
    } catch {
      // Keep signup successful even if the follow-up email bootstrap fails.
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[560px] space-y-8">
      {googleAuthEnabled ? (
        <>
          <GoogleSignInButton callbackURL={nextPath} label="Sign up with Google" />
          <div className="flex items-center gap-4 text-[14px] font-medium text-[#8f8f8f]">
            <span className="h-px flex-1 bg-zinc-200" />
            or sign up with email
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
        <span className="profile-field-label">Username</span>
        <input
          type="text"
          name="username"
          autoComplete="username"
          required
          minLength={3}
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          className="skl-input"
        />
        <span className="profile-field-help">Lowercase letters, numbers, and hyphens. Used in your profile URL.</span>
      </label>

      <label className="profile-field-row block">
        <span className="profile-field-label">Display name</span>
        <input
          type="text"
          name="displayName"
          autoComplete="name"
          required
          minLength={3}
          value={displayName}
          onChange={(ev) => setDisplayName(ev.target.value)}
          className="skl-input"
        />
      </label>

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
        className="skl-btn skl-btn-primary w-full justify-center"
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>

      <p className="text-center text-[16px] font-medium text-[#8f8f8f]">
        Already registered?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="profile-link"
        >
          Sign in
        </Link>
      </p>
    </form>
    </div>
  );
}
