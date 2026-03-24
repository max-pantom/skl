import { NextResponse } from "next/server";

import { getCliViewerFromRequest } from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const viewer = await getCliViewerFromRequest(request);

  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    viewer: {
      id: viewer.id,
      username: viewer.username,
      displayName: viewer.displayName,
    },
  });
}
