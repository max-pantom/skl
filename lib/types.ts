export const launchCategories = [
  "coding",
  "design",
  "writing",
  "research",
  "automation",
  "marketing",
] as const;

export const modelCompatibilitySuggestions = [
  "GPT-5",
  "GPT-5 mini",
  "GPT-5 nano",
  "GPT-4.1",
  "GPT-4.1 mini",
  "GPT-4o",
  "GPT-4o mini",
  "o3",
  "o4-mini",
  "Claude Opus 4",
  "Claude Sonnet 4",
  "Claude 3.7 Sonnet",
  "Claude 3.5 Sonnet",
  "Claude 3.5 Haiku",
  "Gemini 2.5 Pro",
  "Gemini 2.5 Flash",
  "Gemini 2.0 Flash",
  "Gemini 1.5 Pro",
  "Gemini 1.5 Flash",
  "Grok 3",
  "Grok 3 Mini",
  "DeepSeek V3",
  "DeepSeek R1",
  "Llama 4 Maverick",
  "Llama 4 Scout",
  "Llama 3.3 70B",
  "Llama 3.1 405B",
  "Llama 3.1 70B",
  "Mistral Large",
  "Codestral",
  "Command R+",
  "Qwen 2.5 72B",
  "Qwen 2.5 Coder 32B",
  "Perplexity Sonar",
  "Perplexity Sonar Pro",
] as const;

export type SkillCategory = (typeof launchCategories)[number];
export type UserRole = "user" | "pro" | "admin";
export type CommunityPostKind = "feature" | "report" | "feedback";

export type SkillVersionFileRecord = {
  id: string;
  skillVersionId: string;
  path: string;
  content: string;
  sortOrder: number;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  xUrl: string | null;
  createdAt: string;
};

export type SkillVersionRecord = {
  id: string;
  skillId: string;
  version: string;
  content: string;
  files: SkillVersionFileRecord[];
  changelog: string | null;
  compatibleWith: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ForkReference = {
  slug: string;
  title: string;
  visibility: "public" | "unlisted";
  author: {
    username: string;
    displayName: string;
  };
} | null;

export type SkillListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: SkillCategory;
  tags: string[];
  visibility: "public" | "unlisted";
  starsCount: number;
  downloadsCount: number;
  forksCount: number;
  createdAt: string;
  updatedAt: string;
  author: PublicUser;
  currentVersion: SkillVersionRecord;
  forkedFrom: ForkReference;
};

export type SkillDetail = SkillListItem & {
  versions: SkillVersionRecord[];
};

export type ExploreFilters = {
  query?: string;
  category?: SkillCategory | "all";
};

export type ProfileData = {
  user: PublicUser;
  skills: SkillListItem[];
};

/** Aggregated for discovery (e.g. home “Top creators”). */
export type TopCreator = {
  user: PublicUser;
  skillCount: number;
  totalStars: number;
};

export type PublicUserListItem = {
  user: PublicUser;
  skillCount: number;
  totalStars: number;
  totalForks: number;
  totalDownloads: number;
  updatedAt: string | null;
};

export type AppViewer = PublicUser & {
  email: string | null;
  emailVerified: boolean;
  needsProfileSetup: boolean;
};

/** Newest accounts (by signup) for claim / passport avatar cluster UI. */
export type RecentPassportClaimant = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
};

export type CommunityReply = {
  id: string;
  body: string;
  createdAt: string;
  upvotesCount: number;
  author: PublicUser;
};

export type CommunityPost = {
  id: string;
  kind: CommunityPostKind;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  upvotesCount: number;
  viewerHasUpvoted: boolean;
  author: PublicUser;
  replies: CommunityReply[];
};
