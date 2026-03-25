import { getCurrentViewer } from "@/lib/auth";
import { getAccessibleSkillBySlug, recordSkillDownload } from "@/lib/data";
import { ensureAgentReadySkillFiles } from "@/lib/skill-agent-ready";
import { resolveSkillInstallVersion } from "@/lib/skill-install";
import { sortSkillFiles } from "@/lib/skill-files";
import JSZip from "jszip";

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

  const zip = new JSZip();

  for (const file of ensureAgentReadySkillFiles(
    {
      slug: skill.slug,
      summary: skill.summary,
      title: skill.title,
    },
    sortSkillFiles(resolvedVersion.files),
  )) {
    zip.file(file.path, file.content);
  }

  const archive = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  const filename = `${skill.slug}.zip`;
  const archiveBuffer = Buffer.from(archive);

  return new Response(archiveBuffer, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
