import { createHash } from "node:crypto";

import { getPublicSkillBySlug } from "@/lib/data";
import { resolveSkillInstallVersion } from "@/lib/skill-install";
import { sortSkillFiles } from "@/lib/skill-files";

type ManifestRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

function sha256Hex(content: string) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export async function GET(request: Request, { params }: ManifestRouteProps) {
  const { slug } = await params;
  const skill = await getPublicSkillBySlug(slug);

  if (!skill) {
    return Response.json({ error: "Skill not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const versionParam = url.searchParams.get("version");
  const resolvedVersion = resolveSkillInstallVersion(skill, versionParam);

  if (!resolvedVersion) {
    return Response.json({ error: "Version not found" }, { status: 404 });
  }

  const files = sortSkillFiles(resolvedVersion.files).map((file) => ({
    path: file.path,
    sha256: sha256Hex(file.content),
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
        "cache-control": "public, max-age=60",
      },
    },
  );
}
