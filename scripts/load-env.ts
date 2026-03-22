/**
 * Import this file first in CLI scripts so `process.env` is populated before `@/db` (or other) modules load.
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });
