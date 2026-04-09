import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createChangelogReleaseHandler } from "@/lib/changelog/changelog-handler";
import { createChangelogReleaseRepository } from "@/lib/changelog/changelog-repository";
import { createChangelogReleaseService } from "@/lib/changelog/changelog-service";

const changelogReleaseHandler = createChangelogReleaseHandler({
  requireSession: requireApiSession,
  service: createChangelogReleaseService(createChangelogReleaseRepository()),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  changelogReleaseHandler.getRelease(request, await context.params),
);

export const PATCH = handleRoute(async (request: Request, context: RouteContext) =>
  changelogReleaseHandler.updateRelease(request, await context.params),
);

export const DELETE = handleRoute(async (request: Request, context: RouteContext) =>
  changelogReleaseHandler.deleteRelease(request, await context.params),
);
