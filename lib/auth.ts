import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import type { AppViewer } from "@/lib/types";

const baseURL =
  process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET;

function createAuth() {
  if (!db) {
    throw new Error("DATABASE_URL is required for authentication.");
  }

  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be set to a random string of at least 32 characters.");
  }

  return betterAuth({
    baseURL,
    secret,
    // Schema uses uuid columns; Better Auth’s default ids are nanoid strings and Postgres rejects them.
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
      camelCase: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      modelName: "users",
      fields: {
        name: "displayName",
        image: "avatarUrl",
      },
      additionalFields: {
        username: { type: "string", required: true },
        bio: { type: "string", required: false },
        website: { type: "string", required: false },
        xUrl: { type: "string", required: false },
      },
    },
    session: { modelName: "sessions" },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },
    trustedOrigins: [baseURL],
    plugins: [nextCookies()],
  });
}

let authSingleton: ReturnType<typeof createAuth> | null = null;

export function getAuth() {
  if (!db || !secret) {
    return null;
  }
  if (!authSingleton) {
    authSingleton = createAuth();
  }
  return authSingleton;
}

export function isAppConfigured() {
  return Boolean(db && secret && secret.length >= 32);
}

export async function getAuthSession() {
  const auth = getAuth();

  if (!auth) {
    return null;
  }

  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    return session;
  } catch {
    return null;
  }
}

export async function getCurrentViewer(): Promise<AppViewer | null> {
  if (!db) {
    return null;
  }

  const session = await getAuthSession();

  if (!session?.user) {
    return null;
  }

  let localUser;

  try {
    localUser = await db.query.users.findFirst({
      where: eq(schema.users.id, session.user.id),
    });
  } catch {
    return null;
  }

  if (!localUser) {
    return null;
  }

  return {
    id: localUser.id,
    email: localUser.email,
    username: localUser.username,
    displayName: localUser.displayName,
    bio: localUser.bio,
    avatarUrl: localUser.avatarUrl,
    website: localUser.website,
    xUrl: localUser.xUrl,
    createdAt: localUser.createdAt.toISOString(),
  };
}

export async function requireCurrentViewer(redirectTo = "/login") {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }

  return viewer;
}
