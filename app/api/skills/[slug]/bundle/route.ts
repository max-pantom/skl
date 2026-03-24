import { getRequestViewer } from "@/lib/auth";
import { getAccessibleSkillBySlug, recordSkillDownload } from "@/lib/data";
import { resolveSkillInstallVersion } from "@/lib/skill-install";
import { sortSkillFiles } from "@/lib/skill-files";

type BundleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * Full skill payload in one response; records a single download event (unlike per-file `/raw`).
 */
export async function GET(request: Request, { params }: BundleRouteProps) {
  const { slug } = await params;
  const viewer = await getRequestViewer(request);
  const skill = await getAccessibleSkillBySlug(slug, viewer?.id ?? null);

  if (!skill) {
    return Response.json({ error: "Skill not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const versionParam = url.searchParams.get("version");
  const resolvedVersion = resolveSkillInstallVersion(skill, versionParam);

  if (!resolvedVersion) {
    return Response.json({ error: "Version not found" }, { status: 404 });
  }

  await recordSkillDownload(skill.id, viewer?.id ?? null);

  const files = sortSkillFiles(resolvedVersion.files).map((file) => ({
    path: file.path,
    content: file.content,
  }));

  return Response.json(
    {
      slug: skill.slug,
      title: skill.title,
      version: resolvedVersion.version,
      files,
    },
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}
