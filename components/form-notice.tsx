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
        "border px-4 py-3 text-sm",
        tone === "error" && "border-red-300 bg-red-50 text-red-900",
        tone === "success" && "border-zinc-300 bg-zinc-50 text-zinc-900",
        tone === "info" && "border-zinc-200 bg-white text-zinc-600",
      )}
    >
      {children}
    </div>
  );
}
