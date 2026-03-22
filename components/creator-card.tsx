import Link from "next/link";

import { ProfileAvatar } from "@/components/profile-avatar";
import { IconMetricStar } from "@/components/profile-metric-icons";
import { UserRoleBadge } from "@/components/user-role-badge";
import type { TopCreator } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

export function CreatorCard({
  creator,
  dividers = true,
}: {
  creator: TopCreator;
  dividers?: boolean;
}) {
  const { user, skillCount, totalStars } = creator;

  return (
    <article
      className={cn(
        "group py-5 transition-colors hover:bg-[rgba(36,36,36,0.04)]",
        dividers && "border-b border-zinc-200 last:border-b-0",
      )}
    >
      <Link href={`/u/${user.username}`} className="flex items-center gap-4 px-2">
        <ProfileAvatar avatarUrl={user.avatarUrl} displayName={user.displayName} userId={user.id} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[16px] font-semibold text-[#242424]">{user.displayName}</p>
            <UserRoleBadge role={user.role} />
          </div>
          <p className="truncate text-[15px] font-medium text-[#8f8f8f]">@{user.username}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-[15px] font-medium text-[#8f8f8f]">
          <span className="tabular-nums text-[#242424]">{formatNumber(skillCount)} skills</span>
          <span className="flex items-center gap-1">
            <IconMetricStar className="size-4 shrink-0 text-[#919191]" />
            <span className="tabular-nums text-[#242424]">{formatNumber(totalStars)}</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
