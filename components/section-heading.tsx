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
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
    </div>
  );
}

