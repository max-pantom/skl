import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { skills, stars } from "@/db/schema";
import { getCurrentViewer } from "@/lib/auth";
import { getSkillBySlug } from "@/lib/data";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  const viewer = await getCurrentViewer();

  if (!viewer || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const existingStar = await db.query.stars.findFirst({
    where: and(eq(stars.skillId, skill.id), eq(stars.userId, viewer.id)),
  });

  let starred = false;

  if (existingStar) {
    await db.transaction(async (tx) => {
      await tx.delete(stars).where(eq(stars.id, existingStar.id));
      await tx
        .update(skills)
        .set({
          starsCount: sql`GREATEST(${skills.starsCount} - 1, 0)`,
        })
        .where(eq(skills.id, skill.id));
    });
  } else {
    await db.transaction(async (tx) => {
      await tx.insert(stars).values({
        userId: viewer.id,
        skillId: skill.id,
      });
      await tx
        .update(skills)
        .set({
          starsCount: sql`${skills.starsCount} + 1`,
        })
        .where(eq(skills.id, skill.id));
    });
    starred = true;
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/s/${skill.slug}`);
  revalidatePath(`/u/${skill.author.username}`);

  return NextResponse.json({ ok: true, starred });
}
