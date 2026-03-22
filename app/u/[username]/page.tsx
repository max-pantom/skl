import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PlaceholderPanel } from "@/components/placeholder-panel";
import { ProfileSkillRow } from "@/components/profile-skill-row";
import { getCurrentViewer } from "@/lib/auth";
import { getProfileByUsername } from "@/lib/data";
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

  const isOwnProfile = viewer?.username === profile.user.username;
  const totalStars = profile.skills.reduce((sum, skill) => sum + skill.starsCount, 0);
  const totalForks = profile.skills.reduce((sum, skill) => sum + skill.forksCount, 0);
  const totalDownloads = profile.skills.reduce((sum, skill) => sum + skill.downloadsCount, 0);
  const initials = profile.user.displayName
    .split(" ")
    .map((entry) => entry[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-14">
      <section className="mx-auto flex max-w-3xl flex-col items-center pt-6 text-center">
        <div className="relative mb-6">
          {profile.user.avatarUrl ? (
            <img
              src={profile.user.avatarUrl}
              alt={profile.user.displayName}
              className="size-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#ffffff_0%,#f2f2f2_54%,#e8e8e8_100%)] text-2xl font-semibold text-ink shadow-[0_0_0_1px_rgba(24,24,27,0.06)] dark:bg-[radial-gradient(circle_at_top,#27272a_0%,#18181b_54%,#09090b_100%)]">
              {initials}
            </div>
          )}
          <span className="absolute -right-5 top-0 rotate-[-22deg] text-xs text-zinc-400 dark:text-zinc-500">
            #1
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[2rem] font-semibold tracking-tight text-ink">
            {profile.user.displayName}
          </h1>
          <p className="text-sm text-zinc-400 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-500 dark:decoration-zinc-700">
            @{profile.user.username}
          </p>
        </div>

        <p className="mt-5 max-w-sm text-base leading-7 text-zinc-700 dark:text-zinc-300">
          {profile.user.bio ?? "No bio added yet."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>☆ {formatNumber(totalStars)}</span>
          <span>⑂ {formatNumber(totalForks)}</span>
          <span>⇩ {formatNumber(totalDownloads)}</span>
        </div>

        {profile.user.website ? (
          <a
            href={profile.user.website}
            target="_blank"
            rel="noreferrer"
            className="mt-5 text-sm text-zinc-500 underline decoration-dotted underline-offset-4 transition hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {profile.user.website.replace(/^https?:\/\//, "")}
          </a>
        ) : null}

        {isOwnProfile ? (
          <Link
            href="/settings"
            className="mt-6 rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-200 hover:text-ink dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Edit profile
          </Link>
        ) : null}
      </section>

      <section className="mx-auto max-w-5xl space-y-7">
        <div className="flex items-center justify-center gap-8 text-sm uppercase tracking-[0.16em]">
          <span className="text-ink">All skill</span>
          <span className="text-zinc-400 dark:text-zinc-500">Stared</span>
        </div>

        {profile.skills.length ? (
          <div className="space-y-0">
            {profile.skills.map((skill) => (
              <ProfileSkillRow key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <PlaceholderPanel
            title="No published skills"
            description="This profile exists, but nothing has been published under it yet."
          />
        )}
      </section>
    </div>
  );
}
