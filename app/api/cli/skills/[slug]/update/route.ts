import { NextResponse } from "next/server";

import { getCliViewerFromRequest } from "@/lib/cli-auth";
import { getSkillBySlug } from "@/lib/data";
import { normalizeSkillSubmission, updateSkillFromSubmission } from "@/lib/skill-publish";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

type UpdateBody = {
  title?: string;
  slug?: string;
  summary?: string;
  category?: string;
  visibility?: string;
  version?: string;
  changelog?: string;
  tags?: string[] | string | null;
  compatibleWith?: string[] | string | null;
  files?: Array<{ path: string; content: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const viewer = await getCliViewerFromRequest(request);

  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = await getSkillBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as UpdateBody | null;

  if (!body?.files?.length) {
    return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
  }

  try {
    const normalized = normalizeSkillSubmission({
      title: body.title ?? existing.title,
      slug: body.slug ?? existing.slug,
      summary: body.summary ?? existing.summary,
      category: body.category ?? existing.category,
      visibility: body.visibility ?? existing.visibility,
      version: body.version,
      changelog: body.changelog,
      tags: body.tags ?? existing.tags,
      compatibleWith: body.compatibleWith ?? existing.currentVersion.compatibleWith,
      files: body.files,
    });

    const updated = await updateSkillFromSubmission(existing.id, viewer.id, normalized);

    return NextResponse.json({
      ok: true,
      skill: {
        id: updated.skill.id,
        slug: updated.skill.slug,
        title: updated.skill.title,
      },
      version: updated.nextVersion,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Update failed.",
      },
      { status: 400 },
    );
  }
}
