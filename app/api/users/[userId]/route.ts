import { NextResponse } from "next/server";

import { getPublicProfileByUserId } from "@/lib/data";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteProps = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { userId } = await params;

  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const profile = await getPublicProfileByUserId(userId);

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const stats = {
    skillCount: profile.skills.length,
    totalStars: profile.skills.reduce((sum, skill) => sum + skill.starsCount, 0),
    totalForks: profile.skills.reduce((sum, skill) => sum + skill.forksCount, 0),
    totalDownloads: profile.skills.reduce((sum, skill) => sum + skill.downloadsCount, 0),
  };

  return NextResponse.json(
    {
      user: profile.user,
      skills: profile.skills,
      stats,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
