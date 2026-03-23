import { ImageResponse } from "next/og";

import { getProfileByUsername } from "@/lib/data";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type ProfileImageProps = {
  params: Promise<{
    username: string;
  }>;
};

function avatarImageUrl(avatarUrl: string | null) {
  const trimmed = avatarUrl?.trim();
  if (!trimmed || trimmed.endsWith(".svg")) {
    return null;
  }

  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `/${trimmed.replace(/^\/+/, "")}`;
}

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "SK";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default async function ProfileOpenGraphImage({ params }: ProfileImageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  const displayName = profile?.user.displayName ?? "SKL";
  const handle = profile?.user.username ?? username;
  const bio = profile?.user.bio?.trim() || "Portable AI skills. Publish, browse, fork, and download reusable instruction packages.";
  const avatarUrl = profile ? avatarImageUrl(profile.user.avatarUrl) : null;
  const avatarFallback = initials(displayName);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f7f7f2 0%, #efeee7 48%, #ffffff 100%)",
          color: "#242424",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            display: "flex",
            borderRadius: 40,
            border: "1px solid rgba(36,36,36,0.1)",
            background: "rgba(255,255,255,0.78)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -72,
            right: -52,
            width: 320,
            height: 320,
            borderRadius: 999,
            background: "#ecebe4",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -130,
            left: 490,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "#f0efe8",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            width: "100%",
            padding: "66px 72px",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 690,
              height: "100%",
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#727272",
                fontSize: 22,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
              }}
            >
              <span>SKL Profile</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 76,
                  fontWeight: 700,
                  lineHeight: 1.02,
                  letterSpacing: "-0.04em",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 34,
                  fontWeight: 500,
                  color: "#6f6f6f",
                }}
              >
                @{handle}
              </div>
              <div
                style={{
                  display: "flex",
                  maxWidth: 620,
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: "#4f4f4f",
                }}
              >
                {bio.length > 140 ? `${bio.slice(0, 137)}...` : bio}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 22,
                color: "#8a8a8a",
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "#242424",
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                sklx.one
              </div>
              <span>Portable AI skills</span>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 318,
              height: 318,
              borderRadius: 46,
              overflow: "hidden",
              border: "1px solid rgba(36,36,36,0.1)",
              background: "#f2f2ec",
              boxShadow: "0 22px 60px rgba(36,36,36,0.12)",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName} avatar`}
                width={318}
                height={318}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #232323 0%, #4a4a4a 100%)",
                  color: "#ffffff",
                  fontSize: 112,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                }}
              >
                {avatarFallback}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
