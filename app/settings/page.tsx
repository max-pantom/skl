import { FormNotice } from "@/components/form-notice";
import { SubmitButton } from "@/components/submit-button";
import { updateSettingsAction } from "@/lib/actions";
import { getCurrentViewer, isAppConfigured, requireCurrentViewer } from "@/lib/auth";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;

  if (!isAppConfigured()) {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Configure auth first</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Settings need Better Auth and the database configured before they can load a session.
        </p>
      </section>
    );
  }

  const viewer = await requireCurrentViewer("/settings");
  const currentViewer = await getCurrentViewer();

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Settings</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">Profile settings</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          Public profile fields here power authorship across skill pages and profile pages.
        </p>
      </div>

      {params.error ? <FormNotice tone="error">{params.error}</FormNotice> : null}
      {params.message ? <FormNotice tone="success">{params.message}</FormNotice> : null}

      <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        <div className="mb-6 rounded-[1.25rem] border border-stone-300 bg-white p-4 text-sm text-slate-600">
          Signed in as <span className="font-medium text-ink">{currentViewer?.email ?? viewer.email}</span>
        </div>

        <form action={updateSettingsAction} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Username</span>
              <input
                name="username"
                defaultValue={viewer.username}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Display name</span>
              <input
                name="displayName"
                defaultValue={viewer.displayName}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Bio</span>
            <textarea
              name="bio"
              defaultValue={viewer.bio ?? ""}
              rows={4}
              className="w-full rounded-[1.5rem] border border-stone-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Website</span>
              <input
                name="website"
                defaultValue={viewer.website ?? ""}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">X URL</span>
              <input
                name="xUrl"
                defaultValue={viewer.xUrl ?? ""}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
              />
            </label>
          </div>

          <SubmitButton
            pendingLabel="Saving..."
            className="rounded-full border border-ink bg-ink px-5 py-3 text-sm font-medium text-shell transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Save settings
          </SubmitButton>
        </form>
      </div>
    </section>
  );
}
