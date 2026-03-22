import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileView } from "@/components/profile-view";
import { getCurrentViewer } from "@/lib/auth";
import { getProfileByUsername, getStarredSkillsForUser } from "@/lib/data";

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
    <ProfileView
      user={profile.user}
      authoredSkills={profile.skills}
      starredSkills={starredSkills}
      isOwnProfile={isOwnProfile}
      totalStars={totalStars}
      totalForks={totalForks}
      totalDownloads={totalDownloads}
    />
  );
}
