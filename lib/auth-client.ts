"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

/**
 * Use the live page origin in the browser so auth calls stay same-origin. If `NEXT_PUBLIC_APP_URL`
 * is `https://example.com` but users visit `https://www.example.com`, pointing the client at the
 * env URL triggers cross-origin requests; preflight OPTIONS can fail when the host redirects
 * (browsers disallow redirects on CORS preflight).
 */
function clientBaseURL() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: clientBaseURL(),
  plugins: [emailOTPClient()],
});
