"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MdxRichEditor = dynamic(
  () => import("@/components/mdx-rich-editor").then((module) => module.MdxRichEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[26rem] border-y border-zinc-200 py-6">
        <p className="text-[16px] font-medium text-[#8f8f8f]">Loading editor…</p>
      </div>
    ),
  },
);

export function MarkdownEditorPreview({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const [content, setContent] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[16px] font-semibold text-[#242424]" htmlFor="content">
          Skill body
        </label>
        <span className="text-[16px] font-medium text-[#8f8f8f]">Rich editor with markdown source mode</span>
      </div>
      <input type="hidden" id="content" name="content" value={content} />
      <MdxRichEditor markdown={content} onChange={setContent} />
    </div>
  );
}
