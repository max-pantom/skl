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
    <div className={cn("skl-divider space-y-3 pb-6", className)}>
      {eyebrow ? (
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">{eyebrow}</p>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-6 text-zinc-600">{description}</p> : null}
      </div>
    </div>
  );
}

