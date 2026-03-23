export const launchCategories = [
  "coding",
  "design",
  "writing",
  "research",
  "automation",
  "marketing",
] as const;

export type SkillCategory = (typeof launchCategories)[number];
export type UserRole = "user" | "pro" | "admin";

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

/** Recent email-verified users for claim / passport “passport cluster” UI. */
export type RecentPassportClaimant = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
};
