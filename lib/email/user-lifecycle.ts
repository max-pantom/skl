import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { userEmailEvents, users } from "@/db/schema";
import { getResend } from "@/lib/email/resend-client";
import { sendUserProfileEmail } from "@/lib/email/send-user-profile-email";

type UserEmailEventKind = "profile_welcome" | "resend_audience_sync";

export const PROFILE_WELCOME_EVENT: UserEmailEventKind = "profile_welcome";
export const RESEND_AUDIENCE_SYNC_EVENT: UserEmailEventKind = "resend_audience_sync";

function splitDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? displayName.trim();
  const lastName = parts.slice(1).join(" ") || undefined;
  return { firstName, lastName };
}

async function getUser(userId: string) {
  if (!db) {
    return null;
  }

  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

export async function getUserEmailEvent(userId: string, kind: UserEmailEventKind) {
  if (!db) {
    return null;
  }

  return db.query.userEmailEvents.findFirst({
    where: (table, { and }) => and(eq(table.userId, userId), eq(table.kind, kind)),
  });
}

async function upsertUserEmailEvent(input: {
  userId: string;
  kind: UserEmailEventKind;
  externalId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!db) {
    return;
  }

  const existing = await getUserEmailEvent(input.userId, input.kind);
  const payload = {
    externalId: input.externalId ?? null,
    metadata: input.metadata ?? {},
    sentAt: new Date(),
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(userEmailEvents)
      .set(payload)
      .where(eq(userEmailEvents.id, existing.id));
    return;
  }

  await db.insert(userEmailEvents).values({
    userId: input.userId,
    kind: input.kind,
    ...payload,
  });
}

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

export async function ensureUserProfileWelcomeEmailSent(userId: string, options?: { force?: boolean }) {
  const user = await getUser(userId);
  if (!user) {
    return { ok: false as const, error: "User not found." };
  }

  const existing = await getUserEmailEvent(userId, PROFILE_WELCOME_EVENT);
  if (existing && !options?.force) {
    return { ok: true as const, skipped: true as const };
  }

  const rank = await earlyBelieverRankFor(user.id, user.createdAt);
  const result = await sendUserProfileEmail({
    to: user.email,
    displayName: user.displayName,
    username: user.username,
    userId: user.id,
    avatarUrl: user.avatarUrl,
    earlyBelieverRank: rank,
  });

  if (!result.ok) {
    return result;
  }

  await upsertUserEmailEvent({
    userId,
    kind: PROFILE_WELCOME_EVENT,
    externalId: result.id,
    metadata: { email: user.email },
  });

  return { ok: true as const, skipped: false as const };
}

export async function syncUserToResendAudience(userId: string, options?: { force?: boolean }) {
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();
  if (!audienceId) {
    return { ok: true as const, skipped: true as const, reason: "RESEND_AUDIENCE_ID is not set." };
  }

  const resend = getResend();
  if (!resend) {
    return { ok: false as const, error: "RESEND_API_KEY is not set." };
  }

  const user = await getUser(userId);
  if (!user) {
    return { ok: false as const, error: "User not found." };
  }

  const existingEvent = await getUserEmailEvent(userId, RESEND_AUDIENCE_SYNC_EVENT);
  if (existingEvent && !options?.force) {
    return { ok: true as const, skipped: true as const };
  }

  const { firstName, lastName } = splitDisplayName(user.displayName);
  const contactList = await resend.contacts.list({ audienceId });

  if (contactList.error || !contactList.data) {
    return { ok: false as const, error: contactList.error?.message ?? "Could not load audience contacts." };
  }

  const existingContact = contactList.data.data.find(
    (contact) => contact.email.toLowerCase() === user.email.toLowerCase(),
  );

  if (existingContact) {
    const updateResult = await resend.contacts.update({
      id: existingContact.id,
      audienceId,
      firstName,
      lastName,
      unsubscribed: existingContact.unsubscribed,
    });

    if (updateResult.error || !updateResult.data) {
      return { ok: false as const, error: updateResult.error?.message ?? "Could not update audience contact." };
    }

    await upsertUserEmailEvent({
      userId,
      kind: RESEND_AUDIENCE_SYNC_EVENT,
      externalId: existingContact.id,
      metadata: { audienceId, email: user.email },
    });

    return { ok: true as const, skipped: false as const };
  }

  const createResult = await resend.contacts.create({
    audienceId,
    email: user.email,
    firstName,
    lastName,
    unsubscribed: false,
  });

  if (createResult.error || !createResult.data) {
    return { ok: false as const, error: createResult.error?.message ?? "Could not create audience contact." };
  }

  await upsertUserEmailEvent({
    userId,
    kind: RESEND_AUDIENCE_SYNC_EVENT,
    externalId: createResult.data.id,
    metadata: { audienceId, email: user.email },
  });

  return { ok: true as const, skipped: false as const };
}

export async function bootstrapUserEmailLifecycle(
  userId: string,
  options?: { forceWelcomeEmail?: boolean; forceAudienceSync?: boolean },
) {
  const [welcome, audience] = await Promise.all([
    ensureUserProfileWelcomeEmailSent(userId, { force: options?.forceWelcomeEmail }),
    syncUserToResendAudience(userId, { force: options?.forceAudienceSync }),
  ]);

  return { welcome, audience };
}
