import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth";
import { bootstrapUserEmailLifecycle } from "@/lib/email/user-lifecycle";

export const runtime = "nodejs";

export async function POST() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await bootstrapUserEmailLifecycle(viewer.id);

  if (!result.welcome.ok || !result.audience.ok) {
    return NextResponse.json(
      {
        error:
          (!result.welcome.ok && result.welcome.error) ||
          (!result.audience.ok && result.audience.error) ||
          "Bootstrap failed.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, result });
}
