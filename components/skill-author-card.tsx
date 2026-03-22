import Link from "next/link";

import { ProfileAvatar } from "@/components/profile-avatar";
import { UserRoleBadge } from "@/components/user-role-badge";
import type { PublicUser } from "@/lib/types";

export function SkillAuthorCard({ author }: { author: PublicUser }) {
  return (
    <Link
      href={`/u/${author.username}`}
      className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-[rgba(228,228,228,0.28)] px-3 py-2 text-left transition-colors hover:bg-[rgba(228,228,228,0.52)]"
    >
      <ProfileAvatar
        avatarUrl={author.avatarUrl}
        displayName={author.displayName}
        userId={author.id}
        role={author.role}
        size={40}
      />
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="block text-[16px] font-semibold text-[#242424]">{author.displayName}</span>
          <UserRoleBadge role={author.role} />
        </span>
        <span className="mt-0.5 block text-[14px] font-medium text-[#8f8f8f]">@{author.username}</span>
      </span>
    </Link>
  );
}
