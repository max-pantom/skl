import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/db/schema";
import { sanitizeUsername } from "@/lib/utils";

export type AppDb = PostgresJsDatabase<typeof schema>;

/**
 * Reserve a unique `users.username` derived from an email local-part or label.
 * Used for OAuth sign-up when the provider does not supply a username.
 */
export async function pickUniqueUsername(db: AppDb, preferred: string): Promise<string> {
  let base = sanitizeUsername(preferred);
  if (base.length < 3) {
    base = "user";
  }
  const baseMax = 28;
  base = base.slice(0, baseMax);

  for (let n = 0; n < 100; n++) {
    const candidate = n === 0 ? base : `${base}-${n}`.slice(0, 32);
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.username, candidate),
    });
    if (!existing) {
      return candidate;
    }
  }

  return `${base.slice(0, 20)}-${randomBytes(3).toString("hex")}`;
}
