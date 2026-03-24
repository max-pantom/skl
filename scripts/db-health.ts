import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

/**
 * Read-only checks: counts, integrity, and whether the same queries the app uses return rows.
 * Run: pnpm db:health
 */
async function main() {
  const { db, isDatabaseConfigured } = await import("../db");
  const { communityPosts, communityVotes, skills, skillVersions, users } = await import("../db/schema");
  const { count, eq, isNull, sql } = await import("drizzle-orm");

  if (!db || !isDatabaseConfigured) {
    console.error("DATABASE_URL is not set (or db client failed to init).");
    process.exit(1);
  }

  try {
    const [skillsTotal] = await db.select({ n: count() }).from(skills);
    const [usersTotal] = await db.select({ n: count() }).from(users);
    const [versionsTotal] = await db.select({ n: count() }).from(skillVersions);
    const [communityPostsTotal] = await db.select({ n: count() }).from(communityPosts);
    const [communityVotesTotal] = await db.select({ n: count() }).from(communityVotes);
    const [nullCurrent] = await db
      .select({ n: count() })
      .from(skills)
      .where(isNull(skills.currentVersionId));

    const orphanRows = await db.execute(sql`
      select count(*)::int as n from skills s
      where s.current_version_id is not null
        and not exists (select 1 from skill_versions v where v.id = s.current_version_id)
    `);
    const orphanN = Number((orphanRows as unknown as { n: string | number }[])[0]?.n ?? 0);

    console.log("--- SKL DB health ---");
    console.log("users:", usersTotal.n);
    console.log("skills (rows):", skillsTotal.n);
    console.log("skill_versions (rows):", versionsTotal.n);
    console.log("community_posts (rows):", communityPostsTotal.n);
    console.log("community_votes (rows):", communityVotesTotal.n);
    console.log("skills.current_version_id IS NULL:", nullCurrent.n);
    console.log("skills with broken current_version_id (no version row):", orphanN);

    const [joinOk] = await db
      .select({ n: count() })
      .from(skills)
      .innerJoin(users, eq(skills.authorId, users.id))
      .innerJoin(skillVersions, eq(skills.currentVersionId, skillVersions.id));

    console.log("skills joinable (author + current_version row, app can list):", joinOk.n);

    const [topLevelCommunityPosts] = await db
      .select({ n: count() })
      .from(communityPosts)
      .where(isNull(communityPosts.parentPostId));

    console.log("top-level community posts:", topLevelCommunityPosts.n);

    if (skillsTotal.n > 0 && joinOk.n === 0) {
      console.log(
        "\nHint: Skills exist but none join author + currentVersion — the UI will look empty.",
      );
      console.log("Fix: ensure skills.author_id → users and skills.current_version_id → skill_versions.");
    }

    if (skillsTotal.n > joinOk.n) {
      console.log(
        `Note: ${skillsTotal.n - joinOk.n} skill row(s) fail the author/version join (orphan author_id or version).`,
      );
    }
  } catch (e) {
    console.error("Health check query failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
