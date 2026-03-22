import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? <p className="page-kicker">{eyebrow}</p> : null}
      <div className="space-y-2">
        <h2 className="text-[24px] font-semibold leading-none text-[#242424]">{title}</h2>
        {description ? <p className="max-w-2xl text-[16px] font-medium leading-[1.2] text-[#242424] opacity-80">{description}</p> : null}
      </div>
    </div>
  );
}
