import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { withLoading } from "./loading.js";
import { assertSafeRelativeFilePath, resolveUnderRoot } from "./paths.js";
import { promptLine } from "./prompt.js";
import { bundleUrl, manifestUrl, rawUrl, requestJson, resolveRegistryBase } from "./registry.js";
import { resolveSkillSlugFromInput } from "./search.js";
import { readCliState } from "./state.js";

export type InstallOptions = {
  slugSpec?: string;
  registry?: string;
  outDir?: string;
  target?: "cursor";
  token?: string;
  cwd?: string;
  dryRun?: boolean;
  json?: boolean;
  verbose?: boolean;
};

export type BundlePayload = {
  slug: string;
  title: string;
  version: string;
  files: Array<{ path: string; content: string }>;
};

type ManifestPayload = {
  slug: string;
  title: string;
  version: string;
  files: Array<{ path: string; sha256: string }>;
};

type SingleFileInstall = {
  slug: string;
  version?: string;
  filePath: string;
};

export function parseSlugSpec(spec: string): { slug: string; version?: string; filePath?: string } {
  const trimmed = spec.trim();
  if (!trimmed) {
    throw new Error("Missing skill slug");
  }

  const at = trimmed.lastIndexOf("@");
  if (at <= 0) {
    return { slug: trimmed };
  }

  const slug = trimmed.slice(0, at);
  const rest = trimmed.slice(at + 1);
  const colon = rest.indexOf(":");

  if (colon === -1) {
    return { slug, version: rest || undefined };
  }

  return {
    slug,
    version: rest.slice(0, colon) || undefined,
    filePath: rest.slice(colon + 1) || undefined,
  };
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

async function ensureSlugSpec(spec?: string) {
  if (spec?.trim()) {
    return spec.trim();
  }
  return promptLine("Skill slug or slug@version[:file]");
}

export async function installSkill(opts: InstallOptions): Promise<{ root: string; payload: BundlePayload | SingleFileInstall }> {
  const state = await readCliState();
  const slugSpec = await ensureSlugSpec(opts.slugSpec);
  const parsed = parseSlugSpec(slugSpec);
  const slug = await withLoading("Resolving skill", () =>
    resolveSkillSlugFromInput(parsed.slug, { registry: opts.registry ?? state.registry }),
  );
  const { version, filePath } = parsed;
  const registry = await resolveRegistryBase(opts.registry?.trim() || state.registry);
  const token = opts.token?.trim() || state.token?.trim();
  const root = resolveInstallRoot(opts, slug);

  if (filePath) {
    const safePath = assertSafeRelativeFilePath(filePath);
    const url = rawUrl(registry, slug, version, safePath);
    if (opts.verbose) {
      console.log(`GET ${url.toString()}`);
    }
    const response = await withLoading("Downloading file", () =>
      fetch(url, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      }),
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const content = await response.text();
    const dest = resolveUnderRoot(root, safePath);

    if (!opts.dryRun) {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, content, "utf8");
    }

    return {
      root,
      payload: {
        slug,
        version,
        filePath: safePath,
      },
    };
  }

  const url = bundleUrl(registry, slug, version);
  if (opts.verbose) {
    const manifest = await requestJson<ManifestPayload>(manifestUrl(registry, slug, version), {
      registry,
      token,
    });
    console.log(`Bundle: ${url.toString()}`);
    console.log(`Manifest: ${manifest.files.map((file) => `${file.path}:${file.sha256.slice(0, 8)}`).join(", ")}`);
  }

  const payload = await withLoading("Downloading skill bundle", () =>
    requestJson<BundlePayload>(url, {
      registry,
      token,
    }),
  );
  if (!payload.slug || !payload.files?.length) {
    throw new Error("Invalid bundle response from registry");
  }

  if (!opts.dryRun) {
    await fs.mkdir(root, { recursive: true });

    for (const file of payload.files) {
      const dest = resolveUnderRoot(root, file.path);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, file.content, "utf8");
    }
  }

  if (opts.json) {
    console.log(JSON.stringify({ root, payload }, null, 2));
  }

  return { root, payload };
}
