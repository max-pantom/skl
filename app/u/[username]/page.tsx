import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileSkillRow } from "@/components/profile-skill-row";
import { getProfileByUsername } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

const heroImage = "https://www.figma.com/api/mcp/asset/982ad128-a746-4a1e-aa1d-581c123d53e2";
const starsIcon = "https://www.figma.com/api/mcp/asset/2ffa58f1-6a0f-4916-be5e-6ed23ada98fc";
const forksIcon = "https://www.figma.com/api/mcp/asset/18f338b6-8865-4541-978e-67cfd7b6268a";
const downloadsIcon = "https://www.figma.com/api/mcp/asset/1682e85e-ad8d-448d-a80a-7ca919d6e151";
const linkIcon = "https://www.figma.com/api/mcp/asset/0b52e0d1-621b-4ac4-99af-312d39b6cc40";

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
  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const totalStars = profile.skills.reduce((sum, skill) => sum + skill.starsCount, 0);
  const totalForks = profile.skills.reduce((sum, skill) => sum + skill.forksCount, 0);
  const totalDownloads = profile.skills.reduce((sum, skill) => sum + skill.downloadsCount, 0);

  return (
    <div className="mx-auto max-w-[1056px] pb-[92px]">
      <section className="flex flex-col items-center text-center">
        <div className="relative mb-6 size-[100px]">
          <img
            src={profile.user.avatarUrl || heroImage}
            alt={profile.user.displayName}
            className="size-[100px] rounded-full object-cover"
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

          <p className="text-[16px] leading-[1.15] text-[#242424]">
            {profile.user.bio ?? "Hi am the creator of what your looking at right now"}
          </p>

          <div className="flex w-full items-center justify-center gap-6 text-[16px] text-[rgba(36,36,36,0.6)]">
            <div className="flex items-center gap-1.5">
              <img src={starsIcon} alt="" className="size-[18px]" />
              <span>{formatNumber(totalStars)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src={forksIcon} alt="" className="size-[18px]" />
              <span>{formatNumber(totalForks)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src={downloadsIcon} alt="" className="size-[18px]" />
              <span>{formatNumber(totalDownloads)}</span>
            </div>
          </div>

          {profile.user.website ? (
            <a
              href={profile.user.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-base text-[#919191] underline decoration-dotted underline-offset-4"
            >
              <img src={linkIcon} alt="" className="size-[18px]" />
              <span>{profile.user.website.replace(/^https?:\/\//, "")}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 text-base text-[#919191] underline decoration-dotted underline-offset-4">
              <img src={linkIcon} alt="" className="size-[18px]" />
              <span>{profile.user.username}.design</span>
            </div>
          )}
        </div>
      </section>

      <section className="mt-[90px]">
        <div className="flex flex-col gap-4">
          <div className="h-px w-full bg-[#e7e7e7]" />
          {profile.skills.map((skill) => (
            <div key={skill.id} className="contents">
              <ProfileSkillRow skill={skill} />
              <div className="h-px w-full bg-[#e7e7e7]" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[148px] flex items-center justify-center gap-9 text-[16px] uppercase">
        <span className="font-medium text-black">All skill</span>
        <span className="font-medium text-[#8f8f8f]">Stared</span>
      </section>
    </div>
  );
}
