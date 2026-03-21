import { cn } from "@/lib/utils";

export function TagList({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-zinc-600"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
