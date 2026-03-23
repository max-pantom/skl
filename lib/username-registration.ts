"use server";

import { eq } from "drizzle-orm";

import { db, isDatabaseConfigured } from "@/db";
import { users } from "@/db/schema";
import { sanitizeUsername } from "@/lib/utils";

/**
 * Returns whether `candidate` is free to use for a new account (after sanitizing).
 * DB still enforces uniqueness via `users_username_idx`; this is for fast feedback and clearer errors.
 */
export async function isUsernameAvailableForRegistration(candidate: string): Promise<boolean> {
  const username = sanitizeUsername(candidate);
  if (username.length < 3) {
    return false;
  }
  if (!db || !isDatabaseConfigured) {
    return true;
  }
  const existing = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { id: true },
  });
  return !existing;
}
