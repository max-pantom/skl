import { cn } from "@/lib/utils";

export function PageIntro({
  eyebrow,
  title,
  description,
  className,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";

  return (
    <section
      className={cn(
        "flex flex-col",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-4", centered ? "max-w-[560px] items-center" : "max-w-[640px]")}>
        {eyebrow ? <p className="page-kicker">{eyebrow}</p> : null}
        <div className="space-y-3">
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
      </div>
    </section>
  );
}
