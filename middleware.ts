import { auth } from "@/lib/auth";

import { INTERNAL_PATHS } from "./constants/path";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== INTERNAL_PATHS.DASHBOARD_SIGN_IN) {
    const newUrl = new URL(
      INTERNAL_PATHS.DASHBOARD_SIGN_IN,
      req.nextUrl.origin,
    );
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|fonts|favicon.ico).*)"],
};
