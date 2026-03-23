import type { MemberIdCardProps } from "@/components/member-id-card";
import { escapeHtml } from "@/lib/email/escape-html";
import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  FRAME_VB,
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

function adminPlaceholderSvg(base: number, letter: string) {
  const rx = 14;
  return `<rect width="${base}" height="${base}" rx="${rx}" fill="#E8E8E8"/><text x="${base / 2}" y="${base / 2}" text-anchor="middle" dominant-baseline="central" fill="#242424" font-family="system-ui, sans-serif" font-size="${Math.round(base * 0.38)}" font-weight="600">${escapeHtml(letter)}</text>`;
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
    portraitBaseSize = 280,
    portraitScale = 1,
    portraitOffsetRight = -168,
    portraitOffsetY = -48,
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
  } = props;

  const h = minHeight;
  const primary = primaryNameFrom(displayName, primaryOverride);
  const showRankLine = showRank && earlyBelieverRank != null;

  const sx = shadowX;
  const sy = shadowY;
  const shadowFill = `rgba(0,0,0,${shadowOpacity})`;

  let portraitInner = "";
  if (showPortrait) {
    if (avatarUrl?.trim()) {
      const u = escAttr(avatarUrl.trim());
      portraitInner = `<image href="${u}" x="0" y="0" width="${portraitBaseSize}" height="${portraitBaseSize}" preserveAspectRatio="xMidYMid slice"/>`;
    } else if (role === "admin") {
      const L = (primary[0] ?? "?").toUpperCase();
      portraitInner = adminPlaceholderSvg(portraitBaseSize, L);
    } else {
      const shield = buildShieldAvatarSvgString(userId, FRAME_VB, {
        avatarScale: DEFAULT_SHIELD_LAYOUT.avatarScale,
        avatarOffsetX: DEFAULT_SHIELD_LAYOUT.avatarOffsetX,
        avatarOffsetY: DEFAULT_SHIELD_LAYOUT.avatarOffsetY,
        topStarScale: DEFAULT_TOP_STAR_SCALE,
        includeOuterDisc: false,
        clipToCircle: false,
      });
      portraitInner = `<g transform="scale(${portraitBaseSize / FRAME_VB})">${extractSvgBody(shield)}</g>`;
    }

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

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${h}" viewBox="0 0 ${CARD_W} ${h}" fill="none">
  <rect x="${sx}" y="${sy}" width="${CARD_W}" height="${h}" rx="${cardRadius}" fill="${escAttr(shadowFill)}"/>
  <rect width="${CARD_W}" height="${h}" rx="${cardRadius}" fill="${escAttr(cardBackground)}"/>
  ${portraitInner}
  ${rankText}
  ${nameBlock}
  ${dateText}
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
