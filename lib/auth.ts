import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import * as schema from "@/db/schema";

const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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

let authSingleton: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (!db || !secret) {
    return null;
  }
  if (!authSingleton) {
    authSingleton = createAuth();
  }
  return authSingleton;
}
