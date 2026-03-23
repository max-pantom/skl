import { NextResponse } from "next/server";

import { getPublicSkillBySlug } from "@/lib/data";
import type { SkillDetail } from "@/lib/types";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildSkillPayload(skill: SkillDetail, includeVersions: boolean) {
  if (includeVersions) {
    return skill;
  }

  const { versions: _versions, ...rest } = skill;
  return rest;
}

export async function GET(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const includeVersions = new URL(request.url).searchParams.get("include") === "versions";
  const skill = await getPublicSkillBySlug(slug);

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      skill: buildSkillPayload(skill, includeVersions),
      meta: {
        includeVersions,
      },
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
