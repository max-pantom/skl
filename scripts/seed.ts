import "dotenv/config";

import { eq } from "drizzle-orm";

import { db } from "../db";
import { downloads, forks, skillVersions, skills, stars, users } from "../db/schema";
import {
  sampleDownloads,
  sampleForks,
  sampleSkills,
  sampleSkillVersions,
  sampleStars,
  sampleUsers,
} from "../lib/seed-content";

async function main() {
  if (!db) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  await db.transaction(async (tx) => {
    await tx.delete(forks);
    await tx.delete(downloads);
    await tx.delete(stars);
    await tx.delete(skills);
    await tx.delete(users);

    await tx.insert(users).values(
      sampleUsers.map((user) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      })),
    );

    await tx.insert(skills).values(
      sampleSkills.map(({ currentVersionId: _currentVersionId, ...skill }) => ({
        ...skill,
        currentVersionId: null,
        createdAt: new Date(skill.createdAt),
        updatedAt: new Date(skill.updatedAt),
      })),
    );

    await tx.insert(skillVersions).values(
      sampleSkillVersions.map((version) => ({
        ...version,
        createdAt: new Date(version.createdAt),
      })),
    );

    for (const skill of sampleSkills) {
      await tx
        .update(skills)
        .set({
          currentVersionId: skill.currentVersionId,
          updatedAt: new Date(skill.updatedAt),
        })
        .where(eq(skills.id, skill.id));
    }

    await tx.insert(stars).values(
      sampleStars.map((star) => ({
        ...star,
        createdAt: new Date(star.createdAt),
      })),
    );

    await tx.insert(downloads).values(
      sampleDownloads.map((download) => ({
        ...download,
        createdAt: new Date(download.createdAt),
      })),
    );

    await tx.insert(forks).values(
      sampleForks.map((fork) => ({
        ...fork,
        createdAt: new Date(fork.createdAt),
      })),
    );
  });

  console.log(
    `Seeded ${sampleUsers.length} users, ${sampleSkills.length} skills, and ${sampleSkillVersions.length} versions.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
