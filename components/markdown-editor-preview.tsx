"use client";

import { useRef, useState } from "react";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  PRIMARY_SKILL_FILE,
  isMarkdownPath,
  isValidSkillFilePath,
  normalizeSkillFilePath,
} from "@/lib/skill-files";

type EditorFile = {
  id: string;
  path: string;
  content: string;
};

type MarkdownEditorPreviewProps = {
  defaultFiles?: Array<{
    path: string;
    content: string;
  }>;
};

function createInitialFiles(defaultFiles?: MarkdownEditorPreviewProps["defaultFiles"]) {
  const files = defaultFiles?.length
    ? defaultFiles
    : [{ path: PRIMARY_SKILL_FILE, content: "" }];

  return files.map((file, index) => ({
    id: `file-${index + 1}`,
    path: file.path,
    content: file.content,
  }));
}

function getNextFilePath(files: EditorFile[]) {
  const existing = new Set(files.map((file) => normalizeSkillFilePath(file.path)));

  if (!existing.has("README.md")) {
    return "README.md";
  }

  let index = 1;

  while (existing.has(`notes-${index}.txt`)) {
    index += 1;
  }

  return `notes-${index}.txt`;
}

function getValidationMessages(files: EditorFile[]) {
  const messages: string[] = [];
  const seenPaths = new Set<string>();

  for (const file of files) {
    const path = normalizeSkillFilePath(file.path);

    if (!path) {
      messages.push("Every file needs a path.");
      continue;
    }

    if (!isValidSkillFilePath(path)) {
      messages.push(`"${file.path}" is not a valid relative file path.`);
      continue;
    }

    if (seenPaths.has(path)) {
      messages.push(`"${path}" is listed more than once.`);
      continue;
    }

    seenPaths.add(path);
  }

  if (!seenPaths.has(PRIMARY_SKILL_FILE)) {
    messages.push("SKILL.md is required for every version.");
  }

  return [...new Set(messages)];
}

export function MarkdownEditorPreview({
  defaultFiles,
}: MarkdownEditorPreviewProps) {
  const [files, setFiles] = useState(() => createInitialFiles(defaultFiles));
  const [activeFileId, setActiveFileId] = useState(() => createInitialFiles(defaultFiles)[0]?.id ?? "file-1");
  const [activePane, setActivePane] = useState<"write" | "preview">("write");
  const nextIdRef = useRef(files.length + 1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFileIndex = files.findIndex((file) => file.id === activeFileId);
  const activeFile = files[activeFileIndex] ?? files[0];
  const validationMessages = getValidationMessages(files);
  const serializedFiles = JSON.stringify(
    files.map((file) => ({
      path: normalizeSkillFilePath(file.path),
      content: file.content,
    })),
  );
  const primaryFile = files.find((file) => normalizeSkillFilePath(file.path) === PRIMARY_SKILL_FILE);

  function updateActiveFile(patch: Partial<Pick<EditorFile, "path" | "content">>) {
    if (!activeFile) {
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === activeFile.id
          ? {
              ...file,
              ...patch,
            }
          : file,
      ),
    );
  }

  function updateSelection(nextContent: string, nextSelectionStart: number, nextSelectionEnd = nextSelectionStart) {
    if (!activeFile) {
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === activeFile.id
          ? {
              ...file,
              content: nextContent,
            }
          : file,
      ),
    );

    requestAnimationFrame(() => {
      if (!textareaRef.current) {
        return;
      }

      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  }

  function wrapSelection(prefix: string, suffix: string, placeholder: string) {
    if (!activeFile || !textareaRef.current) {
      return;
    }

    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = activeFile.content.slice(selectionStart, selectionEnd);
    const insertedText = `${prefix}${selectedText || placeholder}${suffix}`;
    const nextContent = `${activeFile.content.slice(0, selectionStart)}${insertedText}${activeFile.content.slice(selectionEnd)}`;
    const start = selectionStart + prefix.length;
    const end = start + (selectedText || placeholder).length;

    updateSelection(nextContent, start, end);
  }

  function prefixLines(prefix: string, placeholder: string) {
    if (!activeFile || !textareaRef.current) {
      return;
    }

    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = activeFile.content.slice(selectionStart, selectionEnd) || placeholder;
    const prefixedText = selectedText
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
    const nextContent = `${activeFile.content.slice(0, selectionStart)}${prefixedText}${activeFile.content.slice(selectionEnd)}`;

    updateSelection(nextContent, selectionStart, selectionStart + prefixedText.length);
  }

  function insertText(text: string) {
    if (!activeFile || !textareaRef.current) {
      return;
    }

    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const nextContent = `${activeFile.content.slice(0, selectionStart)}${text}${activeFile.content.slice(selectionEnd)}`;
    const cursor = selectionStart + text.length;

    updateSelection(nextContent, cursor);
  }

  function addFile() {
    const nextFile: EditorFile = {
      id: `file-${nextIdRef.current}`,
      path: getNextFilePath(files),
      content: "",
    };

    nextIdRef.current += 1;

    setFiles((currentFiles) => [...currentFiles, nextFile]);
    setActiveFileId(nextFile.id);
  }

  function removeFile(fileId: string) {
    const removableFile = files.find((file) => file.id === fileId);

    if (!removableFile || normalizeSkillFilePath(removableFile.path) === PRIMARY_SKILL_FILE) {
      return;
    }

    const nextFiles = files.filter((file) => file.id !== fileId);

    setFiles(nextFiles);

    if (activeFileId === fileId) {
      setActiveFileId(nextFiles[0]?.id ?? "");
    }
  }

  if (!activeFile) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <label className="text-[16px] font-semibold text-[#242424]" htmlFor="skill-file-path">
            Skill files
          </label>
          <p className="text-[15px] font-medium text-[#8f8f8f]">
            Type raw markdown directly. The toolbar inserts syntax into the current file.
          </p>
        </div>
        <button type="button" onClick={addFile} className="skl-btn skl-btn-secondary self-start sm:self-auto">
          Add file
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {files.map((file) => {
          const isActive = file.id === activeFile.id;
          const normalizedPath = normalizeSkillFilePath(file.path);
          const isPrimary = normalizedPath === PRIMARY_SKILL_FILE;

          return (
            <div
              key={file.id}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[14px] font-medium ${
                isActive ? "border-[#242424] bg-[#242424] text-white" : "border-zinc-200 bg-white text-[#242424]"
              }`}
            >
              <button type="button" onClick={() => setActiveFileId(file.id)} className="truncate">
                {file.path || "Untitled"}
              </button>
              {!isPrimary ? (
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className={`text-[12px] ${isActive ? "text-white/80" : "text-[#8f8f8f]"}`}
                  aria-label={`Remove ${file.path || "file"}`}
                >
                  Remove
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {validationMessages.length ? (
        <div className="rounded-2xl border border-[#d9b1b1] bg-[#fff7f7] px-4 py-3 text-[14px] font-medium text-[#8b3a3a]">
          {validationMessages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <input type="hidden" name="files" value={serializedFiles} />
      <input type="hidden" name="content" value={primaryFile?.content ?? ""} />

      <div className="space-y-4 border-y border-zinc-200 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="profile-field-row block lg:min-w-[320px] lg:max-w-[420px]">
            <span className="profile-field-label">File path</span>
            <input
              id="skill-file-path"
              value={activeFile.path}
              onChange={(event) => updateActiveFile({ path: event.target.value })}
              className="skl-input"
              placeholder="SKILL.md"
            />
          </label>

          <div className="inline-flex w-full rounded-full bg-[rgba(228,228,228,0.45)] p-1 lg:w-auto">
            <button
              type="button"
              onClick={() => setActivePane("write")}
              className={`flex-1 rounded-full px-4 py-2 text-[15px] font-medium transition lg:flex-none ${
                activePane === "write" ? "bg-[#242424] text-white" : "text-[#6f6f6f]"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActivePane("preview")}
              className={`flex-1 rounded-full px-4 py-2 text-[15px] font-medium transition lg:flex-none ${
                activePane === "preview" ? "bg-[#242424] text-white" : "text-[#6f6f6f]"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {activePane === "write" ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => insertText("## ")} className="skl-btn skl-btn-secondary">
                Heading
              </button>
              <button type="button" onClick={() => wrapSelection("**", "**", "bold")} className="skl-btn skl-btn-secondary">
                Bold
              </button>
              <button type="button" onClick={() => wrapSelection("*", "*", "italic")} className="skl-btn skl-btn-secondary">
                Italic
              </button>
              <button type="button" onClick={() => prefixLines("- ", "List item")} className="skl-btn skl-btn-secondary">
                Bullet
              </button>
              <button type="button" onClick={() => prefixLines("1. ", "List item")} className="skl-btn skl-btn-secondary">
                Numbered
              </button>
              <button type="button" onClick={() => prefixLines("> ", "Quoted text")} className="skl-btn skl-btn-secondary">
                Quote
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("```txt\n", "\n```", "code")}
                className="skl-btn skl-btn-secondary"
              >
                Code block
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("[", "](https://example.com)", "link text")}
                className="skl-btn skl-btn-secondary"
              >
                Link
              </button>
              <button type="button" onClick={() => insertText("\n---\n")} className="skl-btn skl-btn-secondary">
                Divider
              </button>
            </div>

            <label className="profile-field-row block">
              <span className="profile-field-label">Raw text</span>
              <textarea
                ref={textareaRef}
                value={activeFile.content}
                onChange={(event) => updateActiveFile({ content: event.target.value })}
                rows={20}
                className="min-h-[26rem] w-full resize-y rounded-[28px] border border-zinc-200 px-5 py-4 font-mono text-[14px] leading-6 text-[#242424] outline-none transition focus:border-[#242424]"
                spellCheck={false}
                placeholder={
                  normalizeSkillFilePath(activeFile.path) === PRIMARY_SKILL_FILE
                    ? "# Skill\n\nWrite with normal markdown syntax here."
                    : "Plain text file contents"
                }
              />
            </label>
          </>
        ) : (
          <div className="profile-field-row">
            <div className="flex items-center justify-between gap-3">
              <span className="profile-field-label">Preview</span>
              <span className="text-[14px] font-medium text-[#8f8f8f]">
                {isMarkdownPath(activeFile.path) ? "Rendered markdown" : "Plain text"}
              </span>
            </div>
            <div className="min-h-[26rem] rounded-[28px] border border-zinc-200 px-5 py-4">
              {isMarkdownPath(activeFile.path) ? (
                <MarkdownRenderer content={activeFile.content || "_Nothing in this file yet._"} />
              ) : (
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[14px] leading-6 text-[#242424]">
                  {activeFile.content || "Nothing in this file yet."}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
