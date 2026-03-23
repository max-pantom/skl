import { NextResponse } from "next/server";

import { getPublicExploreSkills } from "@/lib/data";
import { launchCategories, type SkillCategory, type SkillListItem } from "@/lib/types";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseLimit(value: string | null) {
  if (!value) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function parseCategory(value: string | null): SkillCategory | "all" {
  if (!value || value === "all") {
    return "all";
  }

  return launchCategories.includes(value as SkillCategory) ? (value as SkillCategory) : "all";
}

function sortSkills(skills: SkillListItem[], sort: string | null) {
  if (sort === "newest") {
    return [...skills].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  if (sort === "trending") {
    return [...skills].sort(
      (left, right) =>
        right.starsCount * 3 +
          right.downloadsCount +
          right.forksCount * 2 -
          (left.starsCount * 3 + left.downloadsCount + left.forksCount * 2) ||
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }

  return [...skills].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const q = url.searchParams.get("q")?.trim() ?? "";
  const category = parseCategory(url.searchParams.get("category"));
  const sort = url.searchParams.get("sort");

  const skills = await getPublicExploreSkills({
    category,
    query: q,
  });
  const items = sortSkills(skills, sort).slice(0, limit);

  return NextResponse.json(
    {
      skills: items,
      meta: {
        total: skills.length,
        limit,
        q: q || null,
        category,
        sort: sort === "newest" || sort === "trending" ? sort : "recent",
      },
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
