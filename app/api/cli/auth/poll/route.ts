import { NextResponse } from "next/server";

import { exchangeCliAuthRequest } from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { deviceCode?: string } | null;
  const deviceCode = body?.deviceCode?.trim();

  if (!deviceCode) {
    return NextResponse.json({ error: "Missing device code." }, { status: 400 });
  }

  const result = await exchangeCliAuthRequest(deviceCode);

  if (result.status === "not_found") {
    return NextResponse.json({ error: "CLI login request not found." }, { status: 404 });
  }

  if (result.status === "expired" || result.status === "rejected") {
    return NextResponse.json({ ok: false, status: result.status });
  }

  if (result.status === "already_exchanged") {
    return NextResponse.json({ ok: false, status: result.status });
  }

  if (result.status === "pending") {
    return NextResponse.json({ ok: true, status: "pending" });
  }

  return NextResponse.json({
    ok: true,
    status: "approved",
    token: result.token,
    viewer: result.viewer,
  });
}
