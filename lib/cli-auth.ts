import { createHash, randomBytes } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";

import { db, isDatabaseConfigured } from "@/db";
import { cliAuthRequests, cliSessions, users } from "@/db/schema";
import type { AppViewer } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";

const CLI_AUTH_TTL_MS = 10 * 60 * 1000;
const CLI_POLL_INTERVAL_SECONDS = 2;

function randomToken(size = 32) {
  return randomBytes(size).toString("hex");
}

function formatUserCode(bytes: Buffer) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";

  for (let i = 0; i < 8; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }

  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

function hashToken(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function toViewer(user: typeof users.$inferSelect): AppViewer {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    needsProfileSetup: user.needsProfileSetup,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    website: user.website,
    xUrl: user.xUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export function cliAuthorizeUrl(userCode: string) {
  return absoluteUrl(`/cli/authorize?user_code=${encodeURIComponent(userCode)}`);
}

export async function createCliAuthRequest() {
  if (!db || !isDatabaseConfigured) {
    throw new Error("CLI auth is not available right now.");
  }

  const deviceCode = randomToken(24);
  const userCode = formatUserCode(randomBytes(8));
  const expiresAt = new Date(Date.now() + CLI_AUTH_TTL_MS);

  await db.insert(cliAuthRequests).values({
    deviceCode,
    userCode,
    expiresAt,
  });

  return {
    deviceCode,
    userCode,
    verificationUrl: cliAuthorizeUrl(userCode),
    expiresAt: expiresAt.toISOString(),
    intervalSeconds: CLI_POLL_INTERVAL_SECONDS,
  };
}

export async function getCliAuthRequestByUserCode(userCode: string) {
  if (!db || !isDatabaseConfigured) {
    return null;
  }

  return db.query.cliAuthRequests.findFirst({
    where: eq(cliAuthRequests.userCode, userCode),
  });
}

export async function getCliConnectionStatus(userId: string) {
  if (!db || !isDatabaseConfigured) {
    return { connected: false };
  }

  const session = await db.query.cliSessions.findFirst({
    where: and(eq(cliSessions.userId, userId), isNull(cliSessions.revokedAt)),
  });

  return {
    connected: Boolean(session),
  };
}

export async function revokeCliSessionsForUser(userId: string) {
  if (!db || !isDatabaseConfigured) {
    throw new Error("CLI auth is not available right now.");
  }

  await db
    .update(cliSessions)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(cliSessions.userId, userId), isNull(cliSessions.revokedAt)));
}

export async function approveCliAuthRequest(userCode: string, userId: string) {
  if (!db || !isDatabaseConfigured) {
    throw new Error("CLI auth is not available right now.");
  }

  const request = await db.query.cliAuthRequests.findFirst({
    where: eq(cliAuthRequests.userCode, userCode),
  });

  if (!request) {
    throw new Error("CLI login request not found.");
  }

  if (request.expiresAt.getTime() <= Date.now()) {
    throw new Error("CLI login request expired.");
  }

  if (request.rejectedAt) {
    throw new Error("CLI login request was rejected.");
  }

  if (request.approvedAt) {
    return;
  }

  const rawToken = `skl_${randomToken(24)}`;
  const tokenHash = hashToken(rawToken);

  const [session] = await db
    .insert(cliSessions)
    .values({
      userId,
      tokenHash,
    })
    .returning();

  await db
    .update(cliAuthRequests)
    .set({
      userId,
      cliSessionId: session.id,
      cliToken: rawToken,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(cliAuthRequests.id, request.id));
}

export async function rejectCliAuthRequest(userCode: string) {
  if (!db || !isDatabaseConfigured) {
    throw new Error("CLI auth is not available right now.");
  }

  const request = await db.query.cliAuthRequests.findFirst({
    where: eq(cliAuthRequests.userCode, userCode),
  });

  if (!request) {
    throw new Error("CLI login request not found.");
  }

  await db
    .update(cliAuthRequests)
    .set({
      rejectedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(cliAuthRequests.id, request.id));
}

export async function exchangeCliAuthRequest(deviceCode: string) {
  if (!db || !isDatabaseConfigured) {
    throw new Error("CLI auth is not available right now.");
  }

  const request = await db.query.cliAuthRequests.findFirst({
    where: eq(cliAuthRequests.deviceCode, deviceCode),
  });

  if (!request) {
    return { status: "not_found" as const };
  }

  if (request.expiresAt.getTime() <= Date.now()) {
    return { status: "expired" as const };
  }

  if (request.rejectedAt) {
    return { status: "rejected" as const };
  }

  if (!request.approvedAt || !request.cliToken || !request.userId) {
    return { status: "pending" as const };
  }

  if (request.exchangedAt) {
    return { status: "already_exchanged" as const };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, request.userId),
  });

  if (!user) {
    return { status: "not_found" as const };
  }

  await db
    .update(cliAuthRequests)
    .set({
      exchangedAt: new Date(),
      cliToken: null,
      updatedAt: new Date(),
    })
    .where(eq(cliAuthRequests.id, request.id));

  return {
    status: "approved" as const,
    token: request.cliToken,
    viewer: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  };
}

export async function getCliViewerFromToken(token: string | null | undefined): Promise<AppViewer | null> {
  if (!db || !isDatabaseConfigured || !token?.trim()) {
    return null;
  }

  const tokenHash = hashToken(token.trim());
  const session = await db.query.cliSessions.findFirst({
    where: and(eq(cliSessions.tokenHash, tokenHash), isNull(cliSessions.revokedAt)),
    with: {
      user: true,
    },
  });

  if (!session?.user) {
    return null;
  }

  await db
    .update(cliSessions)
    .set({
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(cliSessions.id, session.id));

  return toViewer(session.user);
}

export async function getCliViewerFromRequest(request: Request): Promise<AppViewer | null> {
  const authHeader = request.headers.get("authorization")?.trim() ?? "";

  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return getCliViewerFromToken(authHeader.slice(7));
}
