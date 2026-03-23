import type { MemberIdCardProps } from "@/components/member-id-card";

type PassportCardPreset = Pick<
  MemberIdCardProps,
  | "portraitBaseSize"
  | "portraitScale"
  | "portraitOffsetRight"
  | "portraitOffsetY"
  | "portraitOpacity"
  | "portraitRotateDeg"
  | "minHeight"
  | "cardBackground"
  | "cardRadius"
  | "showPortrait"
  | "showRank"
  | "showDate"
  | "rankLabelOpacity"
  | "dateLabelOpacity"
  | "nameFontSize"
  | "nameOffsetX"
  | "nameOffsetY"
  | "nameRotateDeg"
  | "rankBlockOffsetX"
  | "rankBlockOffsetY"
  | "dateOffsetX"
  | "dateOffsetY"
  | "shadowX"
  | "shadowY"
  | "shadowOpacity"
  | "hoverParallax"
  | "className"
>;

export const PASSPORT_CARD_DEFAULTS: PassportCardPreset = {
  portraitBaseSize: 256,
  portraitScale: 2.66,
  portraitOffsetRight: -243,
  portraitOffsetY: -56,
  portraitOpacity: 1,
  portraitRotateDeg: 0,
  minHeight: 508,
  cardBackground: "#e4e4e4",
  cardRadius: 18,
  showPortrait: true,
  showRank: true,
  showDate: true,
  rankLabelOpacity: 0.2,
  dateLabelOpacity: 0.2,
  nameFontSize: 32,
  nameOffsetX: -22,
  nameOffsetY: -201,
  nameRotateDeg: 0,
  rankBlockOffsetX: 0,
  rankBlockOffsetY: 0,
  dateOffsetX: 0,
  dateOffsetY: 0,
  shadowX: 6,
  shadowY: 6,
  shadowOpacity: 0.17,
  hoverParallax: true,
  className: "w-full max-w-[367px]",
};
