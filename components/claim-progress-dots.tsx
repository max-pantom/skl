/**
 * Claim flow progress — supplied SVG: bottom-left → top → bottom-right;
 * opacity 1 for reached steps, 0.4 for upcoming (step 2 matches two solid + one muted).
 */
export function ClaimProgressDots({
  step,
  variant = "footer",
}: {
  step: 1 | 2 | 3;
  /** `footer`: centered under form/card. `dock`: inline for bottom bar next to recent avatars. */
  variant?: "footer" | "dock";
}) {
  const wrapClass =
    variant === "footer"
      ? "mx-auto flex shrink-0 justify-center pb-4 sm:pb-6"
      : "flex shrink-0 items-center justify-center";

  const sizeClass = variant === "footer" ? "h-[16px] w-[24px] sm:h-[20px] sm:w-[30px]" : "h-[14px] w-[21px] sm:h-[20px] sm:w-[30px]";

  return (
    <div className={wrapClass}>
      <svg
        className={sizeClass}
        width="30"
        height="20"
        viewBox="0 0 30 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Claim progress: step ${step} of 3`}
      >
        <circle cx="5" cy="15" r="5" fill="#242424" opacity={step >= 1 ? 1 : 0.4} />
        <circle cx="15" cy="5" r="5" fill="#242424" opacity={step >= 2 ? 1 : 0.4} />
        <circle cx="25" cy="15" r="5" fill="#242424" opacity={step >= 3 ? 1 : 0.4} />
      </svg>
    </div>
  );
}
