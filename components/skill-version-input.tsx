"use client";

import { useState } from "react";

import { bumpMajorSemver, bumpMinorSemver, bumpPatchSemver } from "@/lib/utils";

export function SkillVersionInput({ currentVersion }: { currentVersion: string }) {
  const suggestedVersion = bumpMajorSemver(currentVersion);
  const minorVersion = bumpMinorSemver(currentVersion);
  const patchVersion = bumpPatchSemver(currentVersion);
  const [value, setValue] = useState("");

  const quickActions = [
    { label: "+1.0.0", value: suggestedVersion },
    { label: "+0.1.0", value: minorVersion },
    { label: "+0.0.1", value: patchVersion },
  ];

  return (
    <div className="publish-form-row">
      <label className="publish-form-label" htmlFor="edit-version">
        Next version
      </label>
      <input
        id="edit-version"
        name="version"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={`Leave blank for v${suggestedVersion}`}
        aria-describedby="edit-version-help"
        className="publish-form-input"
      />
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => setValue(action.value)}
            className={`rounded-full px-3 py-1.5 text-[14px] font-medium transition ${
              value === action.value
                ? "bg-[#242424] text-white"
                : "bg-[rgba(228,228,228,0.8)] text-[#6f6f6f] hover:bg-[rgba(228,228,228,0.95)] hover:text-[#242424]"
            }`}
          >
            {action.label}
          </button>
        ))}
        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            className="rounded-full px-3 py-1.5 text-[14px] font-medium text-[#8f8f8f] underline decoration-dotted underline-offset-4 transition hover:text-[#242424]"
          >
            Clear
          </button>
        ) : null}
      </div>
      <p id="edit-version-help" className="text-[14px] font-medium leading-[1.45] text-[#8f8f8f]">
        Blank means <span className="text-[#242424]">v{suggestedVersion}</span>. Pick a quick bump or type any higher
        semantic version manually.
      </p>
    </div>
  );
}
