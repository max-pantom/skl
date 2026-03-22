import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileView } from "@/components/profile-view";
import { getCurrentViewer } from "@/lib/auth";
import { getProfileByUsername, getStarredSkillsForUser } from "@/lib/data";

const appBase = () => new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

/** OG/Twitter crawlers require absolute image URLs. */
function absoluteAvatarUrl(avatarUrl: string | null): string | undefined {
  if (!avatarUrl?.trim()) {
    return undefined;
  }

  const trimmed = avatarUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  try {
    return new URL(path, appBase()).href;
  } catch {
    return undefined;
  }
}

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
  const imageUrl = absoluteAvatarUrl(user.avatarUrl);

  return {
    title: `@${user.username}`,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: pageUrl,
      siteName: "SKL",
      type: "website",
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                width: 512,
                height: 512,
                alt: `${user.displayName} — profile photo`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
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
