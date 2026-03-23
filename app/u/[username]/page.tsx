import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileView } from "@/components/profile-view";
import { getCurrentViewer } from "@/lib/auth";
import { getEarlyBelieverRank, getProfileByUsername, getStarredSkillsForUser } from "@/lib/data";
import { publicAppOrigin } from "@/lib/utils";

const appBase = () => publicAppOrigin();

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

  const { user } = profile;
  const ogTitle = `${user.displayName} (@${user.username})`;
  const description = user.bio?.trim() || `${user.displayName} on SKL`;
  const pageUrl = new URL(`/u/${user.username}`, appBase()).href;
  const imageUrl = new URL(`/u/${user.username}/opengraph-image`, appBase()).href;

  return {
    title: `@${user.username}`,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: pageUrl,
      siteName: "SKL",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${user.displayName} (@${user.username}) on SKL`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [profile, viewer] = await Promise.all([getProfileByUsername(username), getCurrentViewer()]);

  if (!profile) {
    notFound();
  }

  const [starredSkills, earlyBelieverRank] = await Promise.all([
    getStarredSkillsForUser(profile.user.id),
    getEarlyBelieverRank(profile.user.id, profile.user.createdAt),
  ]);
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
      earlyBelieverRank={earlyBelieverRank}
      totalStars={totalStars}
      totalForks={totalForks}
      totalDownloads={totalDownloads}
    />
  );
}
