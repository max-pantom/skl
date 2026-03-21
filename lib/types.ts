export const launchCategories = [
  "coding",
  "design",
  "writing",
  "research",
  "automation",
  "marketing",
] as const;

export type SkillCategory = (typeof launchCategories)[number];

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
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

export type AppViewer = PublicUser & {
  email: string | null;
};
