"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function stripFrontmatter(content: string) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-skill">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripFrontmatter(content)}</ReactMarkdown>
    </div>
  );
}
