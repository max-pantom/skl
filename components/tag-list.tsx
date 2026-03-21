import { cn } from "@/lib/utils";

export function TagList({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-stone-300 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

