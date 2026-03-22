"use client";

import Link from "next/link";
import { Fragment } from "react";

import { DEFAULT_SHIELD_LAYOUT, DEFAULT_TOP_STAR_SCALE, ShieldAvatar, type ShieldPaint } from "@/components/shield-avatar";
import { SklLogo } from "@/components/skl-logo";

/** Figma 1636:464 — gray → black gradient, neon stroke (matches design SVG). */
const STUDIO_AVATAR_MANUAL: Partial<ShieldPaint> = {
  points: 6,
  innerRatio: 0.35,
  topStarScale: DEFAULT_TOP_STAR_SCALE,
  unifiedGradient: true,
  topStop0: "#686868",
  topStop1: "#000000",
  bottomStop0: "#686868",
  bottomStop1: "#000000",
  stroke: "#00FC43",
  strokeWidth: 2,
};

const SKILL_ROWS = [
  {
    name: "Web-Motion",
    desc: "Writes high-converting SaaS landing pages with structured sections",
    tag: "design",
    stat: "8k",
    ver: "v1.2.0",
    titleCenter: false,
  },
  {
    name: "App-Engage",
    desc: "Creates engaging mobile app onboarding experiences that retain users",
    tag: "design",
    stat: "10k",
    ver: "v1.0.5",
    titleCenter: false,
  },
  {
    name: "Email-Boost",
    desc: "Crafts compelling email campaigns that drive user interaction and conversions",
    tag: "marketing",
    stat: "5k",
    ver: "v2.3.1",
    titleCenter: false,
  },
  {
    name: "Social-Spark",
    desc: "Develops viral social media content strategies that increase brand visibility",
    tag: "marketing",
    stat: "15k",
    ver: "v3.0.0",
    titleCenter: false,
  },
  {
    name: "SEO-Optimizer",
    desc: "Enhances website content for improved search engine rankings and traffic",
    tag: "design",
    stat: "12k",
    ver: "v1.1.7",
    titleCenter: true,
  },
  {
    name: "UX-Flow",
    desc: "Designs intuitive user flows that enhance overall product usability and satisfaction",
    tag: "design",
    stat: "20k",
    ver: "v4.2.3",
    titleCenter: false,
  },
] as const;

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 1.5L10.854 5.87L15.61 6.49L12.11 9.63L13.08 14.33L9 11.96L4.92 14.33L5.89 9.63L2.39 6.49L7.146 5.87L9 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFork({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="5" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="13" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9" cy="13.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6.3V8.5C5 10.2 6.8 11.5 9 11.5C11.2 11.5 13 10.2 13 8.5V6.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 9.7V11.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconSync({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M14.25 10.5C13.65 12.6 11.55 14.25 9 14.25C5.9 14.25 3.5 11.85 3.5 8.75C3.5 5.65 5.9 3.25 9 3.25C11.1 3.25 12.9 4.35 13.9 6M14.5 3.5V6.5H11.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M7.5 10.5L10.5 7.5M6 12L4.5 10.5C3.5 9.5 3.5 7.75 4.5 6.75L6.75 4.5C7.75 3.5 9.5 3.5 10.5 4.5L12 6M12 6L13.5 7.5C14.5 8.5 14.5 10.25 13.5 11.25L11.25 13.5C10.25 14.5 8.5 14.5 7.5 13.5L6 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RowRule() {
  return <div className="h-px w-full shrink-0 bg-[#e4e4e4]" aria-hidden />;
}

/**
 * Figma file Studio, node 1631:506 — structure, spacing, copy, and styles from MCP export (no extra chrome).
 */
export function FigmaStudioProfile() {
  return (
    <div
      className="min-h-screen bg-white text-[#242424]"
      style={{ fontFamily: '"Open Runde", "SF Pro Rounded", system-ui, sans-serif' }}
    >
      <div className="mx-auto w-full max-w-[1056px] px-4 sm:px-6">
        {/* 1636:462 */}
        <header className="flex items-start justify-between pt-6" data-node-id="1636:462">
          <Link href="/" className="flex shrink-0 items-center gap-4 no-underline" data-node-id="1632:507">
            <SklLogo />
          </Link>
          <nav className="flex shrink-0 items-center gap-4" data-node-id="1636:461" aria-label="Account">
            <Link
              href="/new"
              className="flex items-center justify-center rounded-[20px] bg-[#e7e7e7] px-3 py-2 text-[16px] font-medium leading-normal text-[#242424] no-underline"
              data-node-id="1636:456"
            >
              <span data-node-id="1636:455">Create</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center justify-center rounded-[20px] bg-[rgba(228,228,228,0.2)] px-3 py-2 text-[16px] font-medium leading-normal text-[#8f8f8f] no-underline"
              data-node-id="1636:457"
            >
              <span data-node-id="1636:458">Settings</span>
            </Link>
          </nav>
        </header>

        {/* Avatar 1636:464 + rank 1636:487 */}
        <div className="relative mx-auto mt-[104px] flex w-[100px] justify-center">
          <div className="relative h-[100px] w-[100px] shrink-0" data-node-id="1636:464">
            <ShieldAvatar
              seed="studio-max"
              size={100}
              showDebug={false}
              manual={STUDIO_AVATAR_MANUAL}
              avatarScale={DEFAULT_SHIELD_LAYOUT.avatarScale}
              avatarOffsetX={DEFAULT_SHIELD_LAYOUT.avatarOffsetX}
              avatarOffsetY={DEFAULT_SHIELD_LAYOUT.avatarOffsetY}
            />
          </div>
          <div
            className="pointer-events-none absolute left-[calc(100%-2px)] top-[-8px] flex h-[19.333px] w-[18.813px] items-center justify-center"
            aria-hidden
          >
            <div className="-rotate-[23.45deg]">
              <span
                className="whitespace-nowrap text-[12px] font-semibold leading-normal text-black opacity-20"
                data-node-id="1636:487"
              >
                #1
              </span>
            </div>
          </div>
        </div>

        {/* 1636:535 */}
        <div
          className="mx-auto mt-6 flex w-full max-w-[218px] flex-col items-center gap-4 leading-normal"
          data-node-id="1636:535"
        >
          <div className="flex w-[49px] flex-col items-center gap-2 text-[#242424]" data-node-id="1636:471">
            <p className="shrink-0 whitespace-nowrap text-[24px] font-semibold" data-node-id="1636:470">
              Max
            </p>
            <p
              className="w-min min-w-full text-center text-[16px] font-medium underline opacity-50 decoration-dotted decoration-[8%]"
              data-node-id="1636:469"
            >
              @m
            </p>
          </div>
          <p
            className="w-min min-w-full text-center text-[16px] font-medium not-italic text-[#242424]"
            data-node-id="1636:488"
          >
            Hi am the creator of what your looking at right now
          </p>
          <div className="flex w-full items-center justify-center gap-6" data-node-id="1636:534">
            <div className="flex items-center gap-1.5" data-node-id="1636:529">
              <div className="relative size-[18px] overflow-hidden" data-node-id="1636:536">
                <IconStar className="text-[rgba(36,36,36,0.6)]" />
              </div>
              <p
                className="shrink-0 whitespace-nowrap text-center text-[16px] font-medium text-[rgba(36,36,36,0.6)]"
                data-node-id="1636:528"
              >
                289
              </p>
            </div>
            <div className="flex items-center gap-1.5" data-node-id="1636:531">
              <div className="relative size-[18px] overflow-hidden" data-node-id="1636:522">
                <IconFork className="text-[rgba(36,36,36,0.6)]" />
              </div>
              <p
                className="shrink-0 whitespace-nowrap text-center text-[16px] font-medium text-[rgba(36,36,36,0.6)]"
                data-node-id="1636:530"
              >
                4
              </p>
            </div>
            <div className="flex items-center gap-1.5" data-node-id="1636:533">
              <div className="relative size-[18px] overflow-hidden" data-node-id="1636:515">
                <IconSync className="text-[rgba(36,36,36,0.6)]" />
              </div>
              <p
                className="shrink-0 whitespace-nowrap text-center text-[16px] font-medium text-[rgba(36,36,36,0.6)]"
                data-node-id="1636:532"
              >
                16.9k
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" data-node-id="1636:503">
            <div className="relative size-[18px] shrink-0" data-node-id="1636:504">
              <IconLink className="text-[#919191]" />
            </div>
            <p
              className="shrink-0 whitespace-nowrap text-center text-[16px] font-medium leading-normal text-[#919191] underline decoration-dotted decoration-[8%]"
              data-node-id="1636:507"
            >
              Pantom.design
            </p>
          </div>
        </div>

        {/* 1637:1565 — gap 16px between rule + row blocks */}
        <div className="mt-16 flex w-full flex-col gap-4" data-node-id="1637:1565">
          {SKILL_ROWS.map((row, i) => (
            <Fragment key={row.name}>
              <RowRule />
              <div
                className="grid w-full grid-cols-1 items-center gap-y-2 text-[16px] leading-normal md:grid-cols-[10.92%_minmax(0,1fr)_auto_auto_auto] md:gap-x-3"
                data-node-id={i === 0 ? "1637:1557" : undefined}
              >
                <p
                  className={`mt-0.5 font-medium text-[#242424] md:mt-0.5 ${row.titleCenter ? "text-center" : ""}`}
                  data-node-id={i === 0 ? "1636:544" : undefined}
                >
                  {row.name}
                </p>
                <p
                  className="min-w-0 font-medium text-[#242424] md:text-center"
                  data-node-id={i === 0 ? "1636:548" : undefined}
                >
                  {row.desc}
                </p>
                <div
                  className="flex w-fit items-center justify-center rounded-[90px] bg-[rgba(228,228,228,0.8)] px-1.5 py-0.5 md:justify-self-start"
                  data-node-id={i === 0 ? "1636:562" : undefined}
                >
                  <p
                    className="whitespace-nowrap text-center text-[16px] font-medium text-[#8f8f8f]"
                    data-node-id={i === 0 ? "1636:561" : undefined}
                  >
                    {row.tag}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 md:justify-self-start" data-node-id={i === 0 ? "1636:559" : undefined}>
                  <div className="relative size-[18px] overflow-hidden" data-node-id={i === 0 ? "1636:550" : undefined}>
                    <IconSync className="text-[#919191]" />
                  </div>
                  <p
                    className="whitespace-nowrap text-center text-[16px] font-medium text-[#919191]"
                    data-node-id={i === 0 ? "1636:558" : undefined}
                  >
                    {row.stat}
                  </p>
                </div>
                <p
                  className="whitespace-nowrap text-center text-[16px] font-medium text-[#242424] opacity-50 md:justify-self-start"
                  data-node-id={i === 0 ? "1636:560" : undefined}
                >
                  {row.ver}
                </p>
              </div>
            </Fragment>
          ))}
          <RowRule />
        </div>

        {/* 1636:542 */}
        <div
          className="mx-auto mt-24 flex justify-center gap-9 pb-16 text-center text-[16px] font-medium uppercase leading-normal"
          data-node-id="1636:542"
        >
          <span className="shrink-0 text-black" data-node-id="1636:540">
            All skill
          </span>
          <span className="shrink-0 text-[#8f8f8f]" data-node-id="1636:541">
            Stared
          </span>
        </div>
      </div>
    </div>
  );
}
