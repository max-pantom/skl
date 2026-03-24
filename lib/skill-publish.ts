import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { skillVersionFiles, skillVersions, skills } from "@/db/schema";
import {
  PRIMARY_SKILL_FILE,
  getPrimarySkillFile,
  isValidSkillFilePath,
  normalizeSkillFilePath,
} from "@/lib/skill-files";
import { launchCategories, type SkillCategory } from "@/lib/types";
import { bumpMajorSemver, compareSemver, isValidSemver, parseCommaSeparatedList, slugify } from "@/lib/utils";

export type SubmittedSkillFile = {
  path: string;
  content: string;
};

export type SkillSubmissionInput = {
  title: string;
  slug?: string;
  summary: string;
  category: string;
  visibility?: string;
  version?: string;
  changelog?: string;
  tags?: string[] | string | null;
  compatibleWith?: string[] | string | null;
  files: SubmittedSkillFile[];
};

export type NormalizedSkillSubmission = {
  title: string;
  slug: string;
  summary: string;
  category: SkillCategory;
  visibility: "public" | "unlisted";
  version: string;
  changelog: string;
  tags: string[];
  compatibleWith: string[];
  content: string;
  files: Array<{
    path: string;
    content: string;
    sortOrder: number;
  }>;
};

export function isCategory(value: string): value is SkillCategory {
  return launchCategories.includes(value as SkillCategory);
}

function normalizeFiles(files: SubmittedSkillFile[]) {
  return files.map((file, index) => ({
    path: normalizeSkillFilePath(file.path),
    content: typeof file.content === "string" ? file.content : "",
    sortOrder: index,
  }));
}

export function normalizeSkillSubmission(input: SkillSubmissionInput): NormalizedSkillSubmission {
  const files = normalizeFiles(input.files ?? []);

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

  if (!isCategory(input.category)) {
    throw new Error("Choose a valid category.");
  }

  const title = input.title.trim();
  const summary = input.summary.trim();
  const version = (input.version ?? "").trim();
  const tags = Array.isArray(input.tags) ? input.tags : parseCommaSeparatedList(input.tags);
  const compatibleWith = Array.isArray(input.compatibleWith)
    ? input.compatibleWith.map((entry) => entry.trim()).filter(Boolean)
    : parseCommaSeparatedList(input.compatibleWith);

  return {
    title,
    slug: slugify((input.slug ?? "").trim() || title) || "skill",
    summary,
    category: input.category,
    visibility: input.visibility === "unlisted" ? "unlisted" : "public",
    version,
    changelog: (input.changelog ?? "").trim(),
    tags,
    compatibleWith,
    content: primaryFile.content,
    files,
  };
}

export function validateCreateSkillSubmission(input: NormalizedSkillSubmission) {
  if (!input.title || !input.summary || !input.version || !input.content) {
    throw new Error("Title, summary, version, and content are required.");
  }

  if (input.compatibleWith.length === 0) {
    throw new Error("Add at least one compatible model.");
  }

  if (!isValidSemver(input.version)) {
    throw new Error("Versions must use semantic versioning like 1.0.0.");
  }
}

export function resolveNextSkillVersion(currentVersion: string, submittedVersion: string) {
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

export async function getUniqueSkillSlug(baseSlug: string, excludeSkillId?: string) {
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

export async function createSkillFromSubmission(userId: string, input: NormalizedSkillSubmission) {
  if (!db) {
    throw new Error("Publishing is not available right now.");
  }

  validateCreateSkillSubmission(input);
  const slug = await getUniqueSkillSlug(input.slug);

  return db.transaction(async (tx) => {
    const [skill] = await tx
      .insert(skills)
      .values({
        authorId: userId,
        title: input.title,
        slug,
        summary: input.summary,
        category: input.category,
        tags: input.tags,
        visibility: input.visibility,
      })
      .returning();

    const [version] = await tx
      .insert(skillVersions)
      .values({
        skillId: skill.id,
        version: input.version,
        content: input.content,
        changelog: input.changelog || "Initial release.",
        compatibleWith: input.compatibleWith,
        inputSchema: {},
        metadata: {},
      })
      .returning();

    await tx.insert(skillVersionFiles).values(
      input.files.map((file) => ({
        skillVersionId: version.id,
        path: file.path,
        content: file.content,
        sortOrder: file.sortOrder,
      })),
    );

    const [updatedSkill] = await tx
      .update(skills)
      .set({
        currentVersionId: version.id,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skill.id))
      .returning();

    return {
      skill: updatedSkill,
      version,
    };
  });
}

export async function previewUpdateSkillSubmission(skillId: string, userId: string, input: NormalizedSkillSubmission) {
  if (!db) {
    throw new Error("Publishing is not available right now.");
  }

  if (!input.title || !input.summary || !input.content) {
    throw new Error("All primary fields are required.");
  }

  if (input.compatibleWith.length === 0) {
    throw new Error("Add at least one compatible model.");
  }

  const existingSkill = await db.query.skills.findFirst({
    where: eq(skills.id, skillId),
  });

  if (!existingSkill || existingSkill.authorId !== userId) {
    throw new Error("You can only edit your own skills.");
  }

  if (!existingSkill.currentVersionId) {
    throw new Error("The current skill version could not be loaded.");
  }

  const currentVersionRecord = await db.query.skillVersions.findFirst({
    where: eq(skillVersions.id, existingSkill.currentVersionId),
  });

  if (!currentVersionRecord) {
    throw new Error("The current skill version could not be loaded.");
  }

  const nextVersion = resolveNextSkillVersion(currentVersionRecord.version, input.version);
  const duplicateVersion = await db.query.skillVersions.findFirst({
    where: and(eq(skillVersions.skillId, skillId), eq(skillVersions.version, nextVersion)),
  });

  if (duplicateVersion) {
    throw new Error("That version already exists for this skill.");
  }

  const slug = await getUniqueSkillSlug(input.slug, skillId);

  return {
    existingSkill,
    currentVersionRecord,
    nextVersion,
    slug,
  };
}

export async function updateSkillFromSubmission(skillId: string, userId: string, input: NormalizedSkillSubmission) {
  if (!db) {
    throw new Error("Publishing is not available right now.");
  }

  const preview = await previewUpdateSkillSubmission(skillId, userId, input);

  return db.transaction(async (tx) => {
    const [version] = await tx
      .insert(skillVersions)
      .values({
        skillId,
        version: preview.nextVersion,
        content: input.content,
        changelog: input.changelog || "Updated skill content.",
        compatibleWith: input.compatibleWith,
        inputSchema: {},
        metadata: {},
      })
      .returning();

    await tx.insert(skillVersionFiles).values(
      input.files.map((file) => ({
        skillVersionId: version.id,
        path: file.path,
        content: file.content,
        sortOrder: file.sortOrder,
      })),
    );

    const [skill] = await tx
      .update(skills)
      .set({
        title: input.title,
        slug: preview.slug,
        summary: input.summary,
        category: input.category,
        tags: input.tags,
        visibility: input.visibility,
        currentVersionId: version.id,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skillId))
      .returning();

    return {
      skill,
      version,
      nextVersion: preview.nextVersion,
    };
  });
}
