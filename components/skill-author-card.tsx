import Link from "next/link";

import { ProfileAvatar } from "@/components/profile-avatar";
import { UserRoleBadge } from "@/components/user-role-badge";
import type { PublicUser } from "@/lib/types";

export function SkillAuthorCard({ author }: { author: PublicUser }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-[rgba(228,228,228,0.12)] p-4">
      <p className="page-kicker mb-3">Author</p>
      <Link
        href={`/u/${author.username}`}
        className="flex items-start gap-3 rounded-lg transition-colors hover:bg-[rgba(36,36,36,0.04)]"
      >
        <ProfileAvatar avatarUrl={author.avatarUrl} displayName={author.displayName} userId={author.id} size={48} />
        <span className="min-w-0 flex-1 text-left">
          <span className="flex items-center gap-2">
            <span className="block text-[16px] font-semibold text-[#242424]">{author.displayName}</span>
            <UserRoleBadge role={author.role} />
          </span>
          <span className="mt-0.5 block text-[15px] font-medium text-[#8f8f8f]">@{author.username}</span>
          {author.bio ? (
            <span className="mt-2 line-clamp-3 block text-[15px] font-medium leading-snug text-[#242424]/80">
              {author.bio}
            </span>
          ) : null}
        </span>
      </Link>
    </section>
  );
}
