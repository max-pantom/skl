import type { Metadata } from "next";

import { ShieldAvatarPlayground } from "@/components/shield-avatar-playground";

export const metadata: Metadata = {
  title: "Studio avatar",
};

/** Figma Studio preset + full shield controls (same UI as `/test/playground`). */
export default function Test2Page() {
  return (
    <div className="min-h-screen bg-white py-6 text-[#242424]">
      <ShieldAvatarPlayground preset="figma-studio" showFigmaProfileFrame />
    </div>
  );
}
