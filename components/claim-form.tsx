"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ClaimEmailOtp } from "@/components/claim-email-otp";
import { ClaimProgressDots } from "@/components/claim-progress-dots";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { SignOutButton } from "@/components/sign-out-button";
import { authClient } from "@/lib/auth-client";
import { isUsernameAvailableForRegistration } from "@/lib/username-registration";
import { formatSignUpErrorMessage, hasValidDisplayNameStart, sanitizeUsername, startsWithLetterOrNumber } from "@/lib/utils";

type InitialViewer = {
  displayName: string;
  email: string | null;
  emailVerified: boolean;
  username: string;
} | null;

const CLAIM_CALLBACK_URL = "/claim";

const claimPillClass =
  "flex w-full items-center gap-1 rounded-[18px] bg-[#e4e4e4] px-4 py-3 text-[16px] font-medium text-[#242424]";

const claimInputClass =
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-[#242424] placeholder:text-[#242424]/30 focus:outline-none focus:ring-0";

export function ClaimForm({
  verificationAvailable,
  initialViewer,
  profileUrlPrefix,
  googleOAuthConfigured,
}: {
  verificationAvailable: boolean;
  initialViewer: InitialViewer;
  profileUrlPrefix: string;
  googleOAuthConfigured: boolean;
}) {
  const router = useRouter();
  const alreadyClaimed = Boolean(initialViewer);
  const pendingVerification = alreadyClaimed && !initialViewer?.emailVerified;

  const [email, setEmail] = useState(initialViewer?.email ?? "");
  const [username, setUsername] = useState(initialViewer?.username ?? "");
  const [displayName] = useState(initialViewer?.displayName ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [otpResendKey, setOtpResendKey] = useState(0);

  const canSubmit = verificationAvailable && !pendingVerification;

  const claimStep: 1 | 2 | 3 =
    pendingVerification ||
    (notice != null && (notice.includes("5-digit code") || notice.includes("Verification email")))
      ? 2
      : 1;
  const helperText = useMemo(() => {
    if (!verificationAvailable) {
      return "Claims are disabled until email delivery is configured.";
    }

    if (pendingVerification) {
      return "Enter the code from your email below, or resend if you need a new one.";
    }

    return "We’ll email a 5-digit code to verify before your card is unlocked.";
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

    if (!startsWithLetterOrNumber(username)) {
      setError("Username must start with a letter or number.");
      return;
    }

    if (cleanDisplayName.length < 3) {
      setError("Display name must be at least 3 characters.");
      return;
    }

    if (!hasValidDisplayNameStart(displayName || cleanDisplayName)) {
      setError("Display name must start with a letter or number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setPending(true);

    const usernameFree = await isUsernameAvailableForRegistration(username);
    if (!usernameFree) {
      setPending(false);
      setError("That username is already taken.");
      return;
    }

    const { error: signError } = await authClient.signUp.email({
      callbackURL: CLAIM_CALLBACK_URL,
      email: cleanEmail,
      name: cleanDisplayName,
      password,
      username: cleanUser,
    } as Parameters<typeof authClient.signUp.email>[0]);

    setPending(false);

    if (signError) {
      setError(formatSignUpErrorMessage(signError.message, "Could not create claim."));
      return;
    }

    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email: cleanEmail,
      type: "email-verification",
    });

    if (otpError) {
      setError(otpError.message ?? "Claim created, but we could not send the verification code.");
      return;
    }

    setOtpResendKey((k) => k + 1);
    setNotice(`We sent a 5-digit code to ${cleanEmail}. Enter it below to finish.`);
    router.refresh();
  }

  async function resendVerification() {
    if (!email.trim()) {
      setError("No email is available to resend verification.");
      return;
    }

    setError(null);
    setNotice(null);
    setResendPending(true);

    const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "email-verification",
    });

    setResendPending(false);

    if (resendError) {
      setError(resendError.message ?? "Could not resend the code.");
      return;
    }

    setOtpResendKey((k) => k + 1);
    setNotice(`A new code was sent to ${email.trim()}.`);
  }

  return (
    <div className="flex min-h-[min(720px,calc(100dvh-6rem))] flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-0 pb-10 pt-4 sm:pb-16 sm:pt-6">
        <div className="flex w-full max-w-[367px] flex-col items-center gap-12">
          {pendingVerification ? (
            <>
              <div className="flex w-full flex-col items-center gap-2 text-center">
                <h1 className="w-full text-[24px] font-semibold leading-tight text-[#242424]">
                  Verify your account
                </h1>
                <p className="max-w-[283px] text-[16px] font-medium leading-snug text-black/50">
                  A code has been sent to your email
                </p>
              </div>

              {error ? (
                <p className="w-full rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[15px] font-medium text-red-700">
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className="w-full rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] font-medium text-emerald-700">
                  {notice}
                </p>
              ) : null}

              <div className="flex w-full flex-col gap-3">
                <ClaimEmailOtp
                  key={otpResendKey}
                  email={email}
                  disabled={!verificationAvailable || resendPending}
                />
                <p className="text-center text-[15px] font-medium text-black/45">{helperText}</p>
                <button
                  type="button"
                  onClick={() => void resendVerification()}
                  disabled={resendPending || !verificationAvailable}
                  className="text-[16px] font-medium text-[#242424] underline decoration-[#242424]/30 underline-offset-4 transition hover:decoration-[#242424]"
                >
                  {resendPending ? "Sending…" : "Resend code"}
                </button>
                <Link
                  href="/login"
                  className="skl-btn skl-btn-secondary w-full justify-center rounded-[18px] py-3"
                >
                  Sign in instead
                </Link>
                <SignOutButton className="rounded-[18px] bg-[#e4e4e4] px-4 py-3 text-center text-[15px] font-medium text-[#242424] hover:bg-[#dadada]" />
              </div>
            </>
          ) : (
            <>
              <div className="flex w-full max-w-[246px] flex-col items-center gap-2 text-center">
                <h1 className="w-full text-[24px] font-semibold leading-tight text-[#242424]">Claim your username</h1>
                <p className="w-full text-[16px] font-medium leading-snug text-black/50">see you soon</p>
              </div>

              {error ? (
                <p className="w-full rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[15px] font-medium text-red-700">
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className="w-full rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] font-medium text-emerald-700">
                  {notice}
                </p>
              ) : null}

              {!verificationAvailable ? (
                <p className="w-full rounded-[18px] bg-[#e4e4e4] px-4 py-3 text-center text-[15px] font-medium text-[#242424]/80">
                  {helperText}
                </p>
              ) : null}

              <form onSubmit={onSubmit} className="flex w-full flex-col items-center gap-3">
                <label className={claimPillClass}>
                  <span className="shrink-0 text-[#848484]">{profileUrlPrefix}</span>
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    minLength={3}
                    disabled={!canSubmit || pending}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="username"
                    className={claimInputClass}
                  />
                </label>

                <label className={`${claimPillClass} w-full`}>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    disabled={!canSubmit || pending}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    className={`${claimInputClass} w-full`}
                  />
                </label>

                <label className={`${claimPillClass} w-full`}>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={!canSubmit || pending}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className={`${claimInputClass} w-full`}
                  />
                </label>

                <button
                  type="submit"
                  disabled={!canSubmit || pending}
                  className="skl-btn skl-btn-primary mt-1 w-full justify-center rounded-[18px] py-3"
                >
                  {pending ? "Sending…" : "Verify with email"}
                </button>

                {googleOAuthConfigured ? (
                  <>
                    <p className="pt-1 text-[16px] font-medium text-black">Or</p>
                    <GoogleSignInButton
                      callbackURL={CLAIM_CALLBACK_URL}
                      showGlyph={false}
                      label="Continue with Google"
                      className="rounded-[18px] py-3"
                    />
                  </>
                ) : null}
              </form>
            </>
          )}
        </div>
      </div>

      <ClaimProgressDots step={claimStep} />
    </div>
  );
}
