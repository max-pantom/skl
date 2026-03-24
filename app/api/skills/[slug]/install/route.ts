import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import { getAccessibleSkillBySlug, recordSkillDownload } from "@/lib/data";
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
  const viewer = await getCurrentViewer();
  const skill = await getAccessibleSkillBySlug(slug, viewer?.id ?? null);

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

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
