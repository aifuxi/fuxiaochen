import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth";

export function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return new Response("Forbidden", { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
