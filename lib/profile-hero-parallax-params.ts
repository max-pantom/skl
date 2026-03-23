/**
 * Default 3D tilt for the hero profile avatar (`ProfileAvatar` with `parallax`).
 * Box-shadow is cleared while hovering (see profile-avatar); idle uses shadowIdle.
 */
export const HERO_PROFILE_PARALLAX_PARAMS = {
  perspective: 1470,
  maxRotateX: 15,
  maxRotateY: 32,
  tiltSensitivity: 0.95,
  idleScale: 1,
  hoverScale: 1,
  idleTranslateZ: 0,
  hoverTranslateZ: 20,
  transitionMs: 500,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  shadowIdle: "0 8px 24px rgba(36, 36, 36, 0.12)",
  /** No shadow on hover (`0` in design JSON → `none` for valid CSS). */
  shadowHover: "none",
} as const;

export type HeroProfileParallaxParams = typeof HERO_PROFILE_PARALLAX_PARAMS;
