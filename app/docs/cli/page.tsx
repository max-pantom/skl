import type { Metadata } from "next";

import { CliDocsTerminal } from "@/components/cli-docs-terminal";

export const metadata: Metadata = {
  title: "CLI Docs",
};

export default function CliDocsPage() {
  return (
    <div className="cli-docs-page">
      <div className="page-shell py-8 sm:py-10">
        <CliDocsTerminal />
      </div>
    </div>
  );
}
