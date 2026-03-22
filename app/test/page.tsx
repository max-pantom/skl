import type { Metadata } from "next";

import { ProfileView } from "@/components/profile-view";
import {
  PROFILE_PREVIEW_AUTHORED,
  PROFILE_PREVIEW_STARRED,
  PROFILE_PREVIEW_TOTAL_DOWNLOADS,
  PROFILE_PREVIEW_TOTAL_FORKS,
  PROFILE_PREVIEW_TOTAL_STARS,
  PROFILE_PREVIEW_USER,
} from "@/lib/profile-preview-data";

export const metadata: Metadata = {
  title: "Studio",
};

/**
 * Profile UI preview — same `ProfileView` as `/u/[username]` with mock data.
 * Iterating here updates production layout; no auth or DB required.
 */
export default function StudioTestPage() {
  return (
    <ProfileView
      user={PROFILE_PREVIEW_USER}
      authoredSkills={PROFILE_PREVIEW_AUTHORED}
      starredSkills={PROFILE_PREVIEW_STARRED}
      isOwnProfile
      totalStars={PROFILE_PREVIEW_TOTAL_STARS}
      totalForks={PROFILE_PREVIEW_TOTAL_FORKS}
      totalDownloads={PROFILE_PREVIEW_TOTAL_DOWNLOADS}
    />
  );
}
