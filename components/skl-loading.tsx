import { SklLogo } from "@/components/skl-logo";

export function SklLoading({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`flex w-full items-center justify-center ${
        fullScreen ? "min-h-dvh" : "min-h-[14rem]"
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="skl-logo-shimmer">
        <div
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SklLogo markOnly />
        </div>
      </div>
    </div>
  );
}
