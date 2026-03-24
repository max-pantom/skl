import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { communityPosts, communityVotes } from "@/db/schema";
import { getCurrentViewer } from "@/lib/auth";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  const viewer = await getCurrentViewer();

  if (!viewer || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;
  const post = await db.query.communityPosts.findFirst({
    where: eq(communityPosts.id, postId),
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existingVote = await db.query.communityVotes.findFirst({
    where: and(eq(communityVotes.postId, postId), eq(communityVotes.userId, viewer.id)),
  });

  let viewerHasUpvoted = false;

  if (existingVote) {
    await db.transaction(async (tx) => {
      await tx.delete(communityVotes).where(eq(communityVotes.id, existingVote.id));
      await tx
        .update(communityPosts)
        .set({
          upvotesCount: sql`GREATEST(${communityPosts.upvotesCount} - 1, 0)`,
        })
        .where(eq(communityPosts.id, postId));
    });
  } else {
    await db.transaction(async (tx) => {
      await tx.insert(communityVotes).values({
        postId,
        userId: viewer.id,
      });
      await tx
        .update(communityPosts)
        .set({
          upvotesCount: sql`${communityPosts.upvotesCount} + 1`,
        })
        .where(eq(communityPosts.id, postId));
    });
    viewerHasUpvoted = true;
  }

  const updatedPost = await db.query.communityPosts.findFirst({
    where: eq(communityPosts.id, postId),
  });

  revalidatePath("/community");

  return NextResponse.json({
    ok: true,
    upvotesCount: updatedPost?.upvotesCount ?? 0,
    viewerHasUpvoted,
  });
}
