"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
      className={`rounded-full bg-zinc-100/70 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-[#242424] ${className}`}
    >
      Sign out
    </button>
  );
}
