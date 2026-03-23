import { SklLogo } from "@/components/skl-logo";

export function SklLoading({
  label = "Loading",
  fullScreen = false,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-5 ${
        fullScreen ? "min-h-[calc(100dvh-9rem)]" : "min-h-[14rem]"
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="skl-loading-mark">
        <SklLogo />
      </div>
      <p className="text-center text-[15px] font-medium tracking-[0.08em] text-[#8f8f8f] uppercase">{label}</p>
    </div>
  );
}
