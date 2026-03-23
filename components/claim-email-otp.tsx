"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

const LEN = 5;

export function ClaimEmailOtp({
  email,
  disabled,
}: {
  email: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [digits, setDigits] = useState(() => Array<string>(LEN).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [verifyPending, setVerifyPending] = useState(false);

  const code = digits.join("");

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, [email]);

  function focusIndex(i: number) {
    const el = inputsRef.current[i];
    el?.focus();
    el?.select();
  }

  function handleChange(index: number, raw: string) {
    const v = raw.replace(/\D/g, "").slice(-1);
    setLocalError(null);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < LEN - 1) {
      requestAnimationFrame(() => focusIndex(index + 1));
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!text) {
      return;
    }
    setLocalError(null);
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < LEN; i += 1) {
        next[i] = text[i] ?? "";
      }
      return next;
    });
    const last = Math.min(text.length, LEN) - 1;
    requestAnimationFrame(() => focusIndex(Math.max(0, last)));
  }

  async function verify() {
    if (code.length !== LEN) {
      setLocalError(`Enter all ${LEN} digits.`);
      return;
    }

    setLocalError(null);
    setVerifyPending(true);

    const { error: verifyError } = await authClient.emailOtp.verifyEmail({
      email: email.trim(),
      otp: code,
    });

    setVerifyPending(false);

    if (verifyError) {
      const msg = verifyError.message?.toLowerCase() ?? "";
      if (msg.includes("invalid") || msg.includes("otp")) {
        setLocalError("That code is not valid or has expired. Try again or resend a new code.");
      } else {
        setLocalError(verifyError.message ?? "Could not verify that code.");
      }
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full gap-3" onPaste={handlePaste}>
        {digits.map((d, index) => (
          <input
            key={`claim-otp-${index}`}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={d}
            disabled={disabled || verifyPending}
            aria-label={`Digit ${index + 1} of ${LEN}`}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className="h-[43px] min-w-0 flex-1 rounded-[18px] border-0 bg-[#e4e4e4] text-center text-[18px] font-semibold text-[#242424] outline-none ring-0 transition focus:bg-[#dadada] disabled:opacity-50"
          />
        ))}
      </div>

      {localError ? (
        <p className="text-center text-[15px] font-medium text-red-700">{localError}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void verify()}
        disabled={disabled || verifyPending || code.length !== LEN}
        className="skl-btn skl-btn-primary mt-1 w-full justify-center rounded-[18px] py-3"
      >
        {verifyPending ? "Verifying…" : "Verify"}
      </button>
    </div>
  );
}
