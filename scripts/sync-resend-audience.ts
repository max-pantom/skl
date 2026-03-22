import "./load-env";

import { eq } from "drizzle-orm";

import { db, isDatabaseConfigured } from "@/db";
import { users } from "@/db/schema";
import {
  RESEND_AUDIENCE_SYNC_EVENT,
  getUserEmailEvent,
  syncUserToResendAudience,
} from "@/lib/email/user-lifecycle";

function readArgs() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const userIdArg = args.find((a) => a.startsWith("--user-id="))?.split("=")[1]?.trim();
  const limit = limitArg ? Math.max(1, parseInt(limitArg.split("=")[1] ?? "0", 10) || 0) : undefined;

  return { dryRun, force, limit, userIdArg };
}

async function main() {
  const { dryRun, force, limit, userIdArg } = readArgs();

  if (!isDatabaseConfigured || !db) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  if (!process.env.RESEND_AUDIENCE_ID?.trim()) {
    console.error("RESEND_AUDIENCE_ID is not set.");
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY?.trim() && !dryRun) {
    console.error("RESEND_API_KEY is not set (use --dry-run to skip syncing).");
    process.exit(1);
  }

  const rows = userIdArg
    ? await db.select().from(users).where(eq(users.id, userIdArg)).limit(1)
    : await db.select().from(users);

  if (userIdArg && rows.length === 0) {
    console.error("User not found:", userIdArg);
    process.exit(1);
  }

  const list = typeof limit === "number" ? rows.slice(0, limit) : rows;
  console.log(`Queue: ${list.length} user(s)${dryRun ? " (dry run)" : ""}`);

  let ok = 0;
  let fail = 0;

  for (const user of list) {
    if (dryRun) {
      const existing = await getUserEmailEvent(user.id, RESEND_AUDIENCE_SYNC_EVENT);
      const wouldSkip = Boolean(existing) && !force;
      console.log(wouldSkip ? "[dry-run][skip]" : "[dry-run][sync]", user.email, user.username);
      ok++;
      continue;
    }

    const result = await syncUserToResendAudience(user.id, { force });
    if (result.ok) {
      ok++;
      console.log(result.skipped ? "skip:" : "synced:", user.email);
    } else {
      fail++;
      console.error("fail:", user.email, result.error);
    }
  }

  console.log(`Done. ok=${ok} fail=${fail}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
