CREATE TYPE "community_post_kind" AS ENUM ('feature', 'report', 'feedback');

CREATE TABLE "community_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "author_id" uuid NOT NULL,
  "parent_post_id" uuid,
  "kind" "community_post_kind" DEFAULT 'feature' NOT NULL,
  "title" varchar(160),
  "body" text NOT NULL,
  "upvotes_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "community_votes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "community_posts"
  ADD CONSTRAINT "community_posts_author_id_users_id_fk"
  FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "community_posts"
  ADD CONSTRAINT "community_posts_parent_post_id_community_posts_id_fk"
  FOREIGN KEY ("parent_post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "community_votes"
  ADD CONSTRAINT "community_votes_post_id_community_posts_id_fk"
  FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "community_votes"
  ADD CONSTRAINT "community_votes_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "community_posts_author_idx" ON "community_posts" USING btree ("author_id");
CREATE INDEX "community_posts_parent_idx" ON "community_posts" USING btree ("parent_post_id");
CREATE INDEX "community_posts_updated_idx" ON "community_posts" USING btree ("updated_at");
CREATE INDEX "community_votes_post_idx" ON "community_votes" USING btree ("post_id");
CREATE UNIQUE INDEX "community_votes_user_post_idx" ON "community_votes" USING btree ("user_id", "post_id");
