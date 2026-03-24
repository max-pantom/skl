import { SklLogo } from "@/components/skl-logo";

export function SklLoading({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-white"
          : "flex min-h-[14rem] w-full items-center justify-center"
      }
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
