import { getSkillBySlug } from "@/lib/data";

type RawSkillRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, { params }: RawSkillRouteProps) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return new Response("Skill not found", { status: 404 });
  }

  const filename = `${skill.slug}-${skill.currentVersion.version}.md`;

  return new Response(skill.currentVersion.content, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}

