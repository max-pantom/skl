import type { SkillVersionFileRecord } from "@/lib/types";

export const PRIMARY_SKILL_FILE = "SKILL.md";

export type SkillFileInput = {
  path: string;
  content: string;
};

export function normalizeSkillFilePath(value: string) {
  return value.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

export function isValidSkillFilePath(path: string) {
  if (!path) {
    return false;
  }

  const segments = path.split("/");

  return segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
}

export function isMarkdownPath(path: string) {
  return /\.(md|markdown|mdx)$/i.test(path);
}

export function getPrimarySkillFile<T extends { path: string }>(files: T[]) {
  return files.find((file) => file.path === PRIMARY_SKILL_FILE) ?? files[0] ?? null;
}

export function selectSkillFile<T extends { path: string }>(files: T[], requestedPath?: string | null) {
  if (requestedPath) {
    const match = files.find((file) => file.path === requestedPath);

    if (match) {
      return match;
    }
  }

  return getPrimarySkillFile(files);
}

export function sortSkillFiles<T extends { path: string; sortOrder?: number }>(files: T[]) {
  return [...files].sort((left, right) => {
    const primaryLeft = left.path === PRIMARY_SKILL_FILE ? -1 : 0;
    const primaryRight = right.path === PRIMARY_SKILL_FILE ? -1 : 0;

    if (primaryLeft !== primaryRight) {
      return primaryLeft - primaryRight;
    }

    const orderLeft = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderRight = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (orderLeft !== orderRight) {
      return orderLeft - orderRight;
    }

    return left.path.localeCompare(right.path);
  });
}

export function createFallbackSkillFile(content: string): SkillVersionFileRecord {
  return {
    id: "legacy-skill-file",
    skillVersionId: "legacy-skill-version",
    path: PRIMARY_SKILL_FILE,
    content,
    sortOrder: 0,
    createdAt: new Date(0).toISOString(),
  };
}
