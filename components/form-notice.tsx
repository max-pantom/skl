import { cn } from "@/lib/utils";

export function FormNotice({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-y px-0 py-3 text-[16px] font-medium",
        tone === "error" && "border-red-200 text-red-700",
        tone === "success" && "border-zinc-200 text-[#242424]",
        tone === "info" && "border-zinc-200 text-[#8f8f8f]",
      )}
    >
      {children}
    </div>
  );
}
