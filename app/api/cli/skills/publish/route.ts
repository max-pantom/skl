import { NextResponse } from "next/server";

import { getCliViewerFromRequest } from "@/lib/cli-auth";
import { createSkillFromSubmission, normalizeSkillSubmission } from "@/lib/skill-publish";

export const runtime = "nodejs";

type PublishBody = {
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

export async function POST(request: Request) {
  const viewer = await getCliViewerFromRequest(request);

  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as PublishBody | null;

  if (!body?.files?.length) {
    return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
  }

  try {
    const normalized = normalizeSkillSubmission({
      title: body.title ?? "",
      slug: body.slug,
      summary: body.summary ?? "",
      category: body.category ?? "",
      visibility: body.visibility,
      version: body.version,
      changelog: body.changelog,
      tags: body.tags,
      compatibleWith: body.compatibleWith,
      files: body.files,
    });

    const created = await createSkillFromSubmission(viewer.id, normalized);

    return NextResponse.json({
      ok: true,
      skill: {
        id: created.skill.id,
        slug: created.skill.slug,
        title: created.skill.title,
      },
      version: created.version.version,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Publish failed.",
      },
      { status: 400 },
    );
  }
}
