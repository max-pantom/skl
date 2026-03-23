import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Native bindings — do not let webpack parse .node files (Vercel Linux build).
  serverExternalPackages: ["@resvg/resvg-js"],
};

export default nextConfig;
