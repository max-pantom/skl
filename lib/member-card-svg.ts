import type { MemberIdCardProps } from "@/components/member-id-card";
import { ADMIN_DEFAULT_AVATAR_PATH } from "@/lib/admin-avatar";
import { escapeHtml } from "@/lib/email/escape-html";
import type { RecentPassportClaimant, UserRole } from "@/lib/types";
import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  FRAME_VB,
  FRAME_CLIP_R,
  SHIELD_BBOX,
  SHIELD_HEIGHT,
  avatarContentTransformString,
  shieldTransformString,
} from "@/lib/shield-avatar-core";
import { buildShieldAvatarSvgString } from "@/lib/shield-avatar-svg-string";

const CARD_W = 367;

function extractSvgBody(svg: string) {
  return svg
    .replace(/^<\?xml[^>]*>\s*/i, "")
    .replace(/^<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");
}

function escAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function primaryNameFrom(displayName: string, override?: string) {
  const o = override?.trim();
  if (o) return o;
  const t = displayName.trim();
  return t.split(/\s+/)[0] || t;
}

function adminAvatarSvg(base: number, clipToCircle: boolean) {
  const shieldTransform = shieldTransformString();
  const avatarContentTransform = avatarContentTransformString(
    DEFAULT_SHIELD_LAYOUT.avatarScale,
    DEFAULT_SHIELD_LAYOUT.avatarOffsetX,
    DEFAULT_SHIELD_LAYOUT.avatarOffsetY,
  );

  const inner = `<g transform="${avatarContentTransform}"><g transform="${shieldTransform}"><image href="${ADMIN_DEFAULT_AVATAR_PATH}" x="${SHIELD_BBOX.minX}" y="${SHIELD_BBOX.minY}" width="${SHIELD_BBOX.maxX - SHIELD_BBOX.minX}" height="${SHIELD_HEIGHT}" preserveAspectRatio="xMidYMid meet"/></g></g>`;

  if (!clipToCircle) {
    return `<g transform="scale(${base / FRAME_VB})">${inner}</g>`;
  }

  return `<g transform="scale(${base / FRAME_VB})"><defs><clipPath id="admin-clip"><circle cx="${FRAME_VB / 2}" cy="${FRAME_VB / 2}" r="${FRAME_CLIP_R}"/></clipPath></defs><g clip-path="url(#admin-clip)">${inner}</g></g>`;
}

/** Square avatar (no circle): photo, admin tile, or shield — same semantics as {@link MemberIdCard} portrait. */
function squareAvatarBody(
  userId: string,
  role: UserRole,
  displayName: string,
  avatarUrl: string | null,
  side: number,
  clipToCircle: boolean,
): string {
  if (avatarUrl?.trim()) {
    const u = escAttr(avatarUrl.trim());
    return `<image href="${u}" x="0" y="0" width="${side}" height="${side}" preserveAspectRatio="xMidYMid slice"/>`;
  }
  if (role === "admin") {
    return adminAvatarSvg(side, clipToCircle);
  }
  const shield = buildShieldAvatarSvgString(userId, FRAME_VB, {
    avatarScale: DEFAULT_SHIELD_LAYOUT.avatarScale,
    avatarOffsetX: DEFAULT_SHIELD_LAYOUT.avatarOffsetX,
    avatarOffsetY: DEFAULT_SHIELD_LAYOUT.avatarOffsetY,
    topStarScale: DEFAULT_TOP_STAR_SCALE,
    includeOuterDisc: false,
    clipToCircle: false,
  });
  return `<g transform="scale(${side / FRAME_VB})">${extractSvgBody(shield)}</g>`;
}

function buildRecentMembersSvgFragment(
  cardOwnerId: string,
  members: RecentPassportClaimant[] | undefined,
  h: number,
  options: {
    show: boolean;
    max: number;
    size: number;
    cornerRadius: number;
    offsetRight: number;
    offsetBottom: number;
    overlap: number;
  },
): { defs: string; body: string } {
  if (!options.show || !members?.length) {
    return { defs: "", body: "" };
  }
  const slice = members.filter((c) => c.id !== cardOwnerId).slice(0, options.max);
  if (!slice.length) {
    return { defs: "", body: "" };
  }
  const ordered = [...slice].reverse();
  const s = options.size;
  const rx = options.cornerRadius;
  const step = s - options.overlap;
  const totalW = s + (ordered.length - 1) * step;
  const rightX = CARD_W - options.offsetRight;
  const y = h - options.offsetBottom - s;

  let defs = "";
  let body = "";
  ordered.forEach((c, i) => {
    const clipId = `skl-rm-${i}`;
    defs += `<clipPath id="${clipId}"><rect width="${s}" height="${s}" rx="${rx}" ry="${rx}"/></clipPath>`;
    const x = rightX - totalW + i * step;
    const inner = squareAvatarBody(
      c.id,
      c.role,
      c.displayName,
      c.avatarUrl,
      s,
      false,
    );
    body += `<g transform="translate(${x},${y})"><g clip-path="url(#${clipId})">${inner}</g></g>`;
  });

  return { defs, body };
}

/**
 * Static SVG matching {@link MemberIdCard} (for download / export).
 * Optional-prop fallbacks mirror {@link MemberIdCard} defaults.
 */
export function buildMemberIdCardSvg(props: MemberIdCardProps): string {
  const {
    displayName,
    primaryName: primaryOverride,
    footerDate,
    earlyBelieverRank,
    userId,
    role,
    avatarUrl,
    portraitBaseSize = 256,
    portraitScale = 2.66,
    portraitOffsetRight = -243,
    portraitOffsetY = -56,
    portraitOpacity = 1,
    portraitRotateDeg = 0,
    showPortrait = true,
    showRank = true,
    showDate = true,
    rankLabelOpacity = 0.2,
    dateLabelOpacity = 0.2,
    nameFontSize = 32,
    nameOffsetX = -22,
    nameOffsetY = -201,
    nameRotateDeg = 0,
    rankBlockOffsetX = 0,
    rankBlockOffsetY = 0,
    dateOffsetX = 0,
    dateOffsetY = 0,
    minHeight = 508,
    cardBackground = "#e4e4e4",
    cardRadius = 18,
    shadowX = 6,
    shadowY = 6,
    shadowOpacity = 0.17,
    recentMembers,
    showRecentMembers = true,
    recentMembersMax = 4,
    recentMembersAvatarSize = 30,
    recentMembersCornerRadius,
    recentMembersOffsetRight = 14,
    recentMembersOffsetBottom = 14,
    recentMembersOverlap = 10,
    adminPortraitClipCircle = false,
  } = props;

  const h = minHeight;
  const primary = primaryNameFrom(displayName, primaryOverride);
  const showRankLine = showRank && earlyBelieverRank != null;

  const sx = shadowX;
  const sy = shadowY;
  const shadowFill = `rgba(0,0,0,${shadowOpacity})`;

  const thumbRx =
    recentMembersCornerRadius ?? Math.min(8, Math.max(4, Math.round(recentMembersAvatarSize * 0.2)));

  const { defs: recentDefs, body: recentBody } = buildRecentMembersSvgFragment(userId, recentMembers, h, {
    show: showRecentMembers,
    max: recentMembersMax,
    size: recentMembersAvatarSize,
    cornerRadius: thumbRx,
    offsetRight: recentMembersOffsetRight,
    offsetBottom: recentMembersOffsetBottom,
    overlap: recentMembersOverlap,
  });

  let portraitInner = "";
  if (showPortrait) {
    portraitInner = squareAvatarBody(
      userId,
      role,
      displayName,
      avatarUrl,
      portraitBaseSize,
      adminPortraitClipCircle,
    );
    const cx = CARD_W - portraitOffsetRight;
    const cy = h / 2 + portraitOffsetY;
    portraitInner = `<g opacity="${portraitOpacity}" transform="translate(${cx},${cy}) rotate(${portraitRotateDeg}) scale(${portraitScale}) translate(${-portraitBaseSize},${-portraitBaseSize / 2})">${portraitInner}</g>`;
  }

  const rankText = showRankLine
    ? `<text x="${14 + rankBlockOffsetX}" y="${26 + rankBlockOffsetY}" fill="rgba(0,0,0,${rankLabelOpacity})" font-family="ui-monospace, monospace" font-size="12">#${earlyBelieverRank} of users</text>`
    : "";

  const dateText = showDate
    ? `<text x="${14 + dateOffsetX}" y="${h - 14 - dateOffsetY}" fill="rgba(0,0,0,${dateLabelOpacity})" font-family="ui-monospace, monospace" font-size="12">${escapeHtml(footerDate)}</text>`
    : "";

  const nameBlock = `<g transform="translate(${36 + nameOffsetX},${h / 2 + nameOffsetY}) rotate(${nameRotateDeg})"><text x="0" y="0" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="${nameFontSize}" font-weight="500" dominant-baseline="middle">${escapeHtml(primary)}</text></g>`;

  const defsPrefix = recentDefs ? `<defs>${recentDefs}</defs>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${h}" viewBox="0 0 ${CARD_W} ${h}" fill="none">
  ${defsPrefix}
  <rect x="${sx}" y="${sy}" width="${CARD_W}" height="${h}" rx="${cardRadius}" fill="${escAttr(shadowFill)}"/>
  <rect width="${CARD_W}" height="${h}" rx="${cardRadius}" fill="${escAttr(cardBackground)}"/>
  ${portraitInner}
  ${rankText}
  ${nameBlock}
  ${dateText}
  ${recentBody}
</svg>`;
}

export function memberCardSvgFilename(displayName: string) {
  const slug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^\w\d]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${slug || "member"}-skl-card.svg`;
}
