import { ProfileAvatar } from "@/components/profile-avatar";
import { IconMetricDownload, IconMetricFork, IconMetricStar } from "@/components/profile-metric-icons";
import { ProfileSkillsPanel } from "@/components/profile-skills-panel";
import type { PublicUser, SkillListItem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

type ProfileViewProps = {
  user: PublicUser;
  authoredSkills: SkillListItem[];
  starredSkills: SkillListItem[];
  isOwnProfile: boolean;
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
  totalStars,
  totalForks,
  totalDownloads,
}: ProfileViewProps) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1056px] flex-1 flex-col">
      <section className="flex flex-col items-center text-center">
        <div className="relative mb-6 size-[100px]">
          <ProfileAvatar avatarUrl={user.avatarUrl} displayName={user.displayName} userId={user.id} />
          <span className="absolute left-[89px] top-[-8px] rotate-[-23.45deg] text-xs font-semibold text-black/20">
            #1
          </span>
        </div>

        <div className="flex max-w-[218px] flex-col items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-[24px] font-semibold leading-none text-[#242424]">{user.displayName}</h1>
            <p className="text-[16px] font-medium leading-none text-[#242424]/50 underline decoration-dotted underline-offset-4">
              @{user.username}
            </p>
          </div>

          <p className="text-[16px] font-medium leading-[1.15] text-[#242424] opacity-80">
            {user.bio ?? "Hi am the creator of what your looking at right now"}
          </p>

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
