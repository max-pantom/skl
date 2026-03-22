import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormNotice } from "@/components/form-notice";
import { PageIntro } from "@/components/page-intro";
import { completeProfileSetupAction } from "@/lib/actions";
import { requireCurrentViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Finish account",
};

type WelcomePageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const viewer = await requireCurrentViewer("/login");
  const sp = await searchParams;
  const nextPath = sp.next?.trim() || "/explore";

  if (!viewer.needsProfileSetup) {
    redirect(nextPath);
  }

  return (
    <div className="page-shell gap-8">
      <PageIntro
        eyebrow="Account"
        title="Finish your profile"
        description="Choose the username and display name you want to use on SKL."
      />

      {sp.error ? <FormNotice tone="error">{sp.error}</FormNotice> : null}

      <form action={completeProfileSetupAction} className="mx-auto w-full max-w-[720px] space-y-8 border-t border-zinc-200 pt-8">
        <input type="hidden" name="next" value={nextPath} />

        <label className="profile-field-row block">
          <span className="profile-field-label">Username</span>
          <input
            name="username"
            required
            minLength={3}
            defaultValue={viewer.username}
            className="skl-input"
          />
          <span className="profile-field-help">Lowercase letters, numbers, and hyphens. Used in your profile URL.</span>
        </label>

        <label className="profile-field-row block">
          <span className="profile-field-label">Display name</span>
          <input
            name="displayName"
            required
            minLength={3}
            defaultValue={viewer.displayName}
            className="skl-input"
          />
        </label>

        <div className="flex justify-end pt-2">
          <button type="submit" className="skl-btn skl-btn-secondary">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
