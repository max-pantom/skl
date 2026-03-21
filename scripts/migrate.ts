import { config } from "dotenv";
import { resolve } from "node:path";

// Match Next.js: .env then .env.local (local overrides)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

/**
 * Parse host (+ optional port) from a postgres URI without using `URL` (password may contain `@`).
 */
function postgresHostPort(raw: string): { host: string; port: number } | null {
  const s = raw.trim();
  const scheme = s.match(/^postgres(?:ql)?:\/\//i);
  if (!scheme) return null;
  let rest = s.slice(scheme[0].length);
  const at = rest.lastIndexOf("@");
  if (at !== -1) {
    rest = rest.slice(at + 1);
  }
  const beforePath = rest.split("/")[0]?.split("?")[0] ?? "";
  const colon = beforePath.lastIndexOf(":");
  let hostPart: string;
  let port = 5432;
  if (colon > 0 && /^\d+$/.test(beforePath.slice(colon + 1))) {
    hostPart = beforePath.slice(0, colon);
    port = parseInt(beforePath.slice(colon + 1), 10);
  } else {
    hostPart = beforePath;
  }
  const host = hostPart.toLowerCase();
  return host ? { host, port } : null;
}

function postgresHostname(raw: string): string | null {
  const hp = postgresHostPort(raw);
  return hp?.host ?? null;
}

function exitIfWrongSupabaseHost(raw: string | undefined) {
  if (!raw?.trim()) return;
  const hostname = postgresHostname(raw);
  if (!hostname) return;

  if (!hostname.endsWith(".supabase.co")) return;
  if (hostname.startsWith("db.")) return;

  console.error(
    `\n[migrate] Wrong Supabase host in DATABASE_URL: "${hostname}"\n\n` +
      `That host is the API origin, not Postgres.\n\n` +
      `If your .env already shows db.<ref>.supabase.co, something else is overriding DATABASE_URL:\n` +
      `  • Run: env | grep DATABASE_URL\n` +
      `  • Check .env.local for a second DATABASE_URL\n\n` +
      `Use ORMs → Drizzle pooler (…pooler.supabase.com:6543) or Direct with host db.<ref>.supabase.co\n\n`,
  );
  process.exit(1);
}

/**
 * Direct db.*.supabase.co:5432 is often IPv6-only; IPv4 add-on is for that path only.
 * Pooler (*.pooler.supabase.com:6543) is a different route and usually works on IPv4 without the add-on.
 */
function exitIfSupabaseDirectUrl(raw: string | undefined) {
  if (process.env.SKL_ALLOW_SUPABASE_DIRECT === "1") return;
  const hp = raw?.trim() ? postgresHostPort(raw) : null;
  if (!hp) return;
  const { host, port } = hp;
  const isPooler =
    host.includes("pooler.supabase.com") || host.includes("pooler.supabase.co");
  if (isPooler) return;
  if (!host.endsWith(".supabase.co") || port !== 5432) return;

  console.error(
    `\n[migrate] DATABASE_URL points at Supabase Direct (${host}:${port}).\n\n` +
      `That endpoint often needs IPv6 or Supabase’s paid IPv4 add-on from home / IPv4-only networks.\n\n` +
      `You do NOT need the IPv4 add-on if you switch to the pooler (still Supabase, still Drizzle):\n` +
      `  Dashboard → Settings → Database → ORMs → Tool “Drizzle” → copy DATABASE_URL\n` +
      `  Checklist: host contains pooler.supabase.com, port 6543, user postgres.<your-project-ref>\n\n` +
      `Other options (same codebase, new DATABASE_URL):\n` +
      `  • Neon, Railway Postgres, Render, Fly.io Postgres — all work with Drizzle + Better Auth.\n\n` +
      `To retry Direct anyway (e.g. you have IPv6): SKL_ALLOW_SUPABASE_DIRECT=1 pnpm db:migrate\n\n`,
  );
  process.exit(1);
}

exitIfWrongSupabaseHost(process.env.DATABASE_URL);
exitIfSupabaseDirectUrl(process.env.DATABASE_URL);

async function main() {
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const { db } = await import("../db");

  if (!db) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
}

main().catch((error) => {
  const cause = error && typeof error === "object" && "cause" in error ? (error as { cause?: unknown }).cause : undefined;
  const c = cause && typeof cause === "object" ? (cause as { code?: string; message?: string }) : undefined;
  const timedOut =
    c?.code === "CONNECT_TIMEOUT" ||
    (typeof c?.message === "string" && c.message.includes("CONNECT_TIMEOUT"));

  if (timedOut) {
    console.error(`
[migrate] Connection timed out.

If DATABASE_URL still uses …supabase.co:5432, use the pooler URI instead (no IPv4 add-on for that path):
  Database → ORMs → Drizzle → DATABASE_URL  (…pooler.supabase.com:6543)

Or use another Postgres provider (Neon, Railway, …) and paste their URI as DATABASE_URL.
`);
  }

  console.error(error);
  process.exit(1);
});
