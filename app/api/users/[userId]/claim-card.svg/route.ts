import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { escapeHtml } from "@/lib/email/escape-html";
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

function extractSvgBody(svg: string) {
  return svg
    .replace(/^<\?xml[^>]*>\s*/i, "")
    .replace(/^<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");
}

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

  const avatarSvg = buildShieldAvatarSvgString(userId, 160, {
    avatarScale: DEFAULT_SHIELD_LAYOUT.avatarScale,
    avatarOffsetX: DEFAULT_SHIELD_LAYOUT.avatarOffsetX,
    avatarOffsetY: DEFAULT_SHIELD_LAYOUT.avatarOffsetY,
    topStarScale: DEFAULT_TOP_STAR_SCALE,
    includeOuterDisc: true,
    clipToCircle: true,
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="720" viewBox="0 0 1200 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="720" fill="#F6F6F2"/>
  <rect x="72" y="72" width="1056" height="576" rx="44" fill="#FFFFFF"/>
  <rect x="72.5" y="72.5" width="1055" height="575" rx="43.5" stroke="rgba(36,36,36,0.12)"/>
  <circle cx="930" cy="158" r="118" fill="#F0F0EB"/>
  <circle cx="1040" cy="612" r="164" fill="#F7F7F4"/>
  <g transform="translate(120 178)">
    ${extractSvgBody(avatarSvg)}
  </g>
  <text x="380" y="238" fill="#8F8F8F" font-family="Arial, sans-serif" font-size="18" letter-spacing="3.8">SKL CLAIMED PROFILE</text>
  <text x="380" y="330" fill="#242424" font-family="Arial, sans-serif" font-size="68" font-weight="700">${escapeHtml(user.displayName)}</text>
  <text x="380" y="388" fill="#8F8F8F" font-family="Arial, sans-serif" font-size="30">@${escapeHtml(user.username)}</text>
  <rect x="380" y="446" width="196" height="42" rx="21" fill="#ECFDF3"/>
  <text x="412" y="473" fill="#027A48" font-family="Arial, sans-serif" font-size="18" font-weight="700">EMAIL VERIFIED</text>
  <text x="380" y="552" fill="#4B4B4B" font-family="Arial, sans-serif" font-size="24">Generated avatar. Verified profile. Ready to share.</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Content-Disposition": `attachment; filename="${user.username}-skl-card.svg"`,
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
