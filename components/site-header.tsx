import Link from "next/link";

import { isDatabaseConfigured } from "@/db";
import { getCurrentViewer, isAppConfigured } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/explore", label: "Explore" },
  { href: "/new", label: "Publish" },
];

export async function SiteHeader() {
  const viewer = await getCurrentViewer();

  return (
    <header className="sticky top-0 z-40 -mx-4 border-b border-line/80 bg-shell/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-mono text-xl font-semibold tracking-tight text-ink">
            SKL
          </Link>
          <span className="hidden rounded-full border border-accent/20 bg-accentSoft px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent sm:inline-flex">
            Portable AI skills
          </span>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm text-slate-700 transition hover:bg-white/80 hover:text-ink",
                item.href === "/new" && "border border-ink bg-ink text-shell hover:bg-slate-900 hover:text-shell",
              )}
            >
              {item.label}
            </Link>
          ))}

          {viewer ? (
            <>
              <Link
                href={`/u/${viewer.username}`}
                className="rounded-full px-3 py-2 text-sm text-slate-700 transition hover:bg-white/80 hover:text-ink"
              >
                @{viewer.username}
              </Link>
              <Link
                href="/settings"
                className="rounded-full px-3 py-2 text-sm text-slate-700 transition hover:bg-white/80 hover:text-ink"
              >
                Settings
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm text-slate-700 transition hover:bg-white/80 hover:text-ink"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm text-ink transition hover:border-ink"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
      {!isAppConfigured() ? (
        <div className="pb-3 text-xs text-slate-500">
          Running in local demo mode. Add <code>DATABASE_URL</code> and <code>BETTER_AUTH_SECRET</code> to use Better Auth with the Supabase database.
        </div>
      ) : !isDatabaseConfigured ? (
        <div className="pb-3 text-xs text-slate-500">
          Database access is not configured yet.
        </div>
      ) : null}
    </header>
  );
}
