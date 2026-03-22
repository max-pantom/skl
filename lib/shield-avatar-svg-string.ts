import {
  BOTTOM_PATH,
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  FRAME_CLIP_R,
  FRAME_VB,
  GRAD_X1,
  GRAD_X2,
  GRAD_Y1,
  GRAD_Y2,
  STAR_CX,
  STAR_CY,
  STAR_OUTER_R,
  avatarContentTransformString,
  buildIrregularStarPath,
  hashString,
  paramsFromSeed,
  shieldTransformString,
  type ShieldPaint,
} from "@/lib/shield-avatar-core";

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Full `<svg>...</svg>` markup for the default product shield (same geometry/colors as `ShieldAvatar`).
 * Used by `/api/users/[id]/avatar.svg` — no React / react-dom/server (Next.js build constraint).
 */
export function buildShieldAvatarSvgString(
  seed: string,
  size: number,
  opts?: {
    avatarScale?: number;
    avatarOffsetX?: number;
    avatarOffsetY?: number;
    topStarScale?: number;
    includeOuterDisc?: boolean;
    clipToCircle?: boolean;
  },
): string {
  const avatarScale = opts?.avatarScale ?? DEFAULT_SHIELD_LAYOUT.avatarScale;
  const avatarOffsetX = opts?.avatarOffsetX ?? DEFAULT_SHIELD_LAYOUT.avatarOffsetX;
  const avatarOffsetY = opts?.avatarOffsetY ?? DEFAULT_SHIELD_LAYOUT.avatarOffsetY;
  const topStarScale = opts?.topStarScale ?? DEFAULT_TOP_STAR_SCALE;
  const includeOuterDisc = opts?.includeOuterDisc ?? true;
  const clipToCircle = opts?.clipToCircle ?? true;

  const base = paramsFromSeed(seed);
  const p: ShieldPaint = { ...base, topStarScale };

  const uid = `s${hashString(seed)}`;
  const topPath = buildIrregularStarPath(
    seed,
    STAR_CX,
    STAR_CY,
    STAR_OUTER_R * p.topStarScale,
    p.innerRatio,
    p.points,
  );

  const botFill = p.unifiedGradient ? `url(#${uid}-g-top)` : `url(#${uid}-g-bot)`;
  const topFill = `url(#${uid}-g-top)`;

  const st = shieldTransformString();
  const act = avatarContentTransformString(avatarScale, avatarOffsetX, avatarOffsetY);

  const shieldArt = `<g transform="${escAttr(act)}"><g transform="${escAttr(st)}"><path d="${BOTTOM_PATH}" fill="${botFill}" stroke="${escAttr(p.stroke)}" stroke-width="${p.strokeWidth}" stroke-linejoin="round"/><path d="${escAttr(topPath)}" fill="${topFill}" stroke="${escAttr(p.stroke)}" stroke-width="${p.strokeWidth}" stroke-linejoin="round"/></g></g>`;

  const clipWrapper = clipToCircle
    ? `<g clip-path="url(#${uid}-avatarClip)">${shieldArt}</g>`
    : shieldArt;

  const clipDef = clipToCircle
    ? `<clipPath id="${uid}-avatarClip" clipPathUnits="userSpaceOnUse"><circle cx="${FRAME_VB / 2}" cy="${FRAME_VB / 2}" r="${FRAME_CLIP_R}"/></clipPath>`
    : "";

  const botGrad = p.unifiedGradient
    ? ""
    : `<linearGradient id="${uid}-g-bot" x1="${GRAD_X1}" y1="${GRAD_Y1}" x2="${GRAD_X2}" y2="${GRAD_Y2}" gradientUnits="userSpaceOnUse"><stop stop-color="${escAttr(p.bottomStop0)}"/><stop offset="1" stop-color="${escAttr(p.bottomStop1)}"/></linearGradient>`;

  const defs = `<defs><filter id="${uid}-frameFilter" x="0" y="-3" width="100" height="103" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feMorphology radius="2" operator="dilate" in="SourceAlpha" result="effect1_innerShadow"/><feOffset dy="-3"/><feGaussianBlur stdDeviation="5.55"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter>${clipDef}<linearGradient id="${uid}-g-top" x1="${GRAD_X1}" y1="${GRAD_Y1}" x2="${GRAD_X2}" y2="${GRAD_Y2}" gradientUnits="userSpaceOnUse"><stop stop-color="${escAttr(p.topStop0)}"/><stop offset="1" stop-color="${escAttr(p.topStop1)}"/></linearGradient>${botGrad}</defs>`;

  const disc = includeOuterDisc
    ? `<g filter="url(#${uid}-frameFilter)"><rect width="${FRAME_VB}" height="${FRAME_VB}" rx="${FRAME_VB / 2}" fill="#F0F0F0"/></g>`
    : "";

  const cls = clipToCircle ? "shrink-0 overflow-hidden rounded-full" : "shrink-0 overflow-visible";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${FRAME_VB} ${FRAME_VB}" fill="none" class="${cls}" aria-hidden="true">${defs}${disc}${clipWrapper}</svg>`;
}
