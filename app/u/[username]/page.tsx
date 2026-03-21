import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  const viewer = await getCurrentViewer();
  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-line bg-panel p-8 shadow-card sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Profile</p>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-ink">{profile.user.displayName}</h1>
              <p className="text-sm text-slate-500">@{profile.user.username}</p>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              {profile.user.bio ?? "No bio added yet."}
            </p>
            {viewer?.username === profile.user.username ? (
              <Link
                href="/settings"
                className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
              >
                Edit profile
              </Link>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-[1.5rem] border border-stone-300 bg-white p-5 text-sm text-slate-600 sm:grid-cols-3 lg:grid-cols-1">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Skills</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{profile.skills.length}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Joined</p>
              <p className="mt-2 text-lg font-semibold text-ink">{formatDate(profile.user.createdAt)}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Website</p>
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
        <div className="grid gap-5">
          {profile.skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>
    </div>
  );
}
