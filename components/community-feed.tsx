import Link from "next/link";

import { ProfileAvatar } from "@/components/profile-avatar";
import { createCommunityPostAction, replyCommunityPostAction, toggleCommunityVoteAction } from "@/lib/actions";
import type { AppViewer, CommunityPost } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

function kindLabel(kind: CommunityPost["kind"]) {
  if (kind === "report") return "Report";
  if (kind === "feedback") return "Feedback";
  return "Feature";
}

function kindClass(kind: CommunityPost["kind"]) {
  if (kind === "report") return "bg-[rgba(255,236,236,0.9)] text-[#8b3a3a]";
  if (kind === "feedback") return "bg-[rgba(228,228,228,0.8)] text-[#6f6f6f]";
  return "bg-[rgba(228,228,228,0.8)] text-[#242424]";
}

function modBadge(role: CommunityPost["author"]["role"]) {
  if (role !== "admin") return null;
  return (
    <span className="inline-flex rounded-[90px] bg-[#242424] px-[6px] py-[2px] text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-white">
      MOD
    </span>
  );
}

export function CommunityFeed({
  posts,
  viewer,
}: {
  posts: CommunityPost[];
  viewer: AppViewer | null;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-10">
      <section className="border-t border-zinc-200 pt-8">
        {viewer ? (
          <form action={createCommunityPostAction} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="profile-field-row">
                <label className="profile-field-label" htmlFor="community-kind">
                  Type
                </label>
                <div className="skl-select-shell">
                  <select id="community-kind" name="kind" className="skl-select" defaultValue="feature">
                    <option value="feature">feature</option>
                    <option value="report">report</option>
                    <option value="feedback">feedback</option>
                  </select>
                  <svg viewBox="0 0 16 16" aria-hidden className="skl-select-icon">
                    <path d="M4 6.5 8 10.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <label className="profile-field-row block">
                <span className="profile-field-label">Title</span>
                <input name="title" className="skl-input" placeholder="Let us sort skill updates by most downloaded too" />
              </label>
            </div>

            <label className="profile-field-row block">
              <span className="profile-field-label">Post</span>
              <textarea
                name="body"
                rows={6}
                className="skl-input"
                placeholder="Describe the feature, bug, or feedback. Other people will see it and can upvote it."
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="skl-btn skl-btn-secondary">
                Post to community
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-[24px] border border-zinc-200 bg-[linear-gradient(145deg,#ffffff,rgba(244,244,240,0.98))] px-5 py-5">
            <p className="text-[16px] font-semibold text-[#242424]">Join the discussion</p>
            <p className="mt-2 text-[16px] font-medium text-[#8f8f8f]">
              Sign in to request features, report issues, reply, and upvote.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/login?next=%2Fcommunity" className="skl-btn skl-btn-secondary">
                Log in
              </Link>
              <Link href="/signup" className="skl-btn skl-btn-secondary">
                Create account
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-zinc-200 pt-8">
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article key={post.id} className="rounded-[28px] border border-zinc-200 bg-white px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <ProfileAvatar
                    avatarUrl={post.author.avatarUrl}
                    displayName={post.author.displayName}
                    userId={post.author.id}
                    role={post.author.role}
                    size={42}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[16px] font-semibold text-[#242424]">{post.author.displayName}</p>
                      {modBadge(post.author.role)}
                      <span className={cn("inline-flex rounded-[90px] px-[6px] py-[2px] text-[11px] font-semibold uppercase leading-none tracking-[0.14em]", kindClass(post.kind))}>
                        {kindLabel(post.kind)}
                      </span>
                    </div>
                    <p className="mt-1 text-[14px] font-medium text-[#8f8f8f]">
                      @{post.author.username} · {formatDate(post.updatedAt)}
                    </p>
                  </div>
                </div>

                <form action={toggleCommunityVoteAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    className={cn(
                      "inline-flex h-9 items-center justify-center rounded-[18px] px-3 text-[14px] font-medium transition",
                      post.viewerHasUpvoted
                        ? "bg-[#242424] text-white"
                        : "bg-[rgba(228,228,228,0.8)] text-[#6f6f6f] hover:bg-[rgba(228,228,228,0.95)] hover:text-[#242424]",
                    )}
                  >
                    ↑ {post.upvotesCount}
                  </button>
                </form>
              </div>

              <div className="mt-5 space-y-3">
                <h2 className="text-[20px] font-semibold leading-tight text-[#242424]">{post.title}</h2>
                <p className="whitespace-pre-wrap text-[16px] font-medium leading-[1.45] text-[#242424]/85">{post.body}</p>
              </div>

              <div className="mt-6 space-y-4 border-t border-zinc-200 pt-5">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#8f8f8f]">
                  Replies {post.replies.length ? `(${post.replies.length})` : ""}
                </p>

                {post.replies.length ? (
                  <div className="space-y-4">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="rounded-[20px] bg-[rgba(244,244,240,0.72)] px-4 py-4">
                        <div className="flex items-start gap-3">
                          <ProfileAvatar
                            avatarUrl={reply.author.avatarUrl}
                            displayName={reply.author.displayName}
                            userId={reply.author.id}
                            role={reply.author.role}
                            size={34}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[15px] font-semibold text-[#242424]">{reply.author.displayName}</p>
                              {modBadge(reply.author.role)}
                              <span className="text-[13px] font-medium text-[#8f8f8f]">
                                @{reply.author.username} · {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-[15px] font-medium leading-[1.45] text-[#242424]/85">
                              {reply.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[15px] font-medium text-[#8f8f8f]">No replies yet.</p>
                )}

                {viewer ? (
                  <form action={replyCommunityPostAction} className="space-y-4 border-t border-zinc-200 pt-4">
                    <input type="hidden" name="parentPostId" value={post.id} />
                    <textarea
                      name="body"
                      rows={3}
                      className="skl-input"
                      placeholder={post.author.role === "admin" ? "Reply to this thread" : "Add your reply"}
                    />
                    <button type="submit" className="skl-btn skl-btn-secondary">
                      Reply
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          ))}

          {posts.length === 0 ? (
            <div className="py-12 text-center text-[16px] font-medium text-[#8f8f8f]">
              No community posts yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
