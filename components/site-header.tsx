import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { isDatabaseConfigured } from "@/db";
import { getCurrentViewer, isAppConfigured } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/explore", label: "Explore" },
  { href: "/new", label: "Publish" },
];

export async function SiteHeader() {
  const viewer = await getCurrentViewer();

  return (
    <header className="skl-divider -mx-4 mb-2 pb-6 pt-2 sm:-mx-6 sm:mb-4 lg:-mx-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="font-mono text-lg font-semibold tracking-tight text-ink">
            SKL
          </Link>
          <span className="hidden text-sm text-zinc-500 sm:inline">Registry for AI skills</span>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "skl-btn rounded-none px-3 py-2 text-sm",
                item.href === "/new" ? "skl-btn-primary" : "border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}

          <span className="mx-1 hidden h-4 w-px bg-zinc-200 sm:inline-block" aria-hidden />
          <ThemeToggle />

          {viewer ? (
            <>
              <Link
                href={`/u/${viewer.username}`}
                className="px-3 py-2 text-sm font-medium text-ink hover:underline hover:decoration-zinc-400 hover:underline-offset-4"
              >
                @{viewer.username}
              </Link>
              <Link
                href="/settings"
                className="px-3 py-2 text-sm text-zinc-600 hover:text-ink"
              >
                Settings
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-sm text-zinc-600 hover:text-ink"
              >
                Log in
              </Link>
              <Link href="/signup" className="skl-btn skl-btn-secondary rounded-none px-3 py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {!isAppConfigured() ? (
        <p className="mt-4 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Configure <code className="rounded bg-amber-100/80 px-1 font-mono">DATABASE_URL</code> and{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono">BETTER_AUTH_SECRET</code> to enable accounts and publishing.
        </p>
      ) : !isDatabaseConfigured ? (
        <p className="mt-4 border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">Database URL missing.</p>
      ) : null}
    </header>
  );
}
