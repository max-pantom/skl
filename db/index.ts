import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  postgresClient?: ReturnType<typeof postgres>;
  drizzleDb?: PostgresJsDatabase<typeof schema>;
};

const databaseUrl = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(databaseUrl);

const isLocal =
  databaseUrl != null &&
  (databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1"));

/** Supabase transaction pooler (PgBouncer) requires no prepared statements. */
const postgresClient = databaseUrl
  ? (globalForDb.postgresClient ??=
      postgres(databaseUrl, {
        prepare: false,
        ssl: isLocal ? undefined : "require",
        connect_timeout: 60,
      }))
  : null;

export const db = postgresClient
  ? (globalForDb.drizzleDb ??= drizzle(postgresClient, { schema }))
  : null;

export { schema };
