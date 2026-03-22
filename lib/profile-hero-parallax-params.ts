/**
 * Default 3D tilt for the hero profile avatar (`ProfileAvatar` with `parallax`).
 * Box-shadow is cleared while hovering (see profile-avatar); idle uses shadowIdle.
 */
export const HERO_PROFILE_PARALLAX_PARAMS = {
  perspective: 970,
  maxRotateX: 8,
  maxRotateY: 18,
  tiltSensitivity: 1,
  idleScale: 1,
  hoverScale: 0.94,
  idleTranslateZ: 0,
  hoverTranslateZ: -14,
  transitionMs: 180,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  shadowIdle: "0 8px 24px rgba(36, 36, 36, 0.12)",
  shadowHover: "",
} as const;

export type HeroProfileParallaxParams = typeof HERO_PROFILE_PARALLAX_PARAMS;
