import { getRequestViewer } from "@/lib/auth";
import { getAccessibleSkillBySlug, recordSkillDownload } from "@/lib/data";
import { ensureAgentReadySkillFile } from "@/lib/skill-agent-ready";
import { resolveSkillInstallVersion } from "@/lib/skill-install";
import { selectSkillFile } from "@/lib/skill-files";

type RawSkillRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: RawSkillRouteProps) {
  const { slug } = await params;
  const viewer = await getRequestViewer(request);
  const skill = await getAccessibleSkillBySlug(slug, viewer?.id ?? null);

  if (!skill) {
    return new Response("Skill not found", { status: 404 });
  }

  const url = new URL(request.url);
  const versionParam = url.searchParams.get("version");
  const resolvedVersion = resolveSkillInstallVersion(skill, versionParam);

  if (!resolvedVersion) {
    return new Response("Version not found", { status: 404 });
  }

  await recordSkillDownload(skill.id, viewer?.id ?? null);

  const requestedPath = url.searchParams.get("path");
  const selectedFile = selectSkillFile(resolvedVersion.files, requestedPath);

  if (!selectedFile || (requestedPath && selectedFile.path !== requestedPath)) {
    return new Response("File not found", { status: 404 });
  }

  const downloadableFile = ensureAgentReadySkillFile(
    {
      slug: skill.slug,
      summary: skill.summary,
      title: skill.title,
    },
    selectedFile,
  );

  const filename = `${skill.slug}-${resolvedVersion.version}-${downloadableFile.path.replace(/\//g, "-")}`;
  const contentType = /\.md$/i.test(downloadableFile.path) ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8";

  return new Response(downloadableFile.content, {
    headers: {
      "content-type": contentType,
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
