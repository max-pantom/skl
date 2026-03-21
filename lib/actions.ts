"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db, isDatabaseConfigured } from "@/db";
import { forks, skillVersions, skills, stars, users } from "@/db/schema";
import { isAppConfigured, requireCurrentViewer } from "@/lib/auth";
import { launchCategories, type SkillCategory } from "@/lib/types";
import {
  getString,
  parseCommaSeparatedList,
  sanitizeUsername,
  slugify,
  withQuery,
} from "@/lib/utils";

function redirectWithError(path: string, message: string): never {
  redirect(withQuery(path, { error: message }));
}

function redirectWithMessage(path: string, message: string): never {
  redirect(withQuery(path, { message }));
}

function ensureConfigured(path: string) {
  if (!isAppConfigured() || !db || !isDatabaseConfigured) {
    redirectWithError(path, "Better Auth and the database must be configured first.");
  }
}

function isCategory(value: string): value is SkillCategory {
  return launchCategories.includes(value as SkillCategory);
}

async function getUniqueSkillSlug(baseSlug: string, excludeSkillId?: string) {
  if (!db) {
    return baseSlug;
  }

  let candidate = baseSlug || "skill";
  let suffix = 1;

  while (true) {
    const existingSkill = await db.query.skills.findFirst({
      where: eq(skills.slug, candidate),
    });

    if (!existingSkill || existingSkill.id === excludeSkillId) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug || "skill"}-${suffix}`;
  }
}

async function getUniqueUsername(baseUsername: string, excludeUserId?: string) {
  if (!db) {
    return baseUsername;
  }

  let candidate = sanitizeUsername(baseUsername);
  let suffix = 1;

  while (true) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, candidate),
    });

    if (!existingUser || existingUser.id === excludeUserId) {
      return candidate;
    }

    suffix += 1;
    candidate = sanitizeUsername(`${baseUsername}-${suffix}`);
  }
}

function readSkillFields(formData: FormData) {
  const title = getString(formData.get("title"));
  const explicitSlug = getString(formData.get("slug"));
  const summary = getString(formData.get("summary"));
  const category = getString(formData.get("category"));
  const visibility = getString(formData.get("visibility")) || "public";
  const version = getString(formData.get("version"));
  const changelog = getString(formData.get("changelog"));
  const content = getString(formData.get("content"));
  const tags = parseCommaSeparatedList(formData.get("tags"));
  const compatibleWith = parseCommaSeparatedList(formData.get("compatibleWith"));

  return {
    title,
    slug: slugify(explicitSlug || title) || "skill",
    summary,
    category,
    visibility,
    version,
    changelog,
    content,
    tags,
    compatibleWith,
  };
}

function revalidateSkillSurfaces(skillSlug: string, username: string) {
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/s/${skillSlug}`);
  revalidatePath(`/u/${username}`);
}

export async function updateSettingsAction(formData: FormData) {
  ensureConfigured("/settings");

  const viewer = await requireCurrentViewer("/settings");
  const username = sanitizeUsername(getString(formData.get("username")));
  const displayName = getString(formData.get("displayName"));
  const bio = getString(formData.get("bio")) || null;
  const website = getString(formData.get("website")) || null;
  const xUrl = getString(formData.get("xUrl")) || null;

  if (!username || !displayName) {
    redirectWithError("/settings", "Username and display name are required.");
  }

  const uniqueUsername = await getUniqueUsername(username, viewer.id);

  if (uniqueUsername !== username) {
    redirectWithError("/settings", "That username is already taken.");
  }

  await db!
    .update(users)
    .set({
      username,
      displayName,
      bio,
      website,
      xUrl,
      avatarUrl:
        viewer.avatarUrl ??
        displayName
          .split(" ")
          .map((entry) => entry[0]?.toUpperCase() ?? "")
          .join("")
          .slice(0, 2),
      updatedAt: new Date(),
    })
    .where(eq(users.id, viewer.id));

  revalidatePath("/settings");
  revalidatePath(`/u/${viewer.username}`);
  revalidatePath(`/u/${username}`);
  revalidatePath("/");
  redirectWithMessage("/settings", "Profile updated.");
}

export async function createSkillAction(formData: FormData) {
  ensureConfigured("/new");

  const viewer = await requireCurrentViewer("/new");
  const fields = readSkillFields(formData);

  if (!fields.title || !fields.summary || !fields.version || !fields.content) {
    redirectWithError("/new", "Title, summary, version, and content are required.");
  }

  if (!isCategory(fields.category)) {
    redirectWithError("/new", "Choose a valid category.");
  }

  const category: SkillCategory = fields.category;
  const slug = await getUniqueSkillSlug(fields.slug);

  const createdSkill = await db!.transaction(async (tx) => {
    const [skill] = await tx
      .insert(skills)
      .values({
        authorId: viewer.id,
        title: fields.title,
        slug,
        summary: fields.summary,
        category,
        tags: fields.tags,
        visibility: fields.visibility === "unlisted" ? "unlisted" : "public",
      })
      .returning();

    const [version] = await tx
      .insert(skillVersions)
      .values({
        skillId: skill.id,
        version: fields.version,
        content: fields.content,
        changelog: fields.changelog || "Initial release.",
        compatibleWith: fields.compatibleWith,
        inputSchema: {},
        metadata: {},
      })
      .returning();

    await tx
      .update(skills)
      .set({
        currentVersionId: version.id,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skill.id));

    return skill;
  });

  revalidateSkillSurfaces(createdSkill.slug, viewer.username);
  redirect(`/s/${createdSkill.slug}`);
}

export async function updateSkillAction(formData: FormData) {
  const currentSlug = getString(formData.get("currentSlug"));
  ensureConfigured(`/s/${currentSlug}/edit`);

  const viewer = await requireCurrentViewer(`/s/${currentSlug}/edit`);
  const skillId = getString(formData.get("skillId"));
  const fields = readSkillFields(formData);

  if (!skillId || !fields.title || !fields.summary || !fields.version || !fields.content) {
    redirectWithError(`/s/${currentSlug}/edit`, "All primary fields are required.");
  }

  if (!isCategory(fields.category)) {
    redirectWithError(`/s/${currentSlug}/edit`, "Choose a valid category.");
  }

  const category: SkillCategory = fields.category;
  const existingSkill = await db!.query.skills.findFirst({
    where: eq(skills.id, skillId),
  });

  if (!existingSkill || existingSkill.authorId !== viewer.id) {
    redirectWithError(`/s/${currentSlug}/edit`, "You can only edit your own skills.");
  }

  const duplicateVersion = await db!.query.skillVersions.findFirst({
    where: and(eq(skillVersions.skillId, skillId), eq(skillVersions.version, fields.version)),
  });

  if (duplicateVersion) {
    redirectWithError(`/s/${currentSlug}/edit`, "That version already exists for this skill.");
  }

  const slug = await getUniqueSkillSlug(fields.slug, skillId);

  const updatedSkill = await db!.transaction(async (tx) => {
    const [version] = await tx
      .insert(skillVersions)
      .values({
        skillId,
        version: fields.version,
        content: fields.content,
        changelog: fields.changelog || "Updated skill content.",
        compatibleWith: fields.compatibleWith,
        inputSchema: {},
        metadata: {},
      })
      .returning();

    const [skill] = await tx
      .update(skills)
      .set({
        title: fields.title,
        slug,
        summary: fields.summary,
        category,
        tags: fields.tags,
        visibility: fields.visibility === "unlisted" ? "unlisted" : "public",
        currentVersionId: version.id,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skillId))
      .returning();

    return skill;
  });

  revalidateSkillSurfaces(currentSlug, viewer.username);
  revalidateSkillSurfaces(updatedSkill.slug, viewer.username);
  redirect(`/s/${updatedSkill.slug}`);
}

export async function toggleStarAction(formData: FormData) {
  const skillId = getString(formData.get("skillId"));
  const skillSlug = getString(formData.get("skillSlug"));
  const redirectTo = getString(formData.get("redirectTo")) || `/s/${skillSlug}`;

  ensureConfigured(redirectTo);

  if (!skillId || !skillSlug) {
    redirectWithError(redirectTo, "Skill information is missing.");
  }

  const viewer = await requireCurrentViewer(redirectTo);

  const existingStar = await db!.query.stars.findFirst({
    where: and(eq(stars.skillId, skillId), eq(stars.userId, viewer.id)),
  });

  if (existingStar) {
    await db!.transaction(async (tx) => {
      await tx.delete(stars).where(eq(stars.id, existingStar.id));
      await tx
        .update(skills)
        .set({
          starsCount: sql`GREATEST(${skills.starsCount} - 1, 0)`,
        })
        .where(eq(skills.id, skillId));
    });
  } else {
    await db!.transaction(async (tx) => {
      await tx.insert(stars).values({
        userId: viewer.id,
        skillId,
      });
      await tx
        .update(skills)
        .set({
          starsCount: sql`${skills.starsCount} + 1`,
        })
        .where(eq(skills.id, skillId));
    });
  }

  revalidatePath(redirectTo);
  revalidatePath("/explore");
  revalidatePath("/");
  redirect(redirectTo);
}

export async function forkSkillAction(formData: FormData) {
  const parentSkillId = getString(formData.get("parentSkillId"));
  const parentSlug = getString(formData.get("parentSlug"));
  const redirectTo = getString(formData.get("redirectTo")) || `/s/${parentSlug}`;

  ensureConfigured(redirectTo);

  if (!parentSkillId || !parentSlug) {
    redirectWithError(redirectTo, "Skill information is missing.");
  }

  const viewer = await requireCurrentViewer(redirectTo);

  const sourceSkill = await db!.query.skills.findFirst({
    where: eq(skills.id, parentSkillId),
    with: {
      currentVersion: true,
    },
  });

  if (!sourceSkill || !sourceSkill.currentVersion) {
    redirectWithError(redirectTo, "The source skill could not be loaded.");
  }

  const parentSkill = sourceSkill;
  const parentVersion = sourceSkill.currentVersion;
  const childSlug = await getUniqueSkillSlug(`${parentSkill.slug}-${viewer.username}`);

  const childSkill = await db!.transaction(async (tx) => {
    const [skill] = await tx
      .insert(skills)
      .values({
        authorId: viewer.id,
        title: `${parentSkill.title} Fork`,
        slug: childSlug,
        summary: parentSkill.summary,
        category: parentSkill.category,
        tags: parentSkill.tags,
        visibility: "public",
      })
      .returning();

    const [version] = await tx
      .insert(skillVersions)
      .values({
        skillId: skill.id,
        version: parentVersion.version,
        content: parentVersion.content,
        changelog: `Forked from ${parentSkill.slug}.`,
        compatibleWith: parentVersion.compatibleWith,
        inputSchema: parentVersion.inputSchema,
        metadata: parentVersion.metadata,
      })
      .returning();

    await tx
      .update(skills)
      .set({
        currentVersionId: version.id,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skill.id));

    await tx.insert(forks).values({
      parentSkillId: parentSkill.id,
      childSkillId: skill.id,
      userId: viewer.id,
    });

    await tx
      .update(skills)
      .set({
        forksCount: sql`${skills.forksCount} + 1`,
      })
      .where(eq(skills.id, parentSkill.id));

    return skill;
  });

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/s/${parentSlug}`);
  revalidateSkillSurfaces(childSkill.slug, viewer.username);
  redirect(`/s/${childSkill.slug}/edit?message=${encodeURIComponent("Fork created. Edit and publish the next version.")}`);
}
