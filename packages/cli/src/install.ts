import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { bundleUrl, DEFAULT_REGISTRY, normalizeRegistryBase } from "./registry.js";
import { resolveUnderRoot } from "./paths.js";

export type InstallOptions = {
  slugSpec: string;
  registry?: string;
  outDir?: string;
  target?: "cursor";
  token?: string;
  cwd?: string;
};

export type BundlePayload = {
  slug: string;
  title: string;
  version: string;
  files: Array<{ path: string; content: string }>;
};

export function parseSlugSpec(spec: string): { slug: string; version?: string } {
  const trimmed = spec.trim();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) {
    return { slug: trimmed };
  }
  const maybeVersion = trimmed.slice(at + 1);
  if (!maybeVersion || maybeVersion.includes("/") || maybeVersion.includes("\\")) {
    return { slug: trimmed };
  }
  const slugPart = trimmed.slice(0, at);
  if (!slugPart) {
    throw new Error(`Invalid slug: ${spec}`);
  }
  return { slug: slugPart, version: maybeVersion };
}

function resolveInstallRoot(opts: InstallOptions, slug: string): string {
  const cwd = opts.cwd ?? process.cwd();
  if (opts.outDir) {
    return path.resolve(cwd, opts.outDir);
  }
  if (opts.target === "cursor") {
    return path.join(os.homedir(), ".cursor", "skills", slug);
  }
  return path.join(cwd, ".skl", "skills", slug);
}

export async function installSkill(opts: InstallOptions): Promise<{ root: string; payload: BundlePayload }> {
  const { slug, version } = parseSlugSpec(opts.slugSpec);
  if (!slug) {
    throw new Error("Missing skill slug");
  }

  const registryRaw = opts.registry?.trim() || process.env.SKL_REGISTRY?.trim() || DEFAULT_REGISTRY;
  const registryBase = normalizeRegistryBase(registryRaw);
  const url = bundleUrl(registryBase, slug, version);

  const headers: Record<string, string> = {
    accept: "application/json",
  };
  const token = opts.token?.trim() || process.env.SKL_TOKEN?.trim();
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) {
        detail = j.error;
      }
    } catch {
      /* keep body */
    }
    throw new Error(`Registry returned ${res.status}: ${detail}`);
  }

  const payload = (await res.json()) as BundlePayload;
  if (!payload.slug || !payload.files?.length) {
    throw new Error("Invalid bundle response from registry");
  }

  const root = resolveInstallRoot(opts, payload.slug);
  await fs.mkdir(root, { recursive: true });

  for (const file of payload.files) {
    const dest = resolveUnderRoot(root, file.path);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, file.content, "utf8");
  }

  return { root, payload };
}
