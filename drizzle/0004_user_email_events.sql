CREATE TYPE "user_email_event_kind" AS ENUM ('profile_welcome', 'resend_audience_sync');

CREATE TABLE "user_email_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "kind" "user_email_event_kind" NOT NULL,
  "external_id" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "sent_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "user_email_events"
ADD CONSTRAINT "user_email_events_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE UNIQUE INDEX "user_email_events_user_kind_idx" ON "user_email_events" USING btree ("user_id","kind");
CREATE INDEX "user_email_events_kind_idx" ON "user_email_events" USING btree ("kind");
