import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { downloads, skills } from "@/db/schema";
import { getCurrentViewer } from "@/lib/auth";
import { getSkillBySlug } from "@/lib/data";
import { selectSkillFile } from "@/lib/skill-files";

type RawSkillRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: RawSkillRouteProps) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return new Response("Skill not found", { status: 404 });
  }

  if (db) {
    try {
      const viewer = await getCurrentViewer();

      await db.transaction(async (tx) => {
        await tx.insert(downloads).values({
          userId: viewer?.id ?? null,
          skillId: skill.id,
        });

        await tx
          .update(skills)
          .set({
            downloadsCount: sql`${skills.downloadsCount} + 1`,
          })
          .where(eq(skills.id, skill.id));
      });
    } catch {
      /* demo slugs or missing rows should still return the file */
    }
  }

  const requestedPath = new URL(request.url).searchParams.get("path");
  const selectedFile = selectSkillFile(skill.currentVersion.files, requestedPath);

  if (!selectedFile || (requestedPath && selectedFile.path !== requestedPath)) {
    return new Response("File not found", { status: 404 });
  }

  const filename = `${skill.slug}-${skill.currentVersion.version}-${selectedFile.path.replace(/\//g, "-")}`;
  const contentType = /\.md$/i.test(selectedFile.path) ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8";

  return new Response(selectedFile.content, {
    headers: {
      "content-type": contentType,
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
