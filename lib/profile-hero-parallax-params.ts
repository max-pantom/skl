/**
 * Default 3D tilt for the hero profile avatar (`ProfileAvatar` with `parallax`).
 * Hover uses no box-shadow (see profile-avatar); idle keeps shadowIdle.
 */
export const HERO_PROFILE_PARALLAX_PARAMS = {
  perspective: 1600,
  maxRotateX: 28,
  maxRotateY: 11,
  tiltSensitivity: 1,
  idleScale: 1,
  hoverScale: 1,
  idleTranslateZ: 23,
  hoverTranslateZ: -18,
  transitionMs: 180,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  shadowIdle: "0 8px 24px rgba(36, 36, 36, 0.12)",
  shadowHover: "0 18px 40px rgba(36, 36, 36, 0.2)",
} as const;

export type HeroProfileParallaxParams = typeof HERO_PROFILE_PARALLAX_PARAMS;
