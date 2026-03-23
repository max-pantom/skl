import type { Metadata } from "next";

import { ClaimCardStudioPlayground } from "@/components/claim-card-studio-playground";

export const metadata: Metadata = {
  title: "Member card playground",
};

export default function Test3Page() {
  return (
    <div className="page-shell gap-6 py-8">
      <ClaimCardStudioPlayground />
    </div>
  );
}
