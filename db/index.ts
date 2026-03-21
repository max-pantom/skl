import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  postgresClient?: ReturnType<typeof postgres>;
  drizzleDb?: PostgresJsDatabase<typeof schema>;
};

const databaseUrl = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(databaseUrl);

const postgresClient = databaseUrl
  ? (globalForDb.postgresClient ??=
      postgres(databaseUrl, {
        prepare: false,
        ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? undefined : "require",
      }))
  : null;

export const db = postgresClient
  ? (globalForDb.drizzleDb ??= drizzle(postgresClient, { schema }))
  : null;

export { schema };
