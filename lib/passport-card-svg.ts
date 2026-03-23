import { escapeHtml } from "@/lib/email/escape-html";
import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
} from "@/lib/shield-avatar-core";
import { buildShieldAvatarSvgString } from "@/lib/shield-avatar-svg-string";

function extractSvgBody(svg: string) {
  return svg
    .replace(/^<\?xml[^>]*>\s*/i, "")
    .replace(/^<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");
}

export function buildPassportCardSvg(input: {
  userId: string;
  displayName: string;
  username: string;
}) {
  const avatarSvg = buildShieldAvatarSvgString(input.userId, 160, {
    avatarScale: DEFAULT_SHIELD_LAYOUT.avatarScale,
    avatarOffsetX: DEFAULT_SHIELD_LAYOUT.avatarOffsetX,
    avatarOffsetY: DEFAULT_SHIELD_LAYOUT.avatarOffsetY,
    topStarScale: DEFAULT_TOP_STAR_SCALE,
    includeOuterDisc: true,
    clipToCircle: true,
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="1200" fill="#FFFFFF"/>
  <rect x="120" y="120" width="960" height="960" rx="56" fill="#F6F6F2"/>
  <rect x="120.5" y="120.5" width="959" height="959" rx="55.5" stroke="rgba(36,36,36,0.10)"/>
  <rect x="210" y="210" width="780" height="780" rx="44" fill="#FFFFFF"/>
  <rect x="210.5" y="210.5" width="779" height="779" rx="43.5" stroke="rgba(36,36,36,0.12)"/>
  <circle cx="852" cy="320" r="118" fill="#F0F0EB"/>
  <circle cx="922" cy="914" r="164" fill="#F7F7F4"/>
  <g transform="translate(330 318)">
    ${extractSvgBody(avatarSvg)}
  </g>
  <text x="330" y="300" fill="#8F8F8F" font-family="Arial, sans-serif" font-size="18" letter-spacing="3.8">SKL PASSPORT</text>
  <text x="330" y="580" fill="#242424" font-family="Arial, sans-serif" font-size="68" font-weight="700">${escapeHtml(input.displayName)}</text>
  <text x="330" y="638" fill="#8F8F8F" font-family="Arial, sans-serif" font-size="30">@${escapeHtml(input.username)}</text>
  <rect x="330" y="696" width="196" height="42" rx="21" fill="#ECFDF3"/>
  <text x="362" y="723" fill="#027A48" font-family="Arial, sans-serif" font-size="18" font-weight="700">EMAIL VERIFIED</text>
  <text x="330" y="802" fill="#4B4B4B" font-family="Arial, sans-serif" font-size="24">Generated avatar. Verified profile. Ready to share.</text>
</svg>`;
}
