import type { Metadata } from "next";

import { CliDocsTerminal } from "@/components/cli-docs-terminal";

export const metadata: Metadata = {
  title: "CLI Docs",
};

export default function CliDocsPage() {
  return (
    <div className="cli-docs-page">
      <div className="page-shell pt-[4.4375rem] pb-6 sm:pt-[4.4375rem] sm:pb-6">
        <CliDocsTerminal />
      </div>
    </div>
  );
}
