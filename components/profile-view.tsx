import { ProfileAvatar } from "@/components/profile-avatar";
import { IconMetricDownload, IconMetricFork, IconMetricStar } from "@/components/profile-metric-icons";
import { ProfileSkillsPanel } from "@/components/profile-skills-panel";
import { UserRoleBadge } from "@/components/user-role-badge";
import type { PublicUser, SkillListItem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

type ProfileViewProps = {
  user: PublicUser;
  authoredSkills: SkillListItem[];
  starredSkills: SkillListItem[];
  isOwnProfile: boolean;
  earlyBelieverRank?: number | null;
  /** Profile aggregate stats (totals across authored skills). */
  totalStars: number;
  totalForks: number;
  totalDownloads: number;
};

/**
 * Shared profile layout for `/u/[username]` and `/test`.
 * Edit here so preview and production stay aligned.
 */
export function ProfileView({
  user,
  authoredSkills,
  starredSkills,
  isOwnProfile,
  earlyBelieverRank,
  totalStars,
  totalForks,
  totalDownloads,
}: ProfileViewProps) {
  const isMilestoneRank = earlyBelieverRank === 50 || earlyBelieverRank === 100;
  const earlyRankMessage = earlyBelieverRank
    ? isMilestoneRank
      ? `You made us hit the ${earlyBelieverRank === 50 ? "50" : "100"} early-people milestone.`
      : `You are the No. ${earlyBelieverRank} account. Early believers.`
    : null;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1056px] flex-1 flex-col">
      <section className="flex flex-col items-center text-center">
        <div className="relative mb-6 size-[100px]">
          <ProfileAvatar
            avatarUrl={user.avatarUrl}
            displayName={user.displayName}
            userId={user.id}
            role={user.role}
            parallax
          />
          {earlyBelieverRank ? (
            <span
              className={`absolute left-[89px] top-[-8px] rotate-[-23.45deg] text-xs font-semibold ${
                isMilestoneRank ? "text-[#222222]/80" : "text-black/20"
              }`}
              title={earlyRankMessage ?? undefined}
              aria-label={earlyRankMessage ?? undefined}
            >
              #{earlyBelieverRank}
            </span>
          ) : null}
        </div>

        <div className="flex max-w-[218px] flex-col items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-[24px] font-semibold leading-none text-[#242424]">{user.displayName}</h1>
            <div className="flex items-center justify-center gap-2">
              <p className="text-[16px] font-medium leading-none text-[#242424]/50 underline decoration-dotted underline-offset-4">
                @{user.username}
              </p>
              <UserRoleBadge role={user.role} />
            </div>
          </div>

          {user.bio ? (
            <p className="text-[16px] font-medium leading-[1.15] text-[#242424] opacity-80">{user.bio}</p>
          ) : null}

          <div className="flex w-full items-center justify-center gap-6 text-[16px] text-[rgba(36,36,36,0.6)]">
            <div className="flex items-center gap-1.5">
              <IconMetricStar className="size-[18px] shrink-0 text-[rgba(36,36,36,0.6)]" />
              <span>{formatNumber(totalStars)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconMetricFork className="size-[18px] shrink-0 text-[rgba(36,36,36,0.6)]" />
              <span>{formatNumber(totalForks)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconMetricDownload className="size-[18px] shrink-0 text-[rgba(36,36,36,0.6)]" />
              <span>{formatNumber(totalDownloads)}</span>
            </div>
          </div>

          {user.website ? (
            <a
              href={user.website}
              target="_blank"
              rel="noreferrer"
              className="text-base text-[#919191] underline decoration-dotted underline-offset-4"
            >
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
        </div>
      </section>

      <section className="mt-[90px] flex min-h-0 flex-1 flex-col">
        <ProfileSkillsPanel
          authoredSkills={authoredSkills}
          starredSkills={starredSkills}
          isOwnProfile={isOwnProfile}
        />
      </section>
    </div>
  );
}
