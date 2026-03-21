import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const auth = getAuth();
const handlers = auth ? toNextJsHandler(auth) : null;

function unavailable() {
  return new Response(
    "Authentication is not configured. Set DATABASE_URL and BETTER_AUTH_SECRET in your environment.",
    { status: 503 },
  );
}

export const GET = handlers?.GET ?? (async () => unavailable());
export const POST = handlers?.POST ?? (async () => unavailable());
