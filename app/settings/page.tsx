import type { Metadata } from "next";

import { FormNotice } from "@/components/form-notice";
import { SectionHeading } from "@/components/section-heading";
import { updateProfileAction } from "@/lib/actions";
import { requireCurrentViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings",
};

type SettingsPageProps = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const viewer = await requireCurrentViewer("/settings");
  const sp = await searchParams;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Account"
        title="Settings"
        description="These fields appear on your public profile. Email and password are managed through Better Auth; change password flows can be added later."
      />

      {sp.error ? <FormNotice tone="error">{sp.error}</FormNotice> : null}
      {sp.ok ? <FormNotice tone="success">Profile updated.</FormNotice> : null}

      <form action={updateProfileAction} className="skl-surface mx-auto max-w-xl space-y-5 p-6">
        <p className="text-sm text-zinc-600">
          Profile URL:{" "}
          <span className="font-mono text-ink">
            /u/{viewer.username}
          </span>{" "}
          — username is fixed after signup.
        </p>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Display name</span>
          <input
            name="displayName"
            required
            defaultValue={viewer.displayName}
            className="skl-input"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Bio</span>
          <textarea
            name="bio"
            rows={4}
            defaultValue={viewer.bio ?? ""}
            className="skl-input"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Website URL</span>
          <input
            name="website"
            type="url"
            placeholder="https://"
            defaultValue={viewer.website ?? ""}
            className="skl-input"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">X / profile URL</span>
          <input
            name="xUrl"
            type="url"
            placeholder="https://x.com/…"
            defaultValue={viewer.xUrl ?? ""}
            className="skl-input"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Avatar image URL</span>
          <input
            name="avatarUrl"
            type="url"
            placeholder="https://"
            defaultValue={viewer.avatarUrl ?? ""}
            className="skl-input"
          />
        </label>

        <button type="submit" className="skl-btn skl-btn-primary">
          Save profile
        </button>
      </form>
    </div>
  );
}
