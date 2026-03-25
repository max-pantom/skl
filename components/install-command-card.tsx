"use client";

import { useState } from "react";

export function InstallCommandCard({
  command,
}: {
  command: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
      <p className="page-kicker">Install with CLI</p>
      <p className="mt-3 text-[15px] font-medium leading-snug text-[#242424]/75">
        Copy this command to install this skill directly from the registry.
      </p>
      <pre className="skl-thin-scrollbar mt-4 overflow-x-auto rounded-[18px] border border-zinc-200 bg-white px-4 py-3 font-mono text-[13px] leading-6 text-[#242424]">
        <code>{command}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="skl-btn skl-btn-secondary mt-4 w-full justify-center"
      >
        {status === "idle" ? "Copy install command" : status === "copied" ? "Copied" : "Copy failed"}
      </button>
    </div>
  );
}
