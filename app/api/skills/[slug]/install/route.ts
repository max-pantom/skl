import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import { getPublicSkillBySlug, recordSkillDownload } from "@/lib/data";
import type { SkillDetail } from "@/lib/types";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildInstallPayload(skill: SkillDetail) {
  const { versions: _versions, ...rest } = skill;
  return rest;
}

export async function POST(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const skill = await getPublicSkillBySlug(slug);

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const viewer = await getCurrentViewer();
  const downloadRecorded = await recordSkillDownload(skill.id, viewer?.id ?? null);

  return NextResponse.json(
    {
      skill: buildInstallPayload(skill),
      meta: {
        downloadRecorded,
      },
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
