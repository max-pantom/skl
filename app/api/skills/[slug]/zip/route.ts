import { getCurrentViewer } from "@/lib/auth";
import { getAccessibleSkillBySlug, recordSkillDownload } from "@/lib/data";
import { resolveSkillInstallVersion } from "@/lib/skill-install";
import { sortSkillFiles } from "@/lib/skill-files";
import { buildZipArchive } from "@/lib/zip";

type ZipSkillRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: ZipSkillRouteProps) {
  const { slug } = await params;
  const viewer = await getCurrentViewer();
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

  const archive = buildZipArchive(
    sortSkillFiles(resolvedVersion.files).map((file) => ({
      path: file.path,
      content: file.content,
    })),
  );
  const filename = `${skill.slug}.zip`;

  return new Response(archive, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
