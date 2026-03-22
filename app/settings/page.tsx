import type { Metadata } from "next";

import { FormNotice } from "@/components/form-notice";
import { PageIntro } from "@/components/page-intro";
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
    <div className="page-shell gap-8">
      <PageIntro
        eyebrow="Account"
        title="Settings"
        description="These fields appear on your public profile."
      />

      {sp.error ? <FormNotice tone="error">{sp.error}</FormNotice> : null}
      {sp.ok ? <FormNotice tone="success">Profile updated.</FormNotice> : null}

      <form action={updateProfileAction} className="mx-auto w-full max-w-[720px] space-y-8 border-t border-zinc-200 pt-8">
        <p className="text-[16px] font-medium text-[#8f8f8f]">
          Profile URL:{" "}
          <span className="font-medium text-[#242424]">
            /u/{viewer.username}
          </span>{" "}
          — username is fixed after signup.
        </p>

        <p className="text-[16px] font-medium text-[#8f8f8f]">
          Role: <span className="font-medium uppercase text-[#242424]">{viewer.role}</span>
        </p>

        <label className="profile-field-row block">
          <span className="profile-field-label">Display name</span>
          <input
            name="displayName"
            required
            defaultValue={viewer.displayName}
            className="skl-input"
          />
        </label>

        <label className="profile-field-row block">
          <span className="profile-field-label">Bio</span>
          <textarea
            name="bio"
            rows={4}
            defaultValue={viewer.bio ?? ""}
            className="skl-input"
          />
        </label>

        <label className="profile-field-row block">
          <span className="profile-field-label">Website URL</span>
          <input
            name="website"
            type="url"
            placeholder="https://"
            defaultValue={viewer.website ?? ""}
            className="skl-input"
          />
        </label>

        <label className="profile-field-row block">
          <span className="profile-field-label">X / profile URL</span>
          <input
            name="xUrl"
            type="url"
            placeholder="https://x.com/…"
            defaultValue={viewer.xUrl ?? ""}
            className="skl-input"
          />
        </label>

        <label className="profile-field-row block">
          <span className="profile-field-label">Avatar image URL</span>
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
