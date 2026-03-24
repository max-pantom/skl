"use client";

import { useEffect, useMemo, useState } from "react";

type CommandDoc = {
  id: string;
  label: string;
  command: string;
  purpose: string;
  notes: string[];
  shortcuts?: string[];
};

const commands: CommandDoc[] = [
  {
    id: "global-install",
    label: "GLOBAL INSTALL",
    command: "npm install -g @sklx/cli",
    purpose: "Installs the `skl` binary globally so the command works anywhere on your machine.",
    notes: [
      "Use this if you want the shortest workflow.",
      "After install, run `skl add`, `skl tui`, `skl publish`, and `skl update` directly.",
    ],
    shortcuts: ["1"],
  },
  {
    id: "npx-add",
    label: "ONE-OFF ADD",
    command: 'npx @sklx/cli add "crazy ideas to mvp"',
    purpose: "Downloads and runs the CLI once without installing it globally, then installs the matched skill.",
    notes: [
      "Best for first-time users.",
      "Phrase search is supported, so you do not need the exact slug.",
    ],
    shortcuts: ["2"],
  },
  {
    id: "express-add",
    label: "EXPRESS MODE",
    command: 'skl add "crazy ideas to mvp"',
    purpose: "Fast install flow for adding a skill by name or slug after the CLI is already installed.",
    notes: [
      "If more than one skill matches, the CLI prompts you to choose.",
      "Login is not required for public installs.",
    ],
    shortcuts: ["3"],
  },
  {
    id: "tui",
    label: "OPEN TUI",
    command: "skl tui",
    purpose: "Opens the interactive terminal UI for browsing commands, auth, install, inspect, publish, and update flows.",
    notes: [
      "Use this when you want a persistent terminal session instead of rerunning commands.",
      "The TUI is keyboard-first.",
    ],
    shortcuts: ["4"],
  },
  {
    id: "login",
    label: "LINK ACCOUNT",
    command: "skl login",
    purpose: "Starts the browser approval flow that connects the CLI to your SKLX account.",
    notes: [
      "Required for publishing and updating skills.",
      "Public installs do not require login.",
    ],
    shortcuts: ["5"],
  },
  {
    id: "publish",
    label: "PUBLISH",
    command: "skl publish",
    purpose: "Scans the current folder for `SKILL.md`, walks you through metadata, validates the payload, and uploads a new skill.",
    notes: [
      "Run this inside the folder you want to publish.",
      "Dry-run validation is available before upload.",
    ],
    shortcuts: ["6"],
  },
  {
    id: "update",
    label: "UPDATE",
    command: "skl update",
    purpose: "Publishes a new version from a locally linked project that has already been published once.",
    notes: [
      "Uses the local project linkage created by the initial publish flow.",
      "Preview the next version before sending it.",
    ],
    shortcuts: ["7"],
  },
];

export function CliDocsTerminal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = commands[activeIndex] ?? commands[0];
  const activeRowCode = String(activeIndex + 1).padStart(2, "0");

  const shortcutMap = useMemo(() => {
    return new Map(commands.flatMap((entry, index) => (entry.shortcuts ?? []).map((key) => [key, index] as const)));
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % commands.length);
        return;
      }

      if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + commands.length) % commands.length);
        return;
      }

      const nextIndex = shortcutMap.get(event.key);
      if (typeof nextIndex === "number") {
        event.preventDefault();
        setActiveIndex(nextIndex);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcutMap]);

  return (
    <section className="cli-docs-terminal">
      <div className="cli-docs-terminal__screen">
        <div className="cli-docs-terminal__chrome">
          <span>SESSION</span>
          <span>DOCS://SKLX.ONE/CLI</span>
          <span>STATUS ONLINE</span>
        </div>

        <div className="cli-docs-terminal__body">
          <div className="cli-docs-terminal__left">
            <div className="cli-docs-terminal__section-title">COMMAND INDEX</div>
            <div className="cli-docs-terminal__list" role="listbox" aria-label="CLI commands">
              {commands.map((entry, index) => {
                const activeRow = index === activeIndex;

                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="option"
                    aria-selected={activeRow}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    className={`cli-docs-terminal__row${activeRow ? " is-active" : ""}`}
                  >
                    <span className="cli-docs-terminal__row-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="cli-docs-terminal__row-label">{entry.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cli-docs-terminal__right">
            <div className="cli-docs-terminal__status-bar">
              <span>MODE DOCS</span>
              <span>ROW {activeRowCode}</span>
              <span>INPUT READY</span>
            </div>

            <div className="cli-docs-terminal__section-title">ACTIVE COMMAND</div>
            <div className="cli-docs-terminal__command-block">
              <span className="cli-docs-terminal__prompt">$</span>
              <span>{active.command}</span>
            </div>

            <div className="cli-docs-terminal__history">
              <div className="cli-docs-terminal__history-line">
                <span className="cli-docs-terminal__prompt">&gt;</span>
                <span>resolve command</span>
              </div>
              <div className="cli-docs-terminal__history-line">
                <span className="cli-docs-terminal__prompt">&gt;</span>
                <span>load help surface</span>
              </div>
              <div className="cli-docs-terminal__history-line is-active">
                <span className="cli-docs-terminal__prompt">&gt;</span>
                <span>{active.label.toLowerCase()}</span>
              </div>
            </div>

            <div className="cli-docs-terminal__meta-grid">
              <div>
                <div className="cli-docs-terminal__meta-label">ACTION</div>
                <div className="cli-docs-terminal__meta-value">{active.label}</div>
              </div>
              <div>
                <div className="cli-docs-terminal__meta-label">SHORTCUT</div>
                <div className="cli-docs-terminal__meta-value">{(active.shortcuts ?? []).join(" / ") || "-"}</div>
              </div>
            </div>

            <div className="cli-docs-terminal__section-title">WHAT IT DOES</div>
            <p className="cli-docs-terminal__body-copy">{active.purpose}</p>

            <div className="cli-docs-terminal__section-title">NOTES</div>
            <ul className="cli-docs-terminal__notes">
              {active.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>

            <div className="cli-docs-terminal__footer">
              <span>[↑/↓]</span>
              <span>[J/K]</span>
              <span>[1-7]</span>
              <span>HOVER TO PREVIEW</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
