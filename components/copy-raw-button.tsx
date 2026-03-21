"use client";

import { useState } from "react";

export function CopyRawButton({ content }: { content: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
    >
      {status === "idle" ? "Copy raw" : status === "copied" ? "Copied" : "Copy failed"}
    </button>
  );
}
