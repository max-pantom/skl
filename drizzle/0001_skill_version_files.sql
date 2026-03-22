CREATE TABLE "skill_version_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_version_id" uuid NOT NULL,
	"path" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skill_version_files" ADD CONSTRAINT "skill_version_files_skill_version_id_skill_versions_id_fk" FOREIGN KEY ("skill_version_id") REFERENCES "public"."skill_versions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "skill_version_files_version_path_idx" ON "skill_version_files" USING btree ("skill_version_id","path");
--> statement-breakpoint
CREATE INDEX "skill_version_files_version_lookup_idx" ON "skill_version_files" USING btree ("skill_version_id");
--> statement-breakpoint
INSERT INTO "skill_version_files" ("skill_version_id", "path", "content", "sort_order", "created_at")
SELECT "id", 'SKILL.md', "content", 0, "created_at"
FROM "skill_versions"
ON CONFLICT ("skill_version_id", "path") DO NOTHING;
