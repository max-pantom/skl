import { inspect } from "node:util";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendAuthVerificationEmail } from "@/lib/email/send-auth-verification-email";
import { getCliViewerFromRequest } from "@/lib/cli-auth";
import type { AppViewer } from "@/lib/types";
import { pickUniqueUsername } from "@/lib/oauth-username";

const baseURL =
  process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET;

/** Origins allowed for CORS / CSRF; includes apex ↔ www when `baseURL` is a single production host. */
function buildTrustedOrigins(primary: string): string[] {
  const extra = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const set = new Set<string>([primary, ...(extra ?? [])]);
  try {
    const u = new URL(primary);
    const host = u.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return [...set];
    }
    if (host.startsWith("www.")) {
      set.add(`${u.protocol}//${host.slice(4)}`);
    } else {
      set.add(`${u.protocol}//www.${host}`);
    }
  } catch {
    // keep primary + extra only
  }
  return [...set];
}

/**
 * In development, disable Better Auth logging unless AUTH_VERBOSE=1. Use stderr (not console.*) so Next.js does
 * not mirror verbose traces into the browser devtools.
 */
const betterAuthLogger =
  process.env.NODE_ENV === "development"
    ? {
        disabled: process.env.AUTH_VERBOSE !== "1",
        log(
          level: "debug" | "info" | "success" | "warn" | "error",
          message: string,
          ...args: unknown[]
        ) {
          const detail = args.length ? inspect(args, { depth: 6, colors: true, breakLength: 120 }) : "";
          process.stderr.write(`[better-auth:${level}] ${message}${detail ? ` ${detail}` : ""}\n`);
        },
      }
    : undefined;

function createAuth() {
  if (!db) {
    throw new Error("DATABASE_URL is required for authentication.");
  }

  const database = db;

  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be set to a random string of at least 32 characters.");
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const googleOAuthConfigured = Boolean(googleClientId && googleClientSecret);
  const emailDeliveryConfigured = Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim(),
  );

  return betterAuth({
    baseURL,
    secret,
    ...(betterAuthLogger ? { logger: betterAuthLogger } : {}),
    // experimental.joins breaks session lookup: adapter maps boolean `{ user: true }` to `with.users` instead of `with.user`.
    // Schema uses uuid columns; Better Auth’s default ids are nanoid strings and Postgres rejects them.
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
      camelCase: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    ...(emailDeliveryConfigured
      ? {
          emailVerification: {
            sendOnSignUp: true,
            autoSignInAfterVerification: true,
            sendOnSignIn: false,
          },
        }
      : {}),
    ...(googleOAuthConfigured
      ? {
          socialProviders: {
            google: {
              clientId: googleClientId!,
              clientSecret: googleClientSecret!,
            },
          },
        }
      : {}),
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const u = user as Record<string, unknown>;
            const email = typeof u.email === "string" ? u.email : "";
            const existingUsername =
              typeof u.username === "string" && u.username.trim() ? u.username.trim() : "";

            let username = existingUsername;
            const emailVerified = u.emailVerified === true;
            const needsProfileSetup = emailVerified || !existingUsername;
            if (!username) {
              const local = email.split("@")[0] || "user";
              username = await pickUniqueUsername(database, local);
            }

            const nameFromProvider = typeof u.name === "string" ? u.name.trim() : "";
            const name = nameFromProvider || username;

            return {
              data: {
                ...u,
                username,
                name,
                image: null,
                avatarUrl: null,
                needsProfileSetup,
                ...(emailVerified ? { emailVerifiedAt: new Date() } : {}),
              },
            };
          },
        },
        update: {
          before: async (data) => {
            const d = data as Record<string, unknown>;
            if (d.emailVerified === true) {
              const userId = typeof d.id === "string" ? d.id : null;

              if (!userId) {
                return { data: d };
              }

              const existingUser = await database.query.users.findFirst({
                columns: {
                  emailVerifiedAt: true,
                },
                where: eq(schema.users.id, userId),
              });

              if (existingUser?.emailVerifiedAt) {
                return { data: d };
              }

              return {
                data: {
                  ...d,
                  emailVerifiedAt: new Date(),
                },
              };
            }
            return { data: d };
          },
        },
      },
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
        emailVerifiedAt: { type: "date", required: false },
      },
    },
    session: { modelName: "sessions" },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },
    trustedOrigins: buildTrustedOrigins(baseURL),
    plugins: [
      ...(emailDeliveryConfigured
        ? [
            emailOTP({
              overrideDefaultEmailVerification: true,
              otpLength: 5,
              sendVerificationOnSignUp: false,
              async sendVerificationOTP({ email, otp, type }) {
                if (type !== "email-verification") {
                  return;
                }

                const result = await sendAuthVerificationEmail({
                  otp,
                  to: email,
                });

                if (!result.ok) {
                  throw new Error(result.error);
                }
              },
            }),
          ]
        : []),
      nextCookies(),
    ],
  });
}

let authSingleton: ReturnType<typeof createAuth> | null = null;

export function getAuth() {
  if (!db || !secret || secret.length < 32) {
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
    emailVerified: localUser.emailVerified,
    username: localUser.username,
    displayName: localUser.displayName,
    role: localUser.role,
    needsProfileSetup: localUser.needsProfileSetup,
    bio: localUser.bio,
    avatarUrl: localUser.avatarUrl,
    website: localUser.website,
    xUrl: localUser.xUrl,
    createdAt: localUser.createdAt.toISOString(),
  };
}

export async function getRequestViewer(request: Request): Promise<AppViewer | null> {
  const viewer = await getCurrentViewer();

  if (viewer) {
    return viewer;
  }

  return getCliViewerFromRequest(request);
}

export async function requireCurrentViewer(redirectTo = "/login") {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }

  return viewer;
}
