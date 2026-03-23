import path from "node:path";

/**
 * Reject paths that escape the install root (mirrors server rules in lib/skill-files).
 */
export function assertSafeRelativeFilePath(filePath: string): string {
  const norm = filePath.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!norm) {
    throw new Error("Empty file path in bundle");
  }
  const segments = norm.split("/");
  if (segments.some((s) => s === "." || s === "..")) {
    throw new Error(`Unsafe path in bundle: ${filePath}`);
  }
  return norm;
}

export function resolveUnderRoot(root: string, relativePath: string): string {
  const safe = assertSafeRelativeFilePath(relativePath);
  const full = path.resolve(root, ...safe.split("/"));
  const rootResolved = path.resolve(root);
  const rel = path.relative(rootResolved, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Path escapes install directory: ${relativePath}`);
  }
  return full;
}
