import { NextResponse } from "next/server";

import { syncViewerFromAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/settings";

  const supabase = await createSupabaseServerClient();

  if (supabase && code) {
    await supabase.auth.exchangeCodeForSession(code);
    await syncViewerFromAuth();
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

