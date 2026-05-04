import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const MAX_API_MOCK_DELAY_MS = 10_000;

const getApiMockDelayMs = () => {
  const rawDelay = process.env.API_MOCK_DELAY_MS;
  const delay = rawDelay ? Number.parseInt(rawDelay, 10) : 0;

  if (!Number.isFinite(delay) || delay <= 0) {
    return 0;
  }

  return Math.min(delay, MAX_API_MOCK_DELAY_MS);
};

const applyApiMockDelay = async () => {
  const delay = getApiMockDelayMs();

  if (delay === 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delay));
};

const setAdminApiNoStoreHeaders = (response: NextResponse) => {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
};

const isAdminApiPath = (pathname: string) =>
  pathname === "/api/admin" || pathname.startsWith("/api/admin/");

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminApiRequest = isAdminApiPath(pathname);
  const isPublicApiRequest = pathname.startsWith("/api/public");

  if (isAdminApiRequest || isPublicApiRequest) {
    await applyApiMockDelay();
  }

  if (isPublicApiRequest) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    if (isAdminApiRequest) {
      return setAdminApiNoStoreHeaders(NextResponse.next());
    }

    return NextResponse.next();
  }

  if (isAdminApiRequest) {
    return setAdminApiNoStoreHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: "COMMON_UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      ),
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/public/:path*"],
};
