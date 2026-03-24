import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const skillCategoryEnum = pgEnum("skill_category", [
  "coding",
  "design",
  "writing",
  "research",
  "automation",
  "marketing",
]);

export const skillVisibilityEnum = pgEnum("skill_visibility", ["public", "unlisted"]);
export const userRoleEnum = pgEnum("user_role", ["user", "pro", "admin"]);
export const userEmailEventKindEnum = pgEnum("user_email_event_kind", ["profile_welcome", "resend_audience_sync"]);
export const communityPostKindEnum = pgEnum("community_post_kind", ["feature", "report", "feedback"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    /** Set when email is first verified (passport claimed); used for “recent claimants” ordering. */
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    username: varchar("username", { length: 32 }).notNull(),
    displayName: varchar("display_name", { length: 64 }).notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    needsProfileSetup: boolean("needs_profile_setup").notNull().default(false),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    website: text("website"),
    xUrl: text("x_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(table.username),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    providerAccountIdx: uniqueIndex("accounts_provider_account_idx").on(table.providerId, table.accountId),
  }),
);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    identifierIdx: index("verifications_identifier_idx").on(table.identifier),
  }),
);

export const userEmailEvents = pgTable(
  "user_email_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: userEmailEventKindEnum("kind").notNull(),
    externalId: text("external_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userKindIdx: uniqueIndex("user_email_events_user_kind_idx").on(table.userId, table.kind),
    kindLookupIdx: index("user_email_events_kind_idx").on(table.kind),
  }),
);

export const cliAuthRequests = pgTable(
  "cli_auth_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deviceCode: varchar("device_code", { length: 96 }).notNull(),
    userCode: varchar("user_code", { length: 32 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    cliSessionId: uuid("cli_session_id"),
    cliToken: text("cli_token"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    exchangedAt: timestamp("exchanged_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    deviceCodeIdx: uniqueIndex("cli_auth_requests_device_code_idx").on(table.deviceCode),
    userCodeIdx: uniqueIndex("cli_auth_requests_user_code_idx").on(table.userCode),
    userIdx: index("cli_auth_requests_user_idx").on(table.userId),
  }),
);

export const cliSessions = pgTable(
  "cli_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenHashIdx: uniqueIndex("cli_sessions_token_hash_idx").on(table.tokenHash),
    userIdx: index("cli_sessions_user_idx").on(table.userId),
  }),
);

export const communityPosts = pgTable(
  "community_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentPostId: uuid("parent_post_id").references((): AnyPgColumn => communityPosts.id, {
      onDelete: "cascade",
    }),
    kind: communityPostKindEnum("kind").notNull().default("feature"),
    title: varchar("title", { length: 160 }),
    body: text("body").notNull(),
    upvotesCount: integer("upvotes_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    authorIdx: index("community_posts_author_idx").on(table.authorId),
    parentIdx: index("community_posts_parent_idx").on(table.parentPostId),
    updatedIdx: index("community_posts_updated_idx").on(table.updatedAt),
  }),
);

export const communityVotes = pgTable(
  "community_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    postIdx: index("community_votes_post_idx").on(table.postId),
    userPostIdx: uniqueIndex("community_votes_user_post_idx").on(table.userId, table.postId),
  }),
);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    summary: text("summary").notNull(),
    category: skillCategoryEnum("category").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    visibility: skillVisibilityEnum("visibility").notNull().default("public"),
    currentVersionId: uuid("current_version_id"),
    starsCount: integer("stars_count").notNull().default(0),
    downloadsCount: integer("downloads_count").notNull().default(0),
    forksCount: integer("forks_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("skills_slug_idx").on(table.slug),
    authorIdx: index("skills_author_idx").on(table.authorId),
    categoryIdx: index("skills_category_idx").on(table.category),
  }),
);

export const skillVersions = pgTable(
  "skill_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    version: varchar("version", { length: 32 }).notNull(),
    content: text("content").notNull(),
    changelog: text("changelog"),
    compatibleWith: jsonb("compatible_with").$type<string[]>().notNull().default([]),
    inputSchema: jsonb("input_schema").$type<Record<string, unknown>>().notNull().default({}),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    skillVersionIdx: uniqueIndex("skill_versions_skill_version_idx").on(table.skillId, table.version),
    skillLookupIdx: index("skill_versions_skill_lookup_idx").on(table.skillId),
  }),
);

export const skillVersionFiles = pgTable(
  "skill_version_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillVersionId: uuid("skill_version_id")
      .notNull()
      .references(() => skillVersions.id, { onDelete: "cascade" }),
    path: varchar("path", { length: 255 }).notNull(),
    content: text("content").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    versionPathIdx: uniqueIndex("skill_version_files_version_path_idx").on(table.skillVersionId, table.path),
    versionLookupIdx: index("skill_version_files_version_lookup_idx").on(table.skillVersionId),
  }),
);

export const stars = pgTable(
  "stars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userSkillIdx: uniqueIndex("stars_user_skill_idx").on(table.userId, table.skillId),
    skillIdx: index("stars_skill_idx").on(table.skillId),
  }),
);

export const downloads = pgTable(
  "downloads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    skillIdx: index("downloads_skill_idx").on(table.skillId),
    userIdx: index("downloads_user_idx").on(table.userId),
  }),
);

export const forks = pgTable(
  "forks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentSkillId: uuid("parent_skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    childSkillId: uuid("child_skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    childIdx: uniqueIndex("forks_child_skill_idx").on(table.childSkillId),
    parentIdx: index("forks_parent_skill_idx").on(table.parentSkillId),
    userIdx: index("forks_user_idx").on(table.userId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  emailEvents: many(userEmailEvents),
  cliAuthRequests: many(cliAuthRequests),
  cliSessions: many(cliSessions),
  communityPosts: many(communityPosts),
  communityVotes: many(communityVotes),
  skills: many(skills),
  stars: many(stars),
  downloads: many(downloads),
  forks: many(forks),
}));

export const userEmailEventsRelations = relations(userEmailEvents, ({ one }) => ({
  user: one(users, {
    fields: [userEmailEvents.userId],
    references: [users.id],
  }),
}));

export const cliAuthRequestsRelations = relations(cliAuthRequests, ({ one }) => ({
  user: one(users, {
    fields: [cliAuthRequests.userId],
    references: [users.id],
  }),
  cliSession: one(cliSessions, {
    fields: [cliAuthRequests.cliSessionId],
    references: [cliSessions.id],
  }),
}));

export const cliSessionsRelations = relations(cliSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [cliSessions.userId],
    references: [users.id],
  }),
  authRequests: many(cliAuthRequests),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [communityPosts.authorId],
    references: [users.id],
  }),
  parent: one(communityPosts, {
    relationName: "community_post_replies",
    fields: [communityPosts.parentPostId],
    references: [communityPosts.id],
  }),
  replies: many(communityPosts, {
    relationName: "community_post_replies",
  }),
  votes: many(communityVotes),
}));

export const communityVotesRelations = relations(communityVotes, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityVotes.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [communityVotes.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  author: one(users, {
    fields: [skills.authorId],
    references: [users.id],
  }),
  currentVersion: one(skillVersions, {
    fields: [skills.currentVersionId],
    references: [skillVersions.id],
  }),
  versions: many(skillVersions),
  stars: many(stars),
  downloads: many(downloads),
  parentFork: one(forks, {
    fields: [skills.id],
    references: [forks.childSkillId],
  }),
}));

export const skillVersionsRelations = relations(skillVersions, ({ one, many }) => ({
  skill: one(skills, {
    fields: [skillVersions.skillId],
    references: [skills.id],
  }),
  files: many(skillVersionFiles),
}));

export const skillVersionFilesRelations = relations(skillVersionFiles, ({ one }) => ({
  skillVersion: one(skillVersions, {
    fields: [skillVersionFiles.skillVersionId],
    references: [skillVersions.id],
  }),
}));

export const starsRelations = relations(stars, ({ one }) => ({
  user: one(users, {
    fields: [stars.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [stars.skillId],
    references: [skills.id],
  }),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  user: one(users, {
    fields: [downloads.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [downloads.skillId],
    references: [skills.id],
  }),
}));

export const forksRelations = relations(forks, ({ one }) => ({
  parentSkill: one(skills, {
    fields: [forks.parentSkillId],
    references: [skills.id],
  }),
  childSkill: one(skills, {
    fields: [forks.childSkillId],
    references: [skills.id],
  }),
  user: one(users, {
    fields: [forks.userId],
    references: [users.id],
  }),
}));
