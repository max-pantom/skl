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
        "rounded-[1.25rem] border px-4 py-3 text-sm",
        tone === "error" && "border-red-200 bg-red-50 text-red-700",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "info" && "border-stone-300 bg-white text-slate-600",
      )}
    >
      {children}
    </div>
  );
}
