import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PlaceholderPanel } from "@/components/placeholder-panel";
import { SectionHeading } from "@/components/section-heading";
import { SkillCard } from "@/components/skill-card";
import { getCurrentViewer } from "@/lib/auth";
import { getProfileByUsername } from "@/lib/data";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-10">
      <section className="skl-surface p-8 sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Profile</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {profile.user.displayName}
              </h1>
              <p className="text-sm text-zinc-500">@{profile.user.username}</p>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-zinc-600">
              {profile.user.bio ?? "No bio added yet."}
            </p>
            {isOwnProfile ? (
              <Link href="/settings" className="skl-btn skl-btn-secondary inline-flex text-sm">
                Edit profile
              </Link>
            ) : null}
          </div>

          <div className="skl-surface grid gap-4 p-5 text-sm text-zinc-600 sm:grid-cols-3 lg:grid-cols-1 lg:min-w-[220px]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Skills</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{profile.skills.length}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Joined</p>
              <p className="mt-2 text-lg font-semibold text-ink">{formatDate(profile.user.createdAt)}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Website</p>
              <p className="mt-2 truncate text-lg font-semibold text-ink">
                {profile.user.website ? "Linked" : "None"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Published"
          title={`${profile.user.displayName}'s skills`}
          description="Authorship is first-class, so profile pages stay focused on identity and shipped work."
        />
        {profile.skills.length ? (
          <div className="grid gap-5">
            {profile.skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
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
