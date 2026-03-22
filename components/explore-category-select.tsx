"use client";

import { useEffect, useId, useRef, useState } from "react";

import { launchCategories, type SkillCategory } from "@/lib/types";

export type ExploreCategoryValue = SkillCategory | "all";

type ExploreCategorySelectProps = {
  name?: string;
  defaultValue: ExploreCategoryValue;
};

const OPTIONS: { value: ExploreCategoryValue; label: string }[] = [
  { value: "all", label: "All" },
  ...launchCategories.map((c) => ({ value: c, label: c })),
];

export function ExploreCategorySelect({ name = "category", defaultValue }: ExploreCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<ExploreCategoryValue>(defaultValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div ref={rootRef} className="skl-select-shell">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        id={`${listId}-trigger`}
        className="skl-select flex w-full cursor-pointer items-center justify-between gap-2 text-left !pr-4"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="min-w-0 truncate">{selected.label}</span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className={`pointer-events-none ml-auto h-4 w-4 shrink-0 text-[#8f8f8f] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6.5 8 10.5l4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={`${listId}-trigger`}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(320px,calc(100vh-120px))] overflow-auto rounded-[20px] border border-zinc-200 bg-white py-2 shadow-[0_12px_40px_rgba(36,36,36,0.12)]"
        >
          {OPTIONS.map((opt) => {
            const active = value === opt.value;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-[16px] font-medium transition ${
                    active
                      ? "bg-[#242424] text-white"
                      : "text-[#242424] hover:bg-[rgba(228,228,228,0.55)]"
                  }`}
                  onClick={() => {
                    setValue(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
