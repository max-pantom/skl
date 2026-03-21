import "dotenv/config";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db } from "../db";

async function main() {
  if (!db) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

