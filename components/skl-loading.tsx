import { SklLogo } from "@/components/skl-logo";

export function SklLoading({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`flex w-full items-center justify-center ${
        fullScreen ? "min-h-[calc(100dvh-9rem)]" : "min-h-[14rem]"
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="skl-logo-shimmer">
        <SklLogo />
      </div>
    </div>
  );
}
