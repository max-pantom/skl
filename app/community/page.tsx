import type { Metadata } from "next";

import { CommunityFeed } from "@/components/community-feed";
import { FormNotice } from "@/components/form-notice";
import { PageIntro } from "@/components/page-intro";
import { getCurrentViewer } from "@/lib/auth";
import { getCommunityFeed } from "@/lib/data";

export const metadata: Metadata = {
  title: "Community",
};

type CommunityPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const [viewer, query] = await Promise.all([getCurrentViewer(), searchParams]);
  const posts = await getCommunityFeed(viewer?.id);

  return (
    <div className="page-shell gap-8">
      <PageIntro
        align="left"
        eyebrow="Community"
        title="Community feed"
        description="Request features, report issues, reply to threads, and push ideas upward with upvotes."
      />

      {query.error ? <FormNotice tone="error">{query.error}</FormNotice> : null}
      {query.message ? <FormNotice tone="success">{query.message}</FormNotice> : null}

      <CommunityFeed posts={posts} viewer={viewer} />
    </div>
  );
}
