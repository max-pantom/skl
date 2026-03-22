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
    <header className="-mx-4 mb-8 pt-2 sm:-mx-6 lg:-mx-10">
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="size-3 rounded-[2px] bg-zinc-300 dark:bg-zinc-700" aria-hidden />
          <Link href="/" className="text-[1.7rem] font-medium tracking-tight text-ink">
            Skl
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition",
                item.href === "/new"
                  ? "bg-zinc-200 text-ink hover:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  : "bg-zinc-100/50 text-zinc-500 hover:bg-zinc-100 hover:text-ink dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
              )}
            >
              {item.href === "/new" ? "Create" : item.label}
            </Link>
          ))}

          <ThemeToggle />

          {viewer ? (
            <>
              <Link
                href={`/u/${viewer.username}`}
                className="rounded-full bg-zinc-100/50 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-ink dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                @{viewer.username}
              </Link>
              <Link
                href="/settings"
                className="rounded-full bg-zinc-100/50 px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-ink dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Settings
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full bg-zinc-100/50 px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-ink dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-zinc-100/50 px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-ink dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {!isAppConfigured() ? (
        <p className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 sm:mx-6 lg:mx-10">
          Configure <code className="rounded bg-amber-100/80 px-1 font-mono">DATABASE_URL</code> and{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono">BETTER_AUTH_SECRET</code> to enable accounts and publishing.
        </p>
      ) : !isDatabaseConfigured ? (
        <p className="mx-4 mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 sm:mx-6 lg:mx-10">
          Database URL missing.
        </p>
      ) : null}
    </header>
  );
}
