import type { Metadata } from "next";

import { ProfileAvatarParallaxExperiment } from "@/components/profile-avatar-parallax-experiment";

export const metadata: Metadata = {
  title: "Avatar parallax experiment",
};

/** 3D tilt + inset hover on `ProfileAvatar` — tune and copy JSON before shipping site-wide. */
export default function Test2Page() {
  return (
    <div className="min-h-screen bg-white py-6 text-[#242424]">
      <ProfileAvatarParallaxExperiment />
    </div>
  );
}
