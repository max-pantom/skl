import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { skills } from "@/db/schema";
import { getCliViewerFromRequest } from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const viewer = await getCliViewerFromRequest(request);

  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ skills: [] });
  }

  const rows = await db.query.skills.findMany({
    where: eq(skills.authorId, viewer.id),
    orderBy: [desc(skills.updatedAt)],
    with: {
      currentVersion: true,
    },
  });

  return NextResponse.json({
    skills: rows.map((skill) => ({
      slug: skill.slug,
      title: skill.title,
      visibility: skill.visibility,
      updatedAt: skill.updatedAt,
      currentVersion: skill.currentVersion?.version ?? null,
    })),
  });
}
