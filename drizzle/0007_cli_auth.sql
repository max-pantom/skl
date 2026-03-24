CREATE TABLE "cli_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "token_hash" text NOT NULL,
  "last_used_at" timestamp with time zone,
  "revoked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cli_auth_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "device_code" varchar(96) NOT NULL,
  "user_code" varchar(32) NOT NULL,
  "user_id" uuid,
  "cli_session_id" uuid,
  "cli_token" text,
  "approved_at" timestamp with time zone,
  "rejected_at" timestamp with time zone,
  "exchanged_at" timestamp with time zone,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "cli_sessions"
  ADD CONSTRAINT "cli_sessions_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "cli_auth_requests"
  ADD CONSTRAINT "cli_auth_requests_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

CREATE UNIQUE INDEX "cli_sessions_token_hash_idx" ON "cli_sessions" USING btree ("token_hash");
CREATE INDEX "cli_sessions_user_idx" ON "cli_sessions" USING btree ("user_id");
CREATE UNIQUE INDEX "cli_auth_requests_device_code_idx" ON "cli_auth_requests" USING btree ("device_code");
CREATE UNIQUE INDEX "cli_auth_requests_user_code_idx" ON "cli_auth_requests" USING btree ("user_code");
CREATE INDEX "cli_auth_requests_user_idx" ON "cli_auth_requests" USING btree ("user_id");
