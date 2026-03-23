"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SignOutButton } from "@/components/sign-out-button";
import { authClient } from "@/lib/auth-client";
import { sanitizeUsername } from "@/lib/utils";

type InitialViewer = {
  displayName: string;
  email: string | null;
  emailVerified: boolean;
  username: string;
} | null;

const CLAIM_CALLBACK_URL = "/claim/card";

export function ClaimForm({
  verificationAvailable,
  initialViewer,
}: {
  verificationAvailable: boolean;
  initialViewer: InitialViewer;
}) {
  const alreadyClaimed = Boolean(initialViewer);
  const pendingVerification = alreadyClaimed && !initialViewer?.emailVerified;

  const [email, setEmail] = useState(initialViewer?.email ?? "");
  const [username, setUsername] = useState(initialViewer?.username ?? "");
  const [displayName, setDisplayName] = useState(initialViewer?.displayName ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    pendingVerification ? `Verification email sent to ${initialViewer?.email ?? "your inbox"}.` : null,
  );
  const [pending, setPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);

  const canSubmit = verificationAvailable && !pendingVerification;
  const helperText = useMemo(() => {
    if (!verificationAvailable) {
      return "Claims are disabled until email delivery is configured.";
    }

    if (pendingVerification) {
      return "Open the verification link in your inbox to finish claiming your card.";
    }

    return "We’ll email a verification link before your card is unlocked.";
  }, [pendingVerification, verificationAvailable]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const cleanEmail = email.trim();
    const cleanUser = sanitizeUsername(username);
    const cleanDisplayName = displayName.trim() || cleanUser;

    if (!verificationAvailable) {
      setError("Claim email verification is not configured.");
      return;
    }

    if (cleanUser.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (cleanDisplayName.length < 3) {
      setError("Display name must be at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setPending(true);

    const { error: signError } = await authClient.signUp.email({
      callbackURL: CLAIM_CALLBACK_URL,
      email: cleanEmail,
      name: cleanDisplayName,
      password,
      username: cleanUser,
    } as Parameters<typeof authClient.signUp.email>[0]);

    setPending(false);

    if (signError) {
      setError(signError.message ?? "Could not create claim.");
      return;
    }

    setNotice(`Verification email sent to ${cleanEmail}. Open it to unlock your card.`);
  }

  async function resendVerification() {
    if (!email.trim()) {
      setError("No email is available to resend verification.");
      return;
    }

    setError(null);
    setNotice(null);
    setResendPending(true);

    const response = await authClient.sendVerificationEmail({
      callbackURL: CLAIM_CALLBACK_URL,
      email: email.trim(),
    } as never);

    setResendPending(false);

    if (response.error) {
      setError(response.error.message ?? "Could not resend verification email.");
      return;
    }

    setNotice(`Another verification email was sent to ${email.trim()}.`);
  }

  return (
    <div className="mx-auto w-full max-w-[640px] rounded-[32px] border border-zinc-200 bg-[linear-gradient(180deg,rgba(250,250,248,0.96),rgba(255,255,255,1))] p-6 sm:p-8">
      <div className="space-y-2">
        <p className="page-kicker">Claim Flow</p>
        <p className="text-[18px] font-semibold text-[#242424]">
          {pendingVerification ? "Check your email" : "Create your card"}
        </p>
        <p className="text-[15px] font-medium leading-6 text-[#8f8f8f]">{helperText}</p>
      </div>

      {error ? (
        <p className="mt-6 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[15px] font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="mt-6 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] font-medium text-emerald-700">
          {notice}
        </p>
      ) : null}

      {pendingVerification ? (
        <div className="mt-8 space-y-5">
          <div className="rounded-[24px] border border-zinc-200 bg-white p-5">
            <p className="text-[16px] font-semibold text-[#242424]">{displayName}</p>
            <p className="mt-1 text-[15px] font-medium text-[#8f8f8f]">@{username}</p>
            <p className="mt-4 text-[15px] font-medium text-[#242424]/70">{email}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resendVerification}
              disabled={resendPending || !verificationAvailable}
              className="skl-btn skl-btn-primary"
            >
              {resendPending ? "Sending…" : "Resend verification"}
            </button>
            <Link href="/login" className="skl-btn skl-btn-secondary">
              Sign in instead
            </Link>
            <SignOutButton className="bg-zinc-100/80 px-4 py-2.5 text-[15px] font-medium text-[#242424]" />
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-7">
          <label className="profile-field-row block">
            <span className="profile-field-label">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              disabled={!canSubmit || pending}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="skl-input"
            />
          </label>

          <label className="profile-field-row block">
            <span className="profile-field-label">Username</span>
            <input
              type="text"
              autoComplete="username"
              required
              minLength={3}
              disabled={!canSubmit || pending}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="skl-input"
            />
            <span className="profile-field-help">This becomes your public profile URL.</span>
          </label>

          <label className="profile-field-row block">
            <span className="profile-field-label">Display name</span>
            <input
              type="text"
              autoComplete="name"
              required
              minLength={3}
              disabled={!canSubmit || pending}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="skl-input"
            />
          </label>

          <label className="profile-field-row block">
            <span className="profile-field-label">Password</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={!canSubmit || pending}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="skl-input"
            />
            <span className="profile-field-help">Needed so you can sign back in later after claiming.</span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit || pending}
            className="skl-btn skl-btn-primary w-full justify-center"
          >
            {pending ? "Creating claim…" : "Send verification email"}
          </button>
        </form>
      )}
    </div>
  );
}
