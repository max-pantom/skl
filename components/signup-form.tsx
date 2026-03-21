"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const username = String(formData.get("username") ?? "").trim();
        const displayName = String(formData.get("displayName") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        startTransition(async () => {
          const signup = authClient.signUp.email as (payload: {
            username: string;
            name: string;
            email: string;
            password: string;
            callbackURL: string;
          }) => Promise<{
            error?: {
              message?: string;
            } | null;
          }>;

          const result = await signup({
            username,
            name: displayName,
            email,
            password,
            callbackURL: "/settings",
          });

          if (result.error) {
            setError(result.error.message || "Unable to create account.");
            return;
          }

          router.push("/settings");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Username</span>
          <input
            name="username"
            required
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Display name</span>
          <input
            name="displayName"
            required
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Email</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Password</span>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
        />
      </label>

      {error ? (
        <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full border border-ink bg-ink px-4 py-3 text-sm font-medium text-shell transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
