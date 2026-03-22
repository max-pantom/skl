import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileAvatar } from "@/components/profile-avatar";
import { IconMetricDownload, IconMetricFork, IconMetricStar } from "@/components/profile-metric-icons";
import { ProfileSkillsPanel } from "@/components/profile-skills-panel";
import { getCurrentViewer } from "@/lib/auth";
import { getProfileByUsername, getStarredSkillsForUser } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    return {
      title: "Profile not found",
    };
  }

  return {
    title: `@${profile.user.username}`,
    description: profile.user.bio ?? `${profile.user.displayName} on SKL`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [profile, viewer] = await Promise.all([getProfileByUsername(username), getCurrentViewer()]);

  if (!profile) {
    notFound();
  }

  const starredSkills = await getStarredSkillsForUser(profile.user.id);
  const isOwnProfile = viewer?.id === profile.user.id;

  const totalStars = profile.skills.reduce((sum, skill) => sum + skill.starsCount, 0);
  const totalForks = profile.skills.reduce((sum, skill) => sum + skill.forksCount, 0);
  const totalDownloads = profile.skills.reduce((sum, skill) => sum + skill.downloadsCount, 0);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1056px] flex-1 flex-col">
      <section className="flex flex-col items-center text-center">
        <div className="relative mb-6 size-[100px]">
          <ProfileAvatar
            avatarUrl={profile.user.avatarUrl}
            displayName={profile.user.displayName}
            userId={profile.user.id}
          />
          <span className="absolute left-[89px] top-[-8px] rotate-[-23.45deg] text-xs font-semibold text-black/20">
            #1
          </span>
        </div>

        <div className="flex max-w-[218px] flex-col items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-[24px] font-semibold leading-none text-[#242424]">
              {profile.user.displayName}
            </h1>
            <p className="text-[16px] font-medium leading-none text-[#242424]/50 underline decoration-dotted underline-offset-4">
              @{profile.user.username}
            </p>
          </div>

          <p className="text-[16px] font-medium leading-[1.15] text-[#242424] opacity-80">
            {profile.user.bio ?? "Hi am the creator of what your looking at right now"}
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

          {profile.user.website ? (
            <a
              href={profile.user.website}
              target="_blank"
              rel="noreferrer"
              className="text-base text-[#919191] underline decoration-dotted underline-offset-4"
            >
              {profile.user.website.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
        </div>
      </section>

      <section className="mt-[90px] flex min-h-0 flex-1 flex-col">
        <ProfileSkillsPanel
          authoredSkills={profile.skills}
          starredSkills={starredSkills}
          isOwnProfile={isOwnProfile}
        />
      </section>
    </div>
  );
}
