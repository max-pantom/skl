"use client";

import { useState } from "react";

type Provider = "claude" | "gpt";

const providerMeta: Record<
  Provider,
  {
    buttonLabel: string;
    href: string;
  }
> = {
  claude: {
    buttonLabel: "Open in Claude",
    href: "https://claude.ai/new",
  },
  gpt: {
    buttonLabel: "Open in GPT",
    href: "https://chatgpt.com/",
  },
};

export function OpenInAiButton({
  content,
}: {
  content: string;
}) {
  const [provider, setProvider] = useState<Provider>("claude");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleOpen() {
    try {
      await navigator.clipboard.writeText(content);
      setStatus("copied");
      window.open(providerMeta[provider].href, "_blank", "noopener,noreferrer");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <div className="flex gap-2">
      <div className="skl-select-shell min-w-[106px]">
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value as Provider)}
          className="skl-select h-[43px] rounded-[18px] px-3 pr-9 text-[15px]"
          aria-label="AI app"
        >
          <option value="claude">Claude</option>
          <option value="gpt">GPT</option>
        </select>
        <svg viewBox="0 0 16 16" aria-hidden className="skl-select-icon">
          <path d="M4 6.5 8 10.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <button type="button" onClick={handleOpen} className="skl-btn skl-btn-secondary flex-1 justify-center">
        {status === "idle"
          ? providerMeta[provider].buttonLabel
          : status === "copied"
            ? "Copied and opened"
            : "Could not open"}
      </button>
    </div>
  );
}
