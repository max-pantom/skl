"use client";

import { useState } from "react";

export function CopyRawButton({
  content,
  label = "Copy raw",
}: {
  content: string;
  label?: string;
}) {
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
      className="skl-btn skl-btn-secondary w-full justify-center"
    >
      {status === "idle" ? label : status === "copied" ? "Copied" : "Copy failed"}
    </button>
  );
}
