import { buildMemberIdCardSvg } from "@/lib/member-card-svg";
import { PASSPORT_CARD_DEFAULTS } from "@/lib/passport-card-config";
import type { UserRole } from "@/lib/types";

export function buildPassportCardSvg(input: {
  avatarUrl: string | null;
  displayName: string;
  earlyBelieverRank: number | null;
  footerDate: string;
  role: UserRole;
  userId: string;
}) {
  return buildMemberIdCardSvg({
    ...PASSPORT_CARD_DEFAULTS,
    avatarUrl: input.avatarUrl,
    displayName: input.displayName,
    earlyBelieverRank: input.earlyBelieverRank,
    footerDate: input.footerDate,
    role: input.role,
    userId: input.userId,
  });
}
