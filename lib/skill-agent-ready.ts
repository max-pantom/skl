import { PRIMARY_SKILL_FILE } from "@/lib/skill-files";
import type { SkillDetail, SkillVersionFileRecord, SkillVersionRecord } from "@/lib/types";

type SkillAgentReadyMeta = {
  slug: string;
  summary: string;
  title?: string;
};

function stripFrontmatter(content: string) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function hasAgentFrontmatter(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return false;
  }

  const block = match[1] ?? "";
  return /^\s*name\s*:/m.test(block) && /^\s*description\s*:/m.test(block);
}

function buildAgentDescription(summary: string) {
  const trimmed = summary.trim();

  if (!trimmed) {
    return "Use this skill when the task matches the skill content.";
  }

  if (/^use (this )?skill when/i.test(trimmed) || /^use when/i.test(trimmed)) {
    return trimmed;
  }

  return `Use this skill when the task matches: ${trimmed}`;
}

function buildFrontmatter(meta: SkillAgentReadyMeta) {
  return [
    "---",
    `name: ${JSON.stringify(meta.slug)}`,
    `description: ${JSON.stringify(buildAgentDescription(meta.summary))}`,
    "---",
    "",
  ].join("\n");
}

export function ensureAgentReadySkillContent(meta: SkillAgentReadyMeta, content: string) {
  if (hasAgentFrontmatter(content)) {
    return content;
  }

  return `${buildFrontmatter(meta)}${stripFrontmatter(content)}`;
}

export function ensureAgentReadySkillFile<T extends { path: string; content: string }>(meta: SkillAgentReadyMeta, file: T): T {
  if (file.path !== PRIMARY_SKILL_FILE) {
    return file;
  }

  return {
    ...file,
    content: ensureAgentReadySkillContent(meta, file.content),
  };
}

export function ensureAgentReadySkillFiles<T extends { path: string; content: string }>(meta: SkillAgentReadyMeta, files: T[]) {
  return files.map((file) => ensureAgentReadySkillFile(meta, file));
}

export function ensureAgentReadyVersion(meta: SkillAgentReadyMeta, version: SkillVersionRecord): SkillVersionRecord {
  const primary = version.files.find((file) => file.path === PRIMARY_SKILL_FILE);
  const content = primary ? ensureAgentReadySkillContent(meta, primary.content) : version.content;

  return {
    ...version,
    content,
    files: ensureAgentReadySkillFiles(meta, version.files),
  };
}

export function ensureAgentReadyInstallSkill(skill: SkillDetail) {
  return {
    ...skill,
    currentVersion: ensureAgentReadyVersion(
      {
        slug: skill.slug,
        summary: skill.summary,
        title: skill.title,
      },
      skill.currentVersion,
    ),
  };
}
