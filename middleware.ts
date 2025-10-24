import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

import { PATHS } from "./constants";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie) {
    return NextResponse.redirect(new URL(PATHS.AUTH_SIGN_IN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: `/admin/:path*`,
};
