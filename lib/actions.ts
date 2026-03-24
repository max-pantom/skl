"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db, isDatabaseConfigured } from "@/db";
import { communityPosts, communityVotes, forks, skillVersionFiles, skillVersions, skills, stars, users } from "@/db/schema";
import { isAppConfigured, requireCurrentViewer } from "@/lib/auth";
import { bootstrapUserEmailLifecycle, syncUserToResendAudience } from "@/lib/email/user-lifecycle";
import {
  PRIMARY_SKILL_FILE,
  getPrimarySkillFile,
  isValidSkillFilePath,
  normalizeSkillFilePath,
} from "@/lib/skill-files";
import { launchCategories, type CommunityPostKind, type SkillCategory } from "@/lib/types";
import {
  bumpMajorSemver,
  compareSemver,
  getString,
  hasValidDisplayNameStart,
  isValidSemver,
  parseCommaSeparatedList,
  sanitizeUsername,
  startsWithLetterOrNumber,
  slugify,
  withQuery,
} from "@/lib/utils";

type SubmittedSkillFile = {
  path: string;
  content: string;
};

function redirectWithError(path: string, message: string): never {
  redirect(withQuery(path, { error: message }));
}

function ensureConfigured(path: string) {
  if (!isAppConfigured() || !db || !isDatabaseConfigured) {
    redirectWithError(path, "This action is not available right now.");
  }
}

function isCategory(value: string): value is SkillCategory {
  return launchCategories.includes(value as SkillCategory);
}

function isCommunityPostKind(value: string): value is CommunityPostKind {
  return value === "feature" || value === "report" || value === "feedback";
}

function normalizeSubmittedFiles(files: SubmittedSkillFile[]) {
  return files.map((file, index) => ({
    path: normalizeSkillFilePath(file.path),
    content: typeof file.content === "string" ? file.content : "",
    sortOrder: index,
  }));
}

function readSubmittedFiles(formData: FormData) {
  const rawFiles = getString(formData.get("files"));
  const legacyContent = getString(formData.get("content"));
  let parsedFiles: SubmittedSkillFile[] = [];

  if (rawFiles) {
    try {
      const value = JSON.parse(rawFiles);

      if (!Array.isArray(value)) {
        throw new Error("Publish the skill again. The file payload is invalid.");
      }

      parsedFiles = value.map((file) => ({
        path: typeof file?.path === "string" ? file.path : "",
        content: typeof file?.content === "string" ? file.content : "",
      }));
    } catch {
      throw new Error("Publish the skill again. The file payload is invalid.");
    }
  } else if (legacyContent) {
    parsedFiles = [{ path: PRIMARY_SKILL_FILE, content: legacyContent }];
  }

  const files = normalizeSubmittedFiles(parsedFiles);

  if (!files.length) {
    throw new Error("Add at least one file before publishing.");
  }

  const seenPaths = new Set<string>();

  for (const file of files) {
    if (!file.path) {
      throw new Error("Every file needs a path.");
    }

    if (!isValidSkillFilePath(file.path)) {
      throw new Error(`"${file.path}" is not a valid relative file path.`);
    }

    if (seenPaths.has(file.path)) {
      throw new Error(`"${file.path}" is listed more than once.`);
    }

    seenPaths.add(file.path);
  }

  const primaryFile = getPrimarySkillFile(files);

  if (!primaryFile || primaryFile.path !== PRIMARY_SKILL_FILE) {
    throw new Error("SKILL.md is required for every version.");
  }

  return {
    files,
    content: primaryFile.content,
  };
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

function readSkillFields(formData: FormData) {
  const { files, content } = readSubmittedFiles(formData);
  const title = getString(formData.get("title"));
  const explicitSlug = getString(formData.get("slug"));
  const summary = getString(formData.get("summary"));
  const category = getString(formData.get("category"));
  const visibility = getString(formData.get("visibility")) || "public";
  const version = getString(formData.get("version"));
  const changelog = getString(formData.get("changelog"));
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
    files,
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

function resolveNextSkillVersion(currentVersion: string, submittedVersion: string) {
  const manualVersion = submittedVersion.trim();

  if (!manualVersion) {
    return bumpMajorSemver(currentVersion);
  }

  if (!isValidSemver(manualVersion)) {
    throw new Error("Versions must use semantic versioning like 1.0.0.");
  }

  if (compareSemver(manualVersion, currentVersion) <= 0) {
    throw new Error(`New versions must be greater than the current version (${currentVersion}).`);
  }

  return manualVersion;
}

export async function updateProfileAction(formData: FormData) {
  ensureConfigured("/settings");
  const viewer = await requireCurrentViewer("/settings");

  const displayName = getString(formData.get("displayName"));
  const bio = getString(formData.get("bio"));
  const website = getString(formData.get("website"));
  const xUrl = getString(formData.get("xUrl"));

  if (!displayName) {
    redirectWithError("/settings", "Display name is required.");
  }

  if (!hasValidDisplayNameStart(displayName)) {
    redirectWithError("/settings", "Display name must start with a letter or number.");
  }

  await db!
    .update(users)
    .set({
      displayName,
      bio: bio || null,
      website: website || null,
      xUrl: xUrl || null,
      avatarUrl: viewer.avatarUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, viewer.id));

  await syncUserToResendAudience(viewer.id, { force: true });

  revalidatePath(`/u/${viewer.username}`);
  revalidatePath("/settings");
  redirect(withQuery("/settings", { ok: "1" }));
}

export async function completeProfileSetupAction(formData: FormData) {
  ensureConfigured("/welcome");
  const viewer = await requireCurrentViewer("/welcome");
  const nextPath = getString(formData.get("next")) || "/explore";
  const username = sanitizeUsername(getString(formData.get("username")));
  const displayName = getString(formData.get("displayName"));

  if (username.length < 3) {
    redirectWithError(withQuery("/welcome", { next: nextPath }), "Username must be at least 3 characters.");
  }

  if (!startsWithLetterOrNumber(getString(formData.get("username")))) {
    redirectWithError(withQuery("/welcome", { next: nextPath }), "Username must start with a letter or number.");
  }

  if (displayName.length < 3) {
    redirectWithError(withQuery("/welcome", { next: nextPath }), "Display name must be at least 3 characters.");
  }

  if (!hasValidDisplayNameStart(displayName)) {
    redirectWithError(withQuery("/welcome", { next: nextPath }), "Display name must start with a letter or number.");
  }

  const existingUser = await db!.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (existingUser && existingUser.id !== viewer.id) {
    redirectWithError(withQuery("/welcome", { next: nextPath }), "That username is already taken.");
  }

  const previousUsername = viewer.username;

  await db!
    .update(users)
    .set({
      username,
      displayName,
      needsProfileSetup: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, viewer.id));

  await bootstrapUserEmailLifecycle(viewer.id);

  revalidatePath("/welcome");
  revalidatePath(`/u/${previousUsername}`);
  revalidatePath(`/u/${username}`);
  revalidatePath("/settings");
  redirect(nextPath);
}

export async function createSkillAction(formData: FormData) {
  ensureConfigured("/new");

  const viewer = await requireCurrentViewer("/new");
  let fields: ReturnType<typeof readSkillFields>;

  try {
    fields = readSkillFields(formData);
  } catch (error) {
    redirectWithError("/new", error instanceof Error ? error.message : "The skill files could not be read.");
  }

  if (!fields.title || !fields.summary || !fields.version || !fields.content) {
    redirectWithError("/new", "Title, summary, version, and content are required.");
  }

  if (fields.compatibleWith.length === 0) {
    redirectWithError("/new", "Add at least one compatible model.");
  }

  if (!isValidSemver(fields.version)) {
    redirectWithError("/new", "Versions must use semantic versioning like 1.0.0.");
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

    await tx.insert(skillVersionFiles).values(
      fields.files.map((file) => ({
        skillVersionId: version.id,
        path: file.path,
        content: file.content,
        sortOrder: file.sortOrder,
      })),
    );

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
  const editPath = `/s/${currentSlug}/edit`;
  ensureConfigured(editPath);

  const viewer = await requireCurrentViewer(editPath);
  const skillId = getString(formData.get("skillId"));
  let fields: ReturnType<typeof readSkillFields>;

  try {
    fields = readSkillFields(formData);
  } catch (error) {
    redirectWithError(
      editPath,
      error instanceof Error ? error.message : "The skill files could not be read.",
    );
  }

  if (!skillId || !fields.title || !fields.summary || !fields.content) {
    redirectWithError(editPath, "All primary fields are required.");
  }

  if (fields.compatibleWith.length === 0) {
    redirectWithError(editPath, "Add at least one compatible model.");
  }

  if (!isCategory(fields.category)) {
    redirectWithError(editPath, "Choose a valid category.");
  }

  const category: SkillCategory = fields.category;
  const existingSkill = await db!.query.skills.findFirst({
    where: eq(skills.id, skillId),
  });

  if (!existingSkill || existingSkill.authorId !== viewer.id) {
    redirectWithError(editPath, "You can only edit your own skills.");
  }

  if (!existingSkill.currentVersionId) {
    redirectWithError(editPath, "The current skill version could not be loaded.");
  }

  const currentVersionRecord = await db!.query.skillVersions.findFirst({
    where: eq(skillVersions.id, existingSkill.currentVersionId),
  });

  if (!currentVersionRecord) {
    redirectWithError(editPath, "The current skill version could not be loaded.");
  }

  let nextVersion = "";
  try {
    nextVersion = resolveNextSkillVersion(currentVersionRecord.version, fields.version);
  } catch (error) {
    redirectWithError(
      editPath,
      error instanceof Error ? error.message : "The new version is invalid.",
    );
  }

  const duplicateVersion = await db!.query.skillVersions.findFirst({
    where: and(eq(skillVersions.skillId, skillId), eq(skillVersions.version, nextVersion)),
  });

  if (duplicateVersion) {
    redirectWithError(editPath, "That version already exists for this skill.");
  }

  const slug = await getUniqueSkillSlug(fields.slug, skillId);

  const updatedSkill = await db!.transaction(async (tx) => {
    const [version] = await tx
      .insert(skillVersions)
      .values({
        skillId,
        version: nextVersion,
        content: fields.content,
        changelog: fields.changelog || "Updated skill content.",
        compatibleWith: fields.compatibleWith,
        inputSchema: {},
        metadata: {},
      })
      .returning();

    await tx.insert(skillVersionFiles).values(
      fields.files.map((file) => ({
        skillVersionId: version.id,
        path: file.path,
        content: file.content,
        sortOrder: file.sortOrder,
      })),
    );

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
  redirect(withQuery(`/s/${updatedSkill.slug}`, { message: `Published new version v${nextVersion}.` }));
}

export async function createCommunityPostAction(formData: FormData) {
  const redirectTo = "/community";
  ensureConfigured(redirectTo);
  const viewer = await requireCurrentViewer(redirectTo);
  const kind = getString(formData.get("kind"));
  const title = getString(formData.get("title"));
  const body = getString(formData.get("body"));

  if (!isCommunityPostKind(kind)) {
    redirectWithError(redirectTo, "Choose feature, report, or feedback.");
  }

  if (title.length < 4) {
    redirectWithError(redirectTo, "Post title must be at least 4 characters.");
  }

  if (body.length < 12) {
    redirectWithError(redirectTo, "Add a bit more detail so others can understand the request.");
  }

  await db!.insert(communityPosts).values({
    authorId: viewer.id,
    kind,
    title,
    body,
  });

  revalidatePath("/community");
  redirect(withQuery("/community", { message: "Posted to the community feed." }));
}

export async function replyCommunityPostAction(formData: FormData) {
  const redirectTo = "/community";
  ensureConfigured(redirectTo);
  const viewer = await requireCurrentViewer(redirectTo);
  const parentPostId = getString(formData.get("parentPostId"));
  const body = getString(formData.get("body"));

  if (!parentPostId) {
    redirectWithError(redirectTo, "Reply target is missing.");
  }

  if (body.length < 4) {
    redirectWithError(redirectTo, "Reply must be at least 4 characters.");
  }

  const parentPost = await db!.query.communityPosts.findFirst({
    where: eq(communityPosts.id, parentPostId),
  });

  if (!parentPost || parentPost.parentPostId) {
    redirectWithError(redirectTo, "That post can’t be replied to.");
  }

  await db!.insert(communityPosts).values({
    authorId: viewer.id,
    parentPostId,
    kind: parentPost.kind,
    body,
    updatedAt: new Date(),
  });

  await db!
    .update(communityPosts)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(communityPosts.id, parentPostId));

  revalidatePath("/community");
  redirect("/community");
}

export async function toggleCommunityVoteAction(formData: FormData) {
  const redirectTo = "/community";
  ensureConfigured(redirectTo);
  const viewer = await requireCurrentViewer(redirectTo);
  const postId = getString(formData.get("postId"));

  if (!postId) {
    redirectWithError(redirectTo, "Post information is missing.");
  }

  const post = await db!.query.communityPosts.findFirst({
    where: eq(communityPosts.id, postId),
  });

  if (!post) {
    redirectWithError(redirectTo, "Post not found.");
  }

  const existingVote = await db!.query.communityVotes.findFirst({
    where: and(eq(communityVotes.postId, postId), eq(communityVotes.userId, viewer.id)),
  });

  if (existingVote) {
    await db!.transaction(async (tx) => {
      await tx.delete(communityVotes).where(eq(communityVotes.id, existingVote.id));
      await tx
        .update(communityPosts)
        .set({
          upvotesCount: sql`GREATEST(${communityPosts.upvotesCount} - 1, 0)`,
        })
        .where(eq(communityPosts.id, postId));
    });
  } else {
    await db!.transaction(async (tx) => {
      await tx.insert(communityVotes).values({
        postId,
        userId: viewer.id,
      });
      await tx
        .update(communityPosts)
        .set({
          upvotesCount: sql`${communityPosts.upvotesCount} + 1`,
        })
        .where(eq(communityPosts.id, postId));
    });
  }

  revalidatePath("/community");
  redirect("/community");
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
      currentVersion: {
        with: {
          files: true,
        },
      },
    },
  });

  if (!sourceSkill || !sourceSkill.currentVersion) {
    redirectWithError(redirectTo, "The source skill could not be loaded.");
  }

  const parentSkill = sourceSkill;
  const parentVersion = sourceSkill.currentVersion;
  const parentFiles =
    parentVersion.files.length > 0
      ? parentVersion.files
      : [{ path: PRIMARY_SKILL_FILE, content: parentVersion.content, sortOrder: 0 }];
  const childSlug = await getUniqueSkillSlug(`${parentSkill.slug}-${sanitizeUsername(viewer.username)}`);

  const childSkill = await db!.transaction(async (tx) => {
    const [skill] = await tx
      .insert(skills)
      .values({
        authorId: viewer.id,
        title: `${parentSkill.title} (fork)`,
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

    await tx.insert(skillVersionFiles).values(
      parentFiles.map((file, index) => ({
        skillVersionId: version.id,
        path: file.path,
        content: file.content,
        sortOrder: file.sortOrder ?? index,
      })),
    );

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
  redirect(`/s/${childSkill.slug}`);
}
