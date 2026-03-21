import "server-only";

import { headers } from "next/headers";

import { getAuth } from "@/lib/auth";

export async function getServerSession() {
  const auth = getAuth();
  if (!auth) {
    return null;
  }

  return auth.api.getSession({
    headers: await headers(),
  });
}
