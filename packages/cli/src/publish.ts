import fs from "node:fs/promises";
import path from "node:path";

import { promptChoice, promptConfirm, promptLine, promptMultiSelect } from "./prompt.js";
import { cliPreviewUrl, cliPublishUrl, cliUpdateUrl, normalizeRegistryBase, requestJson } from "./registry.js";
import { readCliState, readLocalProjectState, writeLocalProjectState } from "./state.js";

const CATEGORIES = ["coding", "design", "writing", "research", "automation", "marketing"] as const;
const VISIBILITIES = ["public", "unlisted"] as const;
const IGNORED_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);

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

async function statSafe(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

async function collectMarkdownCandidates(root: string, includeFallback = true): Promise<string[]> {
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
      if (entry.name === "SKILL.md") {
        entries.push(rel);
      } else if (includeFallback && /\.(md|markdown|mdx)$/i.test(entry.name)) {
        entries.push(rel);
      }
    }
  }

  await walk(root);
  return entries;
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
    const candidates = await collectMarkdownCandidates(resolved, true);
    if (!candidates.length) {
      throw new Error("No markdown candidates found in that folder.");
    }
    const entrySource = candidates.length === 1
      ? candidates[0]!
      : await promptChoice(
          "Choose a skill entry file",
          candidates.map((candidate) => ({ label: candidate, value: candidate })),
        );
    return { root: resolved, entrySource };
  }

  const candidates = await collectMarkdownCandidates(cwd, true);
  if (!candidates.length) {
    throw new Error("No markdown candidates found in this repo.");
  }
  const skillCandidates = candidates.filter((candidate) => candidate.endsWith("SKILL.md"));
  const pool = skillCandidates.length ? skillCandidates : candidates;
  const entrySource = pool.length === 1
    ? pool[0]!
    : await promptChoice(
        "Choose a skill entry file",
        pool.map((candidate) => ({ label: candidate, value: candidate })),
      );
  return { root: cwd, entrySource };
}

async function buildFiles(root: string, entrySource: string) {
  const allFiles = await collectProjectFiles(root);
  const defaultFiles = allFiles.filter((file) => file !== ".skl/project.json");
  const selected = await promptMultiSelect("Choose files to include", defaultFiles, true);
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

export async function publishSkill(options: { path?: string; registry?: string; json?: boolean; dryRun?: boolean }) {
  const state = await readCliState();
  const registry = normalizeRegistryBase(options.registry?.trim() || state.registry);
  const token = authTokenOrThrow(state.token);
  const { root, entrySource } = await chooseEntryPath(options.path);
  const files = await buildFiles(root, entrySource);
  const metadata = await promptMetadata();
  const version = await promptLine("Version", "1.0.0");
  const changelog = await promptLine("Changelog", "Initial release.");

  const payload: PublishPayload = {
    ...metadata,
    version,
    changelog,
    files,
  };

  const preview = await requestJson<PreviewResponse>(cliPreviewUrl(registry), {
    registry,
    token,
    method: "POST",
    body: {
      mode: "create",
      ...payload,
    },
  });

  console.log(`Ready to publish ${preview.slug} v${preview.nextVersion} with ${preview.fileCount} file(s).`);
  console.log(preview.files.join(", "));

  if (options.dryRun || !(await promptConfirm("Publish now?", true))) {
    return;
  }

  const result = await requestJson<PublishResponse>(cliPublishUrl(registry), {
    registry,
    token,
    method: "POST",
    body: payload,
  });

  await writeLocalProjectState(root, {
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
  const registry = normalizeRegistryBase(options.registry?.trim() || state.registry);
  const token = authTokenOrThrow(state.token);
  const cwd = process.cwd();
  const localState = await readLocalProjectState(cwd);
  const explicitPath = options.pathOrSlug && options.pathOrSlug.includes(path.sep);
  const explicitSlug = options.pathOrSlug && !explicitPath ? options.pathOrSlug : undefined;
  const root = explicitPath ? path.resolve(cwd, options.pathOrSlug!) : cwd;
  const entrySource = localState?.entrySource || "SKILL.md";
  const files = await buildFiles(root, entrySource);
  const slug = explicitSlug || localState?.slug || (await promptLine("Skill slug to update"));
  const metadata = await promptMetadata();
  const version = await promptLine("Next version (leave blank for auto major bump)");
  const changelog = await promptLine("Changelog", "Updated skill content.");

  const payload: PublishPayload = {
    ...metadata,
    version,
    changelog,
    files,
  };

  const preview = await requestJson<PreviewResponse>(cliPreviewUrl(registry), {
    registry,
    token,
    method: "POST",
    body: {
      mode: "update",
      targetSlug: slug,
      ...payload,
    },
  });

  console.log(`Ready to update ${slug}: ${preview.currentVersion ?? "?"} -> ${preview.nextVersion}`);
  console.log(preview.files.join(", "));

  if (options.dryRun || !(await promptConfirm("Publish update now?", true))) {
    return;
  }

  const result = await requestJson<PublishResponse>(cliUpdateUrl(registry, slug), {
    registry,
    token,
    method: "POST",
    body: payload,
  });

  await writeLocalProjectState(root, {
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
