import { NextResponse } from "next/server";

import { db } from "@/db";
import { skills } from "@/db/schema";
import { getCliViewerFromRequest } from "@/lib/cli-auth";
import { normalizeSkillSubmission, previewUpdateSkillSubmission, validateCreateSkillSubmission } from "@/lib/skill-publish";
import { getSkillBySlug } from "@/lib/data";

export const runtime = "nodejs";

type PreviewBody = {
  mode?: "create" | "update";
  targetSlug?: string;
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

  if (!viewer || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as PreviewBody | null;

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

    if (body.mode === "update") {
      const existing = body.targetSlug ? await getSkillBySlug(body.targetSlug) : null;

      if (!existing) {
        return NextResponse.json({ error: "Skill not found." }, { status: 404 });
      }

      const preview = await previewUpdateSkillSubmission(existing.id, viewer.id, normalized);

      return NextResponse.json({
        ok: true,
        mode: "update",
        slug: preview.slug,
        currentVersion: preview.currentVersionRecord.version,
        nextVersion: preview.nextVersion,
        fileCount: normalized.files.length,
        files: normalized.files.map((file) => file.path),
      });
    }

    validateCreateSkillSubmission(normalized);

    return NextResponse.json({
      ok: true,
      mode: "create",
      slug: normalized.slug,
      nextVersion: normalized.version,
      fileCount: normalized.files.length,
      files: normalized.files.map((file) => file.path),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Preview failed.",
      },
      { status: 400 },
    );
  }
}
