import { NextRequest, NextResponse } from "next/server";

import { createSession, SESSION_COOKIE, SESSION_MAX_AGE, validCredentials } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return new Response("Forbidden", { status: 403 });
  }

  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !validCredentials(username, password)
  ) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }

  const session = createSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
