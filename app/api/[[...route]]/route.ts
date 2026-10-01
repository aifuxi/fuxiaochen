import { handle } from "@hono/vercel";

import { api } from "@/lib/api";

export const runtime = "nodejs";
export const POST = handle(api);
