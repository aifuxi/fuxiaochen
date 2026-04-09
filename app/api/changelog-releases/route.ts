import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createChangelogReleaseHandler } from "@/lib/changelog/changelog-handler";
import { createChangelogReleaseRepository } from "@/lib/changelog/changelog-repository";
import { createChangelogReleaseService } from "@/lib/changelog/changelog-service";

const changelogReleaseHandler = createChangelogReleaseHandler({
  requireSession: requireApiSession,
  service: createChangelogReleaseService(createChangelogReleaseRepository()),
});

export const GET = handleRoute(async (request: Request) => changelogReleaseHandler.listReleases(request));

export const POST = handleRoute(async (request: Request) => changelogReleaseHandler.createRelease(request));
