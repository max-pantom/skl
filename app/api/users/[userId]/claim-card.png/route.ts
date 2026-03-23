import { Resvg } from "@resvg/resvg-js";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { buildPassportCardSvg } from "@/lib/passport-card-svg";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteProps = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { userId } = await params;

  if (!UUID_RE.test(userId)) {
    return new NextResponse("Invalid user id", { status: 400 });
  }

  if (!db) {
    return new NextResponse("Database unavailable", { status: 503 });
  }

  const user = await db.query.users.findFirst({
    columns: {
      displayName: true,
      username: true,
    },
    where: eq(schema.users.id, userId),
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  const svg = buildPassportCardSvg({
    userId,
    displayName: user.displayName,
    username: user.username,
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1200,
    },
  });
  const pngData = resvg.render().asPng();

  return new NextResponse(new Uint8Array(pngData), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Content-Disposition": `attachment; filename="${user.username}-skl-card.png"`,
      "Content-Type": "image/png",
    },
  });
}
