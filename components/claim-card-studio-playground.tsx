"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { MemberIdCard, type MemberIdCardProps } from "@/components/member-id-card";
import { buildMemberIdCardSvg, memberCardSvgFilename } from "@/lib/member-card-svg";
import { playCameraShutterSound } from "@/lib/play-camera-shutter-sound";
import type { UserRole } from "@/lib/types";

/** Default seed / fallback when the id field is cleared in the playground. */
const PLAYGROUND_DEFAULT_USER_ID =
  "a0eebc99-9c0b-4ef8-bb6d-6bbwwjiwjiiieiiwjeiiwjiejijwiiejijwijeieiwjiejiwjijeijwijeijwijeijwijeijwijeiwjiojeiojwinnnnnnnnnn";

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 border-b border-zinc-200 py-3 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center">
      <span className="text-[13px] font-medium text-[#8f8f8f]">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
  );
}

export function ClaimCardStudioPlayground() {
  const [displayName, setDisplayName] = useState("Max Developer");
  const [primaryNameOverride, setPrimaryNameOverride] = useState("");
  const [footerDate, setFooterDate] = useState("23-03-26");
  const [earlyRank, setEarlyRank] = useState(1);
  const [rankEnabled, setRankEnabled] = useState(true);
  const [userId, setUserId] = useState(PLAYGROUND_DEFAULT_USER_ID);
  const [role, setRole] = useState<UserRole>("user");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [portraitBaseSize, setPortraitBaseSize] = useState(256);
  const [portraitScale, setPortraitScale] = useState(2.42);
  const [portraitOffsetRight, setPortraitOffsetRight] = useState(-219);
  const [portraitOffsetY, setPortraitOffsetY] = useState(-76);
  const [portraitOpacity, setPortraitOpacity] = useState(1);
  const [portraitRotateDeg, setPortraitRotateDeg] = useState(0);
  const [minHeight, setMinHeight] = useState(508);
  const [cardBackground, setCardBackground] = useState("#e4e4e4");
  const [cardRadius, setCardRadius] = useState(18);
  const [showPortrait, setShowPortrait] = useState(true);
  const [showRank, setShowRank] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [rankLabelOpacity, setRankLabelOpacity] = useState(0.2);
  const [dateLabelOpacity, setDateLabelOpacity] = useState(0.2);
  const [nameFontSize, setNameFontSize] = useState(32);
  const [nameOffsetX, setNameOffsetX] = useState(-22);
  const [nameOffsetY, setNameOffsetY] = useState(-201);
  const [nameRotateDeg, setNameRotateDeg] = useState(0);
  const [rankBlockOffsetX, setRankBlockOffsetX] = useState(0);
  const [rankBlockOffsetY, setRankBlockOffsetY] = useState(0);
  const [dateOffsetX, setDateOffsetX] = useState(0);
  const [dateOffsetY, setDateOffsetY] = useState(0);
  const [shadowX, setShadowX] = useState(6);
  const [shadowY, setShadowY] = useState(6);
  const [shadowOpacity, setShadowOpacity] = useState(0.17);
  const [hoverParallaxPreview, setHoverParallaxPreview] = useState(true);
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);
  const previewMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shutterFlashKey, setShutterFlashKey] = useState(0);

  const previewProps = useMemo((): MemberIdCardProps => {
    const rank = rankEnabled ? earlyRank : null;
    return {
      displayName,
      primaryName: primaryNameOverride.trim() || undefined,
      footerDate,
      earlyBelieverRank: rank,
      userId: userId.trim() || PLAYGROUND_DEFAULT_USER_ID,
      role,
      avatarUrl: avatarUrl.trim() || null,
      portraitBaseSize,
      portraitScale,
      portraitOffsetRight,
      portraitOffsetY,
      portraitOpacity,
      portraitRotateDeg,
      minHeight,
      cardBackground,
      cardRadius,
      showPortrait,
      showRank,
      showDate,
      rankLabelOpacity,
      dateLabelOpacity,
      nameFontSize,
      nameOffsetX,
      nameOffsetY,
      nameRotateDeg,
      rankBlockOffsetX,
      rankBlockOffsetY,
      dateOffsetX,
      dateOffsetY,
      shadowX,
      shadowY,
      shadowOpacity,
      hoverParallax: hoverParallaxPreview,
      className: "w-full max-w-[367px]",
    };
  }, [
    avatarUrl,
    cardBackground,
    cardRadius,
    dateLabelOpacity,
    dateOffsetX,
    dateOffsetY,
    displayName,
    earlyRank,
    footerDate,
    hoverParallaxPreview,
    minHeight,
    nameFontSize,
    nameOffsetX,
    nameOffsetY,
    nameRotateDeg,
    portraitBaseSize,
    portraitOffsetRight,
    portraitOffsetY,
    portraitOpacity,
    portraitRotateDeg,
    portraitScale,
    primaryNameOverride,
    rankBlockOffsetX,
    rankBlockOffsetY,
    rankEnabled,
    rankLabelOpacity,
    role,
    shadowOpacity,
    shadowX,
    shadowY,
    showDate,
    showPortrait,
    showRank,
    userId,
  ]);

  const copyPreviewPropsJson = useCallback(async () => {
    if (previewMessageTimer.current) clearTimeout(previewMessageTimer.current);
    try {
      await navigator.clipboard.writeText(JSON.stringify(previewProps, null, 2));
      setPreviewMessage("Copied MemberIdCard props as JSON.");
    } catch {
      setPreviewMessage("Could not copy — check clipboard permission.");
    }
    previewMessageTimer.current = setTimeout(() => setPreviewMessage(null), 3200);
  }, [previewProps]);

  const downloadMemberCardSvg = useCallback(() => {
    if (previewMessageTimer.current) clearTimeout(previewMessageTimer.current);
    playCameraShutterSound();
    setShutterFlashKey((k) => k + 1);
    const svg = buildMemberIdCardSvg(previewProps);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = memberCardSvgFilename(previewProps.displayName);
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setPreviewMessage("SVG downloaded.");
    previewMessageTimer.current = setTimeout(() => setPreviewMessage(null), 3200);
  }, [previewProps]);

  const previewActionBtnClass =
    "flex h-[43px] min-w-[140px] flex-1 items-center justify-center rounded-[18px] bg-[#e4e4e4] px-4 text-[15px] font-medium text-[rgba(36,36,36,0.55)] transition hover:bg-[#dadada] hover:text-[#242424] sm:min-w-[160px]";

  return (
    <>
      {shutterFlashKey > 0 ? (
        <div
          key={shutterFlashKey}
          className="pointer-events-none fixed inset-0 z-[300] animate-shutter-flash bg-white"
          aria-hidden
        />
      ) : null}
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
      <div className="flex flex-1 flex-col items-center gap-8 lg:sticky lg:top-8">
        <MemberIdCard {...previewProps} />
        <div className="flex w-full max-w-[367px] flex-col items-center gap-3">
          <div className="flex w-full flex-wrap justify-center gap-3">
            <button type="button" onClick={() => downloadMemberCardSvg()} className={previewActionBtnClass}>
              Download SVG
            </button>
            <button type="button" onClick={() => void copyPreviewPropsJson()} className={previewActionBtnClass}>
              Copy props (JSON)
            </button>
          </div>
          {previewMessage ? (
            <p className="text-center text-[13px] font-medium text-[#8f8f8f]">{previewMessage}</p>
          ) : null}
        </div>
        <p className="max-w-[367px] text-center text-[14px] font-medium text-[#8f8f8f]">
          Live preview — same as claim ending: <code className="font-mono text-[13px]">MemberIdCard</code> (portrait is
          the user&apos;s avatar, scaled and shifted — square frame, not a circle).
        </p>
      </div>

      <div className="w-full max-w-xl rounded-[24px] border border-zinc-200 bg-white px-4 py-2 sm:px-5">
        <h1 className="border-b border-zinc-200 py-4 text-[20px] font-semibold text-[#242424]">
          Member card playground
        </h1>
        <p className="py-3 text-[14px] font-medium leading-relaxed text-[#8f8f8f]">
          The large shape on the right is the user&apos;s avatar (shield or photo), scaled and offset inside the card.
          Production defaults match the initial slider values.
        </p>

        <section className="border-t border-zinc-200 pt-2">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">Content</h2>
          <ControlRow label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="skl-input rounded-[12px] border border-zinc-200 bg-zinc-50 px-3 py-2"
            />
          </ControlRow>
          <ControlRow label="Primary name override">
            <input
              value={primaryNameOverride}
              onChange={(e) => setPrimaryNameOverride(e.target.value)}
              placeholder="Empty = first word of display name"
              className="skl-input rounded-[12px] border border-zinc-200 bg-zinc-50 px-3 py-2"
            />
          </ControlRow>
          <ControlRow label="Footer date">
            <input
              value={footerDate}
              onChange={(e) => setFooterDate(e.target.value)}
              className="skl-input rounded-[12px] border border-zinc-200 bg-zinc-50 px-3 py-2"
            />
          </ControlRow>
          <ControlRow label="Early rank (# of users)">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-[14px] font-medium text-[#242424]">
                <input
                  type="checkbox"
                  checked={rankEnabled}
                  onChange={(e) => setRankEnabled(e.target.checked)}
                />
                Show rank
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={earlyRank}
                onChange={(e) => setEarlyRank(Number(e.target.value) || 1)}
                disabled={!rankEnabled}
                className="w-20 rounded-[12px] border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-[14px]"
              />
            </div>
          </ControlRow>
          <ControlRow label="User id (avatar seed)">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="skl-input w-full rounded-[12px] border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[12px]"
            />
          </ControlRow>
          <ControlRow label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="rounded-[12px] border border-zinc-200 bg-zinc-50 px-3 py-2 text-[14px] font-medium text-[#242424]"
            >
              <option value="user">user</option>
              <option value="pro">pro</option>
              <option value="admin">admin</option>
            </select>
          </ControlRow>
          <ControlRow label="Avatar URL (optional)">
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className="skl-input rounded-[12px] border border-zinc-200 bg-zinc-50 px-3 py-2"
            />
          </ControlRow>
        </section>

        <section className="border-t border-zinc-200 pt-2">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">
            Portrait (scaled avatar)
          </h2>
          <ControlRow label={`Base size (${portraitBaseSize}px)`}>
            <input
              type="range"
              min={120}
              max={320}
              value={portraitBaseSize}
              onChange={(e) => setPortraitBaseSize(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Scale (${portraitScale.toFixed(2)}×)`}>
            <input
              type="range"
              min={100}
              max={280}
              value={Math.round(portraitScale * 100)}
              onChange={(e) => setPortraitScale(Number(e.target.value) / 100)}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Offset right (${portraitOffsetRight}px)`}>
            <input
              type="range"
              min={-300}
              max={300}
              value={portraitOffsetRight}
              onChange={(e) => setPortraitOffsetRight(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Offset Y (${portraitOffsetY}px)`}>
            <input
              type="range"
              min={-300}
              max={300}
              value={portraitOffsetY}
              onChange={(e) => setPortraitOffsetY(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Rotate (${portraitRotateDeg}°)`}>
            <input
              type="range"
              min={-180}
              max={180}
              value={portraitRotateDeg}
              onChange={(e) => setPortraitRotateDeg(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Portrait opacity (${Math.round(portraitOpacity * 100)}%)`}>
            <input
              type="range"
              min={20}
              max={100}
              value={Math.round(portraitOpacity * 100)}
              onChange={(e) => setPortraitOpacity(Number(e.target.value) / 100)}
              className="w-full"
            />
          </ControlRow>
        </section>

        <section className="border-t border-zinc-200 pt-2">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">Name block</h2>
          <ControlRow label={`Name X (${nameOffsetX}px)`}>
            <input
              type="range"
              min={-300}
              max={300}
              value={nameOffsetX}
              onChange={(e) => setNameOffsetX(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Name Y (${nameOffsetY}px)`}>
            <input
              type="range"
              min={-300}
              max={300}
              value={nameOffsetY}
              onChange={(e) => setNameOffsetY(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Name rotate (${nameRotateDeg}°)`}>
            <input
              type="range"
              min={-180}
              max={180}
              value={nameRotateDeg}
              onChange={(e) => setNameRotateDeg(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
        </section>

        <section className="border-t border-zinc-200 pt-2">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">Rank block</h2>
          <ControlRow label={`Rank X (${rankBlockOffsetX}px)`}>
            <input
              type="range"
              min={-300}
              max={300}
              value={rankBlockOffsetX}
              onChange={(e) => setRankBlockOffsetX(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Rank Y (${rankBlockOffsetY}px)`}>
            <input
              type="range"
              min={-300}
              max={300}
              value={rankBlockOffsetY}
              onChange={(e) => setRankBlockOffsetY(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
        </section>

        <section className="border-t border-zinc-200 pt-2">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">Footer date</h2>
          <ControlRow label={`Date X (${dateOffsetX}px)`}>
            <input
              type="range"
              min={-300}
              max={300}
              value={dateOffsetX}
              onChange={(e) => setDateOffsetX(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Date Y (${dateOffsetY}px)`}>
            <input
              type="range"
              min={-300}
              max={300}
              value={dateOffsetY}
              onChange={(e) => setDateOffsetY(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
        </section>

        <section className="border-t border-zinc-200 pt-2">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">Card chrome</h2>
          <ControlRow label={`Min height (${minHeight}px)`}>
            <input
              type="range"
              min={320}
              max={640}
              value={minHeight}
              onChange={(e) => setMinHeight(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Radius (${cardRadius}px)`}>
            <input
              type="range"
              min={8}
              max={48}
              value={cardRadius}
              onChange={(e) => setCardRadius(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Name size (${nameFontSize}px)`}>
            <input
              type="range"
              min={18}
              max={48}
              value={nameFontSize}
              onChange={(e) => setNameFontSize(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label="Card background">
            <input
              type="color"
              value={cardBackground.length === 7 ? cardBackground : "#e4e4e4"}
              onChange={(e) => setCardBackground(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-zinc-200 bg-white p-1"
            />
          </ControlRow>
        </section>

        <section className="border-t border-zinc-200 pt-2">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">Shadow</h2>
          <ControlRow label={`Offset X (${shadowX}px)`}>
            <input
              type="range"
              min={0}
              max={16}
              value={shadowX}
              onChange={(e) => setShadowX(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Offset Y (${shadowY}px)`}>
            <input
              type="range"
              min={0}
              max={16}
              value={shadowY}
              onChange={(e) => setShadowY(Number(e.target.value))}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Shadow alpha (${shadowOpacity.toFixed(2)})`}>
            <input
              type="range"
              min={0}
              max={40}
              value={Math.round(shadowOpacity * 100)}
              onChange={(e) => setShadowOpacity(Number(e.target.value) / 100)}
              className="w-full"
            />
          </ControlRow>
        </section>

        <section className="border-t border-zinc-200 pt-2">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">Labels</h2>
          <ControlRow label={`Rank opacity (${rankLabelOpacity.toFixed(2)})`}>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(rankLabelOpacity * 100)}
              onChange={(e) => setRankLabelOpacity(Number(e.target.value) / 100)}
              className="w-full"
            />
          </ControlRow>
          <ControlRow label={`Date opacity (${dateLabelOpacity.toFixed(2)})`}>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(dateLabelOpacity * 100)}
              onChange={(e) => setDateLabelOpacity(Number(e.target.value) / 100)}
              className="w-full"
            />
          </ControlRow>
        </section>

        <section className="border-t border-zinc-200 py-3">
          <h2 className="py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8f8f8f]">Visibility</h2>
          <div className="flex flex-col gap-2 text-[14px] font-medium text-[#242424]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hoverParallaxPreview}
                onChange={(e) => setHoverParallaxPreview(e.target.checked)}
              />
              Hover parallax (pointer tilt)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPortrait}
                onChange={(e) => setShowPortrait(e.target.checked)}
              />
              Portrait (scaled avatar)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showRank} onChange={(e) => setShowRank(e.target.checked)} />
              Rank line
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
              Footer date
            </label>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
