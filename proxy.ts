import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  getOrCreateRequestId,
  logApiProxyTiming,
} from "@/lib/server/api-timing";

const REQUEST_ID_HEADER = "x-request-id";

const getApiMockDelayMs = () => env.API_MOCK_DELAY_MS;

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

const createNextResponse = (request: NextRequest, requestId?: string) => {
  if (!requestId) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
};

const setRequestIdHeader = (response: NextResponse, requestId?: string) => {
  if (requestId) {
    response.headers.set(REQUEST_ID_HEADER, requestId);
  }

  return response;
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminApiRequest = isAdminApiPath(pathname);
  const isPublicApiRequest = pathname.startsWith("/api/public");
  const requestId =
    isAdminApiRequest || isPublicApiRequest
      ? getOrCreateRequestId(request.headers)
      : undefined;

  if (isAdminApiRequest || isPublicApiRequest) {
    await applyApiMockDelay();
  }

  if (isPublicApiRequest) {
    return createNextResponse(request, requestId);
  }

  const authStartedAt = performance.now();
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const proxyAuthMs = performance.now() - authStartedAt;

  if (isAdminApiRequest && requestId) {
    logApiProxyTiming({
      authenticated: Boolean(session),
      method: request.method,
      path: pathname,
      proxyAuthMs,
      requestId,
      status: session ? 200 : 401,
    });
  }

  if (session) {
    if (isAdminApiRequest) {
      return setAdminApiNoStoreHeaders(createNextResponse(request, requestId));
    }

    return NextResponse.next();
  }

  if (isAdminApiRequest) {
    return setAdminApiNoStoreHeaders(
      setRequestIdHeader(
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
        requestId,
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
