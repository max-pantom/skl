import fs from "node:fs/promises";
import path from "node:path";

import { fetchSkillDetail } from "./inspect.js";
import { withLoading } from "./loading.js";
import { promptChoice, promptConfirm, promptLine, promptMultiSelect } from "./prompt.js";
import { cliMySkillsUrl, cliPreviewUrl, cliPublishUrl, cliUpdateUrl, requestJson, resolveRegistryBase } from "./registry.js";
import { readCliState, readLocalProjectState, upsertCliProject, writeLocalProjectState } from "./state.js";

const CATEGORIES = ["coding", "design", "writing", "research", "automation", "marketing"] as const;
const VISIBILITIES = ["public", "unlisted"] as const;
const IGNORED_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);
const ENTRY_FILE_PATTERN = /(^|\/)SKILL\.md$|\.(md|markdown|mdx|txt|prompt)$/i;

type PublishPayload = {
  title: string;
  slug?: string;
  summary: string;
  category: string;
  visibility: string;
  version?: string;
  changelog?: string;
  tags: string[];
  compatibleWith: string[];
  files: Array<{ path: string; content: string }>;
};

type EntryDefaults = {
  title?: string;
  summary?: string;
  version?: string;
  compatibleWith?: string[];
};

type PreviewResponse = {
  ok: true;
  mode: "create" | "update";
  slug: string;
  currentVersion?: string;
  nextVersion: string;
  fileCount: number;
  files: string[];
};

type PublishResponse = {
  ok: true;
  skill: {
    slug: string;
    title: string;
  };
  version: string;
};

type OwnedSkillSummary = {
  slug: string;
  title: string;
  visibility: string;
  updatedAt: string;
  currentVersion: string | null;
};

type OwnedSkillsResponse = {
  skills: OwnedSkillSummary[];
};

async function statSafe(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

function getRelativeDir(relativePath: string) {
  const lastSlash = relativePath.lastIndexOf("/");
  return lastSlash === -1 ? "." : relativePath.slice(0, lastSlash);
}

async function collectEntryCandidates(root: string): Promise<string[]> {
  const entries: string[] = [];

  async function walk(current: string) {
    const dirEntries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of dirEntries) {
      if (entry.name.startsWith(".") && entry.name !== ".github") {
        if (entry.isDirectory()) {
          continue;
        }
      }
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) {
          continue;
        }
        await walk(path.join(current, entry.name));
        continue;
      }
      const full = path.join(current, entry.name);
      const rel = path.relative(root, full).replace(/\\/g, "/");
      if (ENTRY_FILE_PATTERN.test(rel)) {
        entries.push(rel);
      }
    }
  }

  await walk(root);
  return entries.sort();
}

async function chooseEntryFromRoot(root: string) {
  const candidates = await collectEntryCandidates(root);
  if (!candidates.length) {
    throw new Error("No compatible skill entry files found in that folder.");
  }

  const skillCandidates = candidates.filter((candidate) => candidate.endsWith("SKILL.md"));
  const preferredCandidates = skillCandidates.length ? skillCandidates : candidates;

  const directories = [...new Set(preferredCandidates.map((candidate) => getRelativeDir(candidate)))];
  if (directories.length > 1) {
    const directoryChoice = await promptChoice(
      "Choose a folder with a skill entry file",
      directories.map((directory) => ({
        label: directory === "." ? "." : directory,
        value: directory,
      })),
    );

    const directoryCandidates = preferredCandidates.filter((candidate) => getRelativeDir(candidate) === directoryChoice);
    if (directoryCandidates.length === 1) {
      return directoryCandidates[0]!;
    }

    return promptChoice(
      "Choose a skill entry file",
      directoryCandidates.map((candidate) => ({ label: candidate, value: candidate })),
    );
  }

  if (preferredCandidates.length === 1) {
    return preferredCandidates[0]!;
  }

  return promptChoice(
    "Choose a skill entry file",
    preferredCandidates.map((candidate) => ({ label: candidate, value: candidate })),
  );
}

async function isProbablyText(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (!ext) return true;
  return [".md", ".markdown", ".mdx", ".txt", ".json", ".yaml", ".yml", ".toml", ".ts", ".tsx", ".js", ".jsx", ".prompt"].includes(ext);
}

async function collectProjectFiles(root: string): Promise<string[]> {
  const entries: string[] = [];

  async function walk(current: string) {
    const dirEntries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of dirEntries) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) {
          continue;
        }
        await walk(path.join(current, entry.name));
        continue;
      }
      const full = path.join(current, entry.name);
      if (!(await isProbablyText(full))) {
        continue;
      }
      entries.push(path.relative(root, full).replace(/\\/g, "/"));
    }
  }

  await walk(root);
  return entries.sort();
}

async function chooseFilesToInclude(allFiles: string[]) {
  const defaultFiles = allFiles.filter((file) => file !== ".skl/project.json");
  const directories = [...new Set(defaultFiles.map((file) => getRelativeDir(file)))];

  let visibleFiles = defaultFiles;
  if (directories.length > 1) {
    const selectedDirectories = await promptMultiSelect(
      "Choose folders to include",
      directories.map((directory) => (directory === "." ? "." : directory)),
      true,
    );

    const allowedDirectories = new Set(selectedDirectories);
    visibleFiles = defaultFiles.filter((file) => allowedDirectories.has(getRelativeDir(file)));
  }

  return promptMultiSelect("Choose files to include", visibleFiles, true);
}

async function chooseEntryPath(inputPath?: string) {
  const cwd = process.cwd();
  if (inputPath?.trim()) {
    const resolved = path.resolve(cwd, inputPath);
    const stats = await statSafe(resolved);
    if (!stats) {
      throw new Error(`Path not found: ${inputPath}`);
    }
    if (stats.isFile()) {
      return {
        root: path.dirname(resolved),
        entrySource: path.basename(resolved),
      };
    }
    const entrySource = await chooseEntryFromRoot(resolved);
    return { root: resolved, entrySource };
  }

  const entrySource = await chooseEntryFromRoot(cwd);
  return { root: cwd, entrySource };
}

async function buildFiles(root: string, entrySource: string) {
  const allFiles = await collectProjectFiles(root);
  const selected = await chooseFilesToInclude(allFiles);
  const chosenSet = new Set(selected);
  chosenSet.add(entrySource);

  const files = [];
  for (const relativePath of [...chosenSet].sort()) {
    const content = await fs.readFile(path.join(root, relativePath), "utf8");
    files.push({
      path: relativePath === entrySource ? "SKILL.md" : relativePath,
      content,
    });
  }
  return files;
}

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { data: {} as Record<string, string>, body: content };
  }

  const data: Record<string, string> = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }
    const key = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && value) {
      data[key] = value;
    }
  }

  return {
    data,
    body: content.slice(match[0].length),
  };
}

function firstMeaningfulParagraph(markdown: string) {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .filter((line) => !line.startsWith("- "))
    .filter((line) => !/^\d+\.\s/.test(line));

  return lines.find((line) => line.length > 20) ?? lines[0] ?? "";
}

function extractEntryDefaults(content: string): EntryDefaults {
  const { data, body } = parseFrontmatter(content);
  const headingMatch = body.match(/^#\s+(.+)$/m);
  const title = data.title || data.name || headingMatch?.[1]?.trim() || "";
  const summary = data.summary || data.description || firstMeaningfulParagraph(body);
  const version = data.version?.trim() || "1.0.0";

  return {
    title,
    summary,
    version,
  };
}

function validatePublishPayload(payload: PublishPayload) {
  const title = payload.title.trim();
  const summary = payload.summary.trim();
  const version = (payload.version ?? "").trim();
  const primaryFile = payload.files.find((file) => file.path === "SKILL.md");
  const primaryContent = primaryFile?.content.trim() ?? "";

  if (!primaryContent) {
    throw new Error("The selected skill entry file is empty. Add content to the file you want to publish as SKILL.md.");
  }

  if (!title) {
    throw new Error("Add a title before publishing.");
  }

  if (!summary) {
    throw new Error("Add a summary before publishing.");
  }

  if (!version) {
    throw new Error("Add a version before publishing.");
  }

  if (!payload.compatibleWith.length) {
    throw new Error("Add at least one compatible model before publishing.");
  }
}

async function promptMetadata(existing?: Partial<PublishPayload>) {
  const title = await promptLine("Title", existing?.title);
  const slug = await promptLine("Slug", existing?.slug);
  const summary = await promptLine("Summary", existing?.summary);
  const category = await promptChoice(
    "Category",
    CATEGORIES.map((entry) => ({ label: entry, value: entry })),
  );
  const visibility = await promptChoice(
    "Visibility",
    VISIBILITIES.map((entry) => ({ label: entry, value: entry })),
  );
  const tags = (await promptLine("Tags (comma separated)", existing?.tags?.join(", "))).split(",").map((entry) => entry.trim()).filter(Boolean);
  const compatibleWith = (await promptLine("Compatible with (comma separated)", existing?.compatibleWith?.join(", "))).split(",").map((entry) => entry.trim()).filter(Boolean);

  return {
    title,
    slug,
    summary,
    category,
    visibility,
    tags,
    compatibleWith,
  };
}

function authTokenOrThrow(token?: string) {
  if (!token?.trim()) {
    throw new Error("Not logged in. Run `skl login` first.");
  }
  return token.trim();
}

async function statExists(filePath: string) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fetchOwnedSkills(registry: string, token: string) {
  const response = await withLoading("Loading your skills", () =>
    requestJson<OwnedSkillsResponse>(cliMySkillsUrl(registry), {
      registry,
      token,
    }),
  );

  return response.skills;
}

async function chooseOwnedSkill(registry: string, token: string, preferredSlug?: string) {
  const skills = await fetchOwnedSkills(registry, token);
  if (!skills.length) {
    throw new Error("No published skills found on your account yet.");
  }

  if (preferredSlug) {
    const exact = skills.find((skill) => skill.slug === preferredSlug);
    if (exact) {
      return exact;
    }
  }

  if (skills.length === 1) {
    return skills[0]!;
  }

  const ordered = preferredSlug
    ? [...skills].sort((left, right) => Number(right.slug === preferredSlug) - Number(left.slug === preferredSlug))
    : skills;

  const slug = await promptChoice(
    "Choose a skill to update",
    ordered.map((skill) => ({
      label: `${skill.title} (${skill.slug})${skill.currentVersion ? ` · v${skill.currentVersion}` : ""}${skill.visibility === "unlisted" ? " · unlisted" : ""}`,
      value: skill.slug,
    })),
  );

  return ordered.find((skill) => skill.slug === slug)!;
}

async function resolveUpdateSource(options: {
  explicitPath?: string;
  linkedRoot?: string;
}) {
  const cwd = process.cwd();
  const linkedRoot = options.linkedRoot?.trim() ? path.resolve(options.linkedRoot) : null;

  if (options.explicitPath?.trim()) {
    return path.resolve(cwd, options.explicitPath);
  }

  if (linkedRoot && (await statExists(linkedRoot))) {
    const reuse = await promptConfirm(`Use last linked folder? ${linkedRoot}`, true);
    if (reuse) {
      return linkedRoot;
    }
  }

  const fallback = linkedRoot || cwd;
  const nextPath = await promptLine("Path to update files", fallback);
  return path.resolve(cwd, nextPath);
}

export async function publishSkill(options: { path?: string; registry?: string; json?: boolean; dryRun?: boolean }) {
  const state = await readCliState();
  const registry = await resolveRegistryBase(options.registry?.trim() || state.registry);
  const token = authTokenOrThrow(state.token);
  const { root, entrySource } = await chooseEntryPath(options.path);
  const files = await buildFiles(root, entrySource);
  const entryContent = files.find((file) => file.path === "SKILL.md")?.content ?? "";
  const defaults = extractEntryDefaults(entryContent);
  const metadata = await promptMetadata(defaults);
  const version = await promptLine("Version", defaults.version || "1.0.0");
  const changelog = await promptLine("Changelog", "Initial release.");

  const payload: PublishPayload = {
    ...metadata,
    version,
    changelog,
    files,
  };

  validatePublishPayload(payload);

  const preview = await withLoading("Validating publish", () =>
    requestJson<PreviewResponse>(cliPreviewUrl(registry), {
      registry,
      token,
      method: "POST",
      body: {
        mode: "create",
        ...payload,
      },
    }),
  );

  console.log(`Ready to publish ${preview.slug} v${preview.nextVersion} with ${preview.fileCount} file(s).`);
  console.log(preview.files.join(", "));

  if (options.dryRun || !(await promptConfirm("Publish now?", true))) {
    return;
  }

  const result = await withLoading("Publishing skill", () =>
    requestJson<PublishResponse>(cliPublishUrl(registry), {
      registry,
      token,
      method: "POST",
      body: payload,
    }),
  );

  await writeLocalProjectState(root, {
    slug: result.skill.slug,
    registry,
    root,
    entrySource,
    lastVersion: result.version,
  });
  await upsertCliProject({
    slug: result.skill.slug,
    registry,
    root,
    entrySource,
    lastVersion: result.version,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Published ${result.skill.title} v${result.version} as ${result.skill.slug}.`);
}

export async function updateSkill(options: { pathOrSlug?: string; registry?: string; json?: boolean; dryRun?: boolean }) {
  const state = await readCliState();
  const registry = await resolveRegistryBase(options.registry?.trim() || state.registry);
  const token = authTokenOrThrow(state.token);
  const cwd = process.cwd();
  const localState = await readLocalProjectState(cwd);
  const explicitPath = options.pathOrSlug && options.pathOrSlug.includes(path.sep);
  const explicitSlug = options.pathOrSlug && !explicitPath ? options.pathOrSlug : undefined;
  const linkedProjects = state.projects ?? [];
  const targetSkill = await chooseOwnedSkill(registry, token, explicitSlug || localState?.slug);
  const linkedProject = linkedProjects.find((project) => project.slug === targetSkill.slug) ?? null;
  const root = await resolveUpdateSource({
    explicitPath: explicitPath ? options.pathOrSlug : undefined,
    linkedRoot: linkedProject?.root || localState?.root,
  });
  const rootLocalState = await readLocalProjectState(root);
  const entrySource = rootLocalState?.entrySource || linkedProject?.entrySource || localState?.entrySource || "SKILL.md";
  const files = await buildFiles(root, entrySource);
  const slug = targetSkill.slug;
  const detail = await withLoading("Loading current skill details", () =>
    fetchSkillDetail(slug, { registry, token }),
  );
  const metadata = await promptMetadata({
    title: detail.title,
    slug: detail.slug,
    summary: detail.summary,
    category: detail.category,
    visibility: detail.visibility,
    tags: detail.tags,
    compatibleWith: detail.currentVersion.compatibleWith,
  });
  const version = await promptLine("Next version (leave blank for auto major bump)");
  const changelog = await promptLine("Changelog", "Updated skill content.");

  const payload: PublishPayload = {
    ...metadata,
    version,
    changelog,
    files,
  };

  const preview = await withLoading("Validating update", () =>
    requestJson<PreviewResponse>(cliPreviewUrl(registry), {
      registry,
      token,
      method: "POST",
      body: {
        mode: "update",
        targetSlug: slug,
        ...payload,
      },
    }),
  );

  console.log(`Ready to update ${slug}: ${preview.currentVersion ?? "?"} -> ${preview.nextVersion}`);
  console.log(preview.files.join(", "));

  if (options.dryRun || !(await promptConfirm("Publish update now?", true))) {
    return;
  }

  const result = await withLoading("Publishing update", () =>
    requestJson<PublishResponse>(cliUpdateUrl(registry, slug), {
      registry,
      token,
      method: "POST",
      body: payload,
    }),
  );

  await writeLocalProjectState(root, {
    slug: result.skill.slug,
    registry,
    root,
    entrySource,
    lastVersion: result.version,
  });
  await upsertCliProject({
    slug: result.skill.slug,
    registry,
    root,
    entrySource,
    lastVersion: result.version,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Updated ${result.skill.title} to v${result.version}.`);
}
