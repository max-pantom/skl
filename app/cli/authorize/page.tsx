import type { Metadata } from "next";

import { FormNotice } from "@/components/form-notice";
import { approveCliAuthRequestAction, rejectCliAuthRequestAction } from "@/lib/actions";
import { requireCurrentViewer } from "@/lib/auth";
import { getCliAuthRequestByUserCode } from "@/lib/cli-auth";

export const metadata: Metadata = {
  title: "Authorize CLI",
};

type CliAuthorizePageProps = {
  searchParams: Promise<{
    error?: string;
    ok?: string;
    rejected?: string;
    user_code?: string;
  }>;
};

export default async function CliAuthorizePage({ searchParams }: CliAuthorizePageProps) {
  await requireCurrentViewer("/cli/authorize");
  const sp = await searchParams;
  const userCode = (sp.user_code ?? "").trim().toUpperCase();
  const request = userCode ? await getCliAuthRequestByUserCode(userCode) : null;
  const expired = request ? request.expiresAt.getTime() <= Date.now() : false;

  return (
    <div className="page-shell gap-8">
      <section className="mx-auto w-full max-w-[720px] space-y-6 border-t border-zinc-200 pt-8">
        <div className="space-y-2">
          <p className="page-kicker">CLI</p>
          <h1 className="page-title">Authorize terminal access</h1>
          <p className="text-[16px] font-medium text-[#8f8f8f]">
            Approve this request to connect the SKL CLI to your account.
          </p>
        </div>

        {sp.error ? <FormNotice tone="error">{sp.error}</FormNotice> : null}
        {sp.ok ? <FormNotice tone="success">CLI connected. You can return to the terminal.</FormNotice> : null}
        {sp.rejected ? <FormNotice tone="success">CLI login request rejected.</FormNotice> : null}

        <div className="rounded-[24px] border border-zinc-200 bg-[linear-gradient(145deg,#ffffff,rgba(244,244,240,0.98))] px-5 py-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#8f8f8f]">User code</p>
          <p className="mt-3 font-mono text-[28px] font-semibold tracking-[0.18em] text-[#242424]">
            {userCode || "Missing"}
          </p>
          <p className="mt-3 text-[15px] font-medium text-[#8f8f8f]">
            {request
              ? expired
                ? "This request expired. Start login again from the CLI."
                : request.approvedAt
                  ? "This request has already been approved."
                  : request.rejectedAt
                    ? "This request was already rejected."
                    : "Approve this to let the CLI publish and manage skills for your account."
              : "Open this page from the CLI-generated link so SKL can match the right device request."}
          </p>
        </div>

        {request && !expired && !request.approvedAt && !request.rejectedAt ? (
          <div className="flex flex-wrap gap-3">
            <form action={approveCliAuthRequestAction}>
              <input type="hidden" name="userCode" value={userCode} />
              <button type="submit" className="skl-btn skl-btn-secondary">
                Approve
              </button>
            </form>

            <form action={rejectCliAuthRequestAction}>
              <input type="hidden" name="userCode" value={userCode} />
              <button type="submit" className="skl-btn skl-btn-secondary">
                Reject
              </button>
            </form>
          </div>
        ) : null}
      </section>
    </div>
  );
}
