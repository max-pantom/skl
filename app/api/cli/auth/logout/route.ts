import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { cliSessions } from "@/db/schema";
import { getCliViewerFromRequest } from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const viewer = await getCliViewerFromRequest(request);

  if (!viewer || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .update(cliSessions)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(cliSessions.userId, viewer.id), isNull(cliSessions.revokedAt)));

  return NextResponse.json({ ok: true });
}
