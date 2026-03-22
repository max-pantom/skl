import { NextResponse } from "next/server";

import { buildShieldAvatarSvgString } from "@/lib/shield-avatar-svg-string";
import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
} from "@/lib/shield-avatar-core";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteProps = {
  params: Promise<{ userId: string }>;
};

/**
 * Public SVG avatar for a user (deterministic shield from `userId`).
 * Used in emails when the user has no uploaded photo — img src must be an absolute HTTPS URL.
 * Built as a string (no react-dom/server) so Next.js can compile the route.
 */
export async function GET(_request: Request, { params }: RouteProps) {
  const { userId } = await params;
  if (!UUID_RE.test(userId)) {
    return new NextResponse("Invalid user id", { status: 400 });
  }

  const svg = buildShieldAvatarSvgString(userId, 200, {
    avatarScale: DEFAULT_SHIELD_LAYOUT.avatarScale,
    avatarOffsetX: DEFAULT_SHIELD_LAYOUT.avatarOffsetX,
    avatarOffsetY: DEFAULT_SHIELD_LAYOUT.avatarOffsetY,
    topStarScale: DEFAULT_TOP_STAR_SCALE,
    includeOuterDisc: true,
    clipToCircle: true,
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
