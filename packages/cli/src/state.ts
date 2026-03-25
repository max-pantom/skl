import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { DEFAULT_REGISTRY } from "./registry.js";

export type CliState = {
  registry: string;
  token?: string;
  viewer?: {
    id: string;
    username: string;
    displayName: string;
  };
  projects?: LocalProjectState[];
};

export type LocalProjectState = {
  slug: string;
  registry: string;
  root: string;
  entrySource: string;
  lastVersion?: string;
};

function configDir() {
  return process.env.SKL_CONFIG_DIR?.trim() || path.join(os.homedir(), ".skl");
}

function cliStatePath() {
  return path.join(configDir(), "cli-state.json");
}

function projectStatePath(root: string) {
  return path.join(root, ".skl", "project.json");
}

export async function readCliState(): Promise<CliState> {
  try {
    const raw = await fs.readFile(cliStatePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<CliState>;
    return {
      registry: parsed.registry?.trim() || DEFAULT_REGISTRY,
      token: parsed.token?.trim() || undefined,
      viewer: parsed.viewer,
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
  } catch {
    return {
      registry: DEFAULT_REGISTRY,
      projects: [],
    };
  }
}

export async function writeCliState(state: CliState) {
  await fs.mkdir(configDir(), { recursive: true });
  await fs.writeFile(cliStatePath(), JSON.stringify(state, null, 2), "utf8");
}

export async function clearCliState() {
  const current = await readCliState();
  await writeCliState({
    registry: current.registry || DEFAULT_REGISTRY,
    projects: current.projects ?? [],
  });
}

export async function readLocalProjectState(root: string): Promise<LocalProjectState | null> {
  try {
    const raw = await fs.readFile(projectStatePath(root), "utf8");
    return JSON.parse(raw) as LocalProjectState;
  } catch {
    return null;
  }
}

export async function writeLocalProjectState(root: string, state: LocalProjectState) {
  const file = projectStatePath(root);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(state, null, 2), "utf8");
}

export async function upsertCliProject(project: LocalProjectState) {
  const current = await readCliState();
  const projects = [...(current.projects ?? [])];
  const index = projects.findIndex((entry) => entry.slug === project.slug);

  if (index === -1) {
    projects.push(project);
  } else {
    projects[index] = project;
  }

  await writeCliState({
    ...current,
    projects,
  });
}
