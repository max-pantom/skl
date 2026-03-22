import type { PublicUser, SkillCategory, SkillListItem, SkillVersionRecord } from "@/lib/types";

const iso = "2025-01-01T00:00:00.000Z";

/** Stable “Max” user — matches Studio Figma mock; use on `/test` only. */
export const PROFILE_PREVIEW_USER: PublicUser = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  username: "m",
  displayName: "Max",
  role: "admin",
  bio: null,
  avatarUrl: null,
  website: "https://pantom.design",
  xUrl: null,
  createdAt: iso,
};

function versionFor(skillId: string, ver: string): SkillVersionRecord {
  return {
    id: `${skillId}-cv`,
    skillId,
    version: ver.replace(/^v/, ""),
    content: "# Preview skill\n\nDemo content.",
    files: [
      {
        id: `${skillId}-file`,
        skillVersionId: `${skillId}-cv`,
        path: "SKILL.md",
        content: "# Preview skill\n\nDemo content.",
        sortOrder: 0,
        createdAt: iso,
      },
    ],
    changelog: null,
    compatibleWith: [],
    metadata: {},
    createdAt: iso,
  };
}

function statToDownloads(s: string): number {
  const n = parseFloat(s.replace(/k$/i, "")) * (s.toLowerCase().endsWith("k") ? 1000 : 1);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

type RowDef = {
  title: string;
  slug: string;
  summary: string;
  category: SkillCategory;
  downloadsLabel: string;
  version: string;
};

const ROWS: RowDef[] = [
  {
    title: "Web-Motion",
    slug: "web-motion",
    summary: "Writes high-converting SaaS landing pages with structured sections",
    category: "design",
    downloadsLabel: "8k",
    version: "1.2.0",
  },
  {
    title: "App-Engage",
    slug: "app-engage",
    summary: "Creates engaging mobile app onboarding experiences that retain users",
    category: "design",
    downloadsLabel: "10k",
    version: "1.0.5",
  },
  {
    title: "Email-Boost",
    slug: "email-boost",
    summary: "Crafts compelling email campaigns that drive user interaction and conversions",
    category: "marketing",
    downloadsLabel: "5k",
    version: "2.3.1",
  },
  {
    title: "Social-Spark",
    slug: "social-spark",
    summary: "Develops viral social media content strategies that increase brand visibility",
    category: "marketing",
    downloadsLabel: "15k",
    version: "3.0.0",
  },
  {
    title: "SEO-Optimizer",
    slug: "seo-optimizer",
    summary: "Enhances website content for improved search engine rankings and traffic",
    category: "design",
    downloadsLabel: "12k",
    version: "1.1.7",
  },
  {
    title: "UX-Flow",
    slug: "ux-flow",
    summary: "Designs intuitive user flows that enhance overall product usability and satisfaction",
    category: "design",
    downloadsLabel: "20k",
    version: "4.2.3",
  },
];

const SKILL_IDS = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
  "10000000-0000-4000-8000-000000000004",
  "10000000-0000-4000-8000-000000000005",
  "10000000-0000-4000-8000-000000000006",
] as const;

/** Figma-style header stats (not necessarily sums of row mock data). */
export const PROFILE_PREVIEW_TOTAL_STARS = 289;
export const PROFILE_PREVIEW_TOTAL_FORKS = 4;
export const PROFILE_PREVIEW_TOTAL_DOWNLOADS = 16900;

/** Mock authored skills for `/test` — same shape as `getProfileByUsername`. */
export const PROFILE_PREVIEW_AUTHORED: SkillListItem[] = ROWS.map((row, i) => {
  const id = SKILL_IDS[i] ?? SKILL_IDS[0];
  const downloads = statToDownloads(row.downloadsLabel);
  return {
    id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    category: row.category,
    tags: [],
    visibility: "public",
    starsCount: 0,
    downloadsCount: downloads,
    forksCount: 0,
    createdAt: iso,
    updatedAt: iso,
    author: PROFILE_PREVIEW_USER,
    currentVersion: versionFor(id, row.version),
    forkedFrom: null,
  };
});

/** Mock starred tab — first two skills (optional preview). */
export const PROFILE_PREVIEW_STARRED: SkillListItem[] = PROFILE_PREVIEW_AUTHORED.slice(0, 2);
