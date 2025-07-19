import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { PATHS } from "./constants";

const isPublicRoute = createRouteMatcher([
  `${PATHS.SIGN_IN}(.*)`,
  `${PATHS.DASHBOARD}(.*)`,
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
