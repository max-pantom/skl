import { NextResponse } from "next/server";

import { createCliAuthRequest } from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const request = await createCliAuthRequest();

    return NextResponse.json({
      ok: true,
      ...request,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not start CLI login.",
      },
      { status: 500 },
    );
  }
}
