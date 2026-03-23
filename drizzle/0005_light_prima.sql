ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "users" SET "email_verified_at" = "updated_at" WHERE "email_verified" = true AND "email_verified_at" IS NULL;
