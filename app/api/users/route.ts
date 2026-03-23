import { NextResponse } from "next/server";

import { getPublicUsers } from "@/lib/data";

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const q = url.searchParams.get("q")?.trim() ?? "";

  const users = await getPublicUsers(q);

  return NextResponse.json(
    {
      users: users.slice(0, limit),
      meta: {
        total: users.length,
        limit,
        q: q || null,
      },
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
