import "./load-env";

import { eq, sql } from "drizzle-orm";

import { db, isDatabaseConfigured } from "@/db";
import { users } from "@/db/schema";
import { sendUserProfileEmail } from "@/lib/email/send-user-profile-email";

/** Same logic as `getEarlyBelieverRank` in `lib/data.ts` (avoid importing server-only there from tsx). */
async function earlyBelieverRankFor(userId: string, createdAt: Date): Promise<number | null> {
  if (!db) return null;
  try {
    const result = await db
      .select({
        rank: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(
        sql`${users.createdAt} < ${createdAt.toISOString()}::timestamptz OR (${users.createdAt} = ${createdAt.toISOString()}::timestamptz AND ${users.id} <= ${userId})`,
      );
    const rank = result[0]?.rank ?? null;
    return rank && rank <= 50 ? rank : null;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Send the SKL profile email to every user (or one user with --user-id=UUID).
 *
 * Requires: DATABASE_URL, RESEND_API_KEY, NEXT_PUBLIC_APP_URL (for image links).
 * Optional: EMAIL_FROM (default Resend sandbox sender).
 *
 * Usage:
 *   pnpm run email:send-profile -- --dry-run
 *   pnpm run email:send-profile -- --user-id=<uuid>
 *
 * The `--` after `run` is required so pnpm forwards flags. A lone `--` in argv is ignored.
 */
async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const dryRun = args.includes("--dry-run");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Math.max(1, parseInt(limitArg.split("=")[1] ?? "0", 10) || 0) : undefined;
  const userIdArg = args.find((a) => a.startsWith("--user-id="))?.split("=")[1]?.trim();

  if (!isDatabaseConfigured || !db) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY?.trim() && !dryRun) {
    console.error("RESEND_API_KEY is not set (use --dry-run to skip sending).");
    process.exit(1);
  }

  let rows;
  try {
    rows = userIdArg
      ? await db.select().from(users).where(eq(users.id, userIdArg)).limit(1)
      : await db.select().from(users);
  } catch (e) {
    const cause = e && typeof e === "object" && "cause" in e ? (e as { cause: unknown }).cause : null;
    const code = cause && typeof cause === "object" && "code" in cause ? String((cause as { code: string }).code) : "";
    if (code === "ENOTFOUND") {
      const msg =
        cause && typeof cause === "object" && "hostname" in cause
          ? String((cause as { hostname: string }).hostname)
          : "unknown host";
      console.error(
        `Database DNS failed (ENOTFOUND: ${msg}). Check DATABASE_URL in .env / .env.local — hostname must match your provider (e.g. Supabase pooler: *.pooler.supabase.com). VPN/offline typos also cause this.`,
      );
      process.exit(1);
    }
    throw e;
  }

  if (userIdArg && rows.length === 0) {
    console.error("User not found:", userIdArg);
    process.exit(1);
  }

  const list = typeof limit === "number" ? rows.slice(0, limit) : rows;

  console.log(`Queue: ${list.length} user(s)${dryRun ? " (dry run)" : ""}`);

  let ok = 0;
  let fail = 0;

  for (const u of list) {
    const rank = await earlyBelieverRankFor(u.id, u.createdAt);

    const payload = {
      to: u.email,
      displayName: u.displayName,
      username: u.username,
      userId: u.id,
      avatarUrl: u.avatarUrl,
      earlyBelieverRank: rank,
    };

    if (dryRun) {
      console.log("[dry-run]", u.email, u.username, rank ?? "—");
      ok++;
      continue;
    }

    const result = await sendUserProfileEmail(payload);
    if (result.ok) {
      ok++;
      console.log("sent:", u.email);
    } else {
      fail++;
      console.error("fail:", u.email, result.error);
    }

    await sleep(600);
  }

  console.log(`Done. ok=${ok} fail=${fail}`);
}

main().catch((e) => {
  const cause = e && typeof e === "object" && "cause" in e ? (e as { cause: unknown }).cause : null;
  const code = cause && typeof cause === "object" && "code" in cause ? String((cause as { code: string }).code) : "";
  if (code === "ENOTFOUND") {
    const msg =
      cause && typeof cause === "object" && "hostname" in cause
        ? String((cause as { hostname: string }).hostname)
        : "unknown host";
    console.error(
      `Database DNS failed (ENOTFOUND: ${msg}). Fix DATABASE_URL or network — see script header.`,
    );
    process.exit(1);
  }
  console.error(e);
  process.exit(1);
});
