import type { SkillDetail, SkillVersionRecord } from "@/lib/types";

/**
 * Pick which skill version to serve for install/raw/bundle when `?version=` is present.
 * Omit or empty query uses {@link SkillDetail.currentVersion}.
 */
export function resolveSkillInstallVersion(
  detail: SkillDetail,
  versionQuery: string | null,
): SkillVersionRecord | null {
  const q = versionQuery?.trim();
  if (!q) {
    return detail.currentVersion;
  }

  const match = detail.versions.find((v) => v.version === q);
  return match ?? null;
}
