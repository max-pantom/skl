import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "CLI Docs",
};

const installGlobal = "npm install -g @sklx/cli";
const expressAdd = 'skl add "crazy ideas to mvp"';
const npxAdd = 'npx @sklx/cli add "crazy ideas to mvp"';
const tuiOpen = "skl tui";
const loginCmd = "skl login";
const publishCmd = "skl publish";
const updateCmd = "skl update";

export default function CliDocsPage() {
  return (
    <div className="console-page">
      <div className="page-shell gap-10 py-10">
        <section className="console-frame rounded-[28px] px-6 py-6 sm:px-8">
          <div className="space-y-4">
            <p className="console-kicker">SKLX Terminal / CLI Manual</p>
            <h1 className="console-title">Command Console Quick Start</h1>
            <p className="console-copy max-w-[760px]">
              Install skills fast, open the terminal UI, link your account, and publish new skills from the command line.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="console-frame rounded-[24px] px-5 py-5">
            <p className="console-label">Install Global</p>
            <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[0.08em] text-[#ffb34a]">Get Skl</h2>
            <p className="console-copy mt-3">
              Install globally if you want the short <code className="font-mono text-[14px] text-[#ffcf87]">skl</code> command anywhere.
            </p>
            <pre className="console-command mt-4 overflow-x-auto rounded-[16px] px-4 py-3">{installGlobal}</pre>
            <p className="console-copy mt-4">One-off usage without global install:</p>
            <pre className="console-command mt-3 overflow-x-auto rounded-[16px] px-4 py-3">{npxAdd}</pre>
          </div>

          <div className="console-frame rounded-[24px] px-5 py-5">
            <p className="console-label">Express Mode</p>
            <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[0.08em] text-[#ffb34a]">Add A Skill Fast</h2>
            <p className="console-copy mt-3">
              Use <code className="font-mono text-[14px] text-[#ffcf87]">add</code> for the fastest install flow. Pass a slug or a search phrase.
            </p>
            <pre className="console-command mt-4 overflow-x-auto rounded-[16px] px-4 py-3">{expressAdd}</pre>
            <p className="console-copy mt-4">If multiple skills match, SKL asks you which one to install.</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="console-frame rounded-[24px] px-5 py-5">
            <p className="console-label">Terminal UI</p>
            <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[0.08em] text-[#ffb34a]">Open The Tui</h2>
            <p className="console-copy mt-3">
              Use the terminal UI for install, inspect, auth, publish, and update flows.
            </p>
            <pre className="console-command mt-4 overflow-x-auto rounded-[16px] px-4 py-3">{tuiOpen}</pre>
          </div>

          <div className="console-frame rounded-[24px] px-5 py-5">
            <p className="console-label">Account Link</p>
            <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[0.08em] text-[#ffb34a]">Connect The Cli</h2>
            <p className="console-copy mt-3">
              Login opens a browser approval flow and links the CLI to your SKL account.
            </p>
            <pre className="console-command mt-4 overflow-x-auto rounded-[16px] px-4 py-3">{loginCmd}</pre>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="console-frame rounded-[24px] px-5 py-5">
            <p className="console-label">Publish</p>
            <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[0.08em] text-[#ffb34a]">Ship A New Skill</h2>
            <p className="console-copy mt-3">
              Run publish from a folder that contains a <code className="font-mono text-[14px] text-[#ffcf87]">SKILL.md</code> entry file.
            </p>
            <pre className="console-command mt-4 overflow-x-auto rounded-[16px] px-4 py-3">{publishCmd}</pre>
          </div>

          <div className="console-frame rounded-[24px] px-5 py-5">
            <p className="console-label">Update</p>
            <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[0.08em] text-[#ffb34a]">Push New Version</h2>
            <p className="console-copy mt-3">
              Run update from the same linked project folder to publish the next version.
            </p>
            <pre className="console-command mt-4 overflow-x-auto rounded-[16px] px-4 py-3">{updateCmd}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}
