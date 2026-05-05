import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { createSuccessResponse } from "@/lib/server/http/response";
import { revalidatePublicChangelogContent } from "@/lib/server/public-content-cache";

import {
  adminChangelogCreateSchema,
  adminChangelogIdParamsSchema,
  adminChangelogUpdateSchema,
  changelogListQuerySchema,
  publicChangelogVersionParamsSchema,
} from "./dto";
import { toAdminChangelog, toPublicChangelog } from "./mappers";
import {
  createChangelogService,
  type ChangelogService,
  type ChangelogServiceDeps,
} from "./service";

import { ERROR_CODES } from "../http/error-codes";
import { AppError } from "../http/errors";

const toJsonBody = async (request: Request) => {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new AppError(
      ERROR_CODES.COMMON_INVALID_REQUEST,
      "Invalid JSON body",
      400,
    );
  }
};

type ChangelogHandlerDeps = {
  service?: ChangelogService;
  serviceDeps?: ChangelogServiceDeps;
};

export function createAdminChangelogHandlers({
  serviceDeps,
  service = createChangelogService(serviceDeps),
}: ChangelogHandlerDeps = {}) {
  return {
    async handleListChangelogs(request: Request) {
      return withApiTiming(request, "admin.changelogs.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return changelogListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            type: url.searchParams.get("type") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listChangelogs(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminChangelog),
            },
            {
              page: query.page,
              pageSize: query.pageSize,
              total: result.total,
            },
          ),
        );
      });
    },
    async handleCreateChangelog(request: Request) {
      return withApiTiming(
        request,
        "admin.changelogs.create",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);

          const body = await timing.time("parse", async () =>
            adminChangelogCreateSchema.parse(await toJsonBody(request)),
          );
          const changelog = await timing.time("service", async () => {
            const createdChangelog = await service.createChangelog(body);
            revalidatePublicChangelogContent();

            return createdChangelog;
          });

          return timing.timeSync("response", () =>
            createSuccessResponse(toAdminChangelog(changelog), undefined, 201),
          );
        },
      );
    },
    async handleGetChangelog(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(request, "admin.changelogs.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminChangelogIdParamsSchema.parse(await params),
        );
        const changelog = await timing.time("service", () =>
          service.getAdminChangelog(id),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminChangelog(changelog)),
        );
      });
    },
    async handleUpdateChangelog(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(
        request,
        "admin.changelogs.update",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);

          const { id, body } = await timing.time("parse", async () => ({
            ...adminChangelogIdParamsSchema.parse(await params),
            body: adminChangelogUpdateSchema.parse(await toJsonBody(request)),
          }));
          const changelog = await timing.time("service", async () => {
            const updatedChangelog = await service.updateChangelog(id, body);
            revalidatePublicChangelogContent();

            return updatedChangelog;
          });

          return timing.timeSync("response", () =>
            createSuccessResponse(toAdminChangelog(changelog)),
          );
        },
      );
    },
    async handleDeleteChangelog(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(
        request,
        "admin.changelogs.delete",
        async (timing) => {
          const session = await timing.time("auth", () =>
            requireAdminRequestSession(request),
          );
          timing.setSession(session);

          const { id } = await timing.time("parse", async () =>
            adminChangelogIdParamsSchema.parse(await params),
          );
          await timing.time("service", async () => {
            await service.deleteChangelog(id);
            revalidatePublicChangelogContent();
          });

          return timing.timeSync("response", () => createSuccessResponse(null));
        },
      );
    },
  };
}

export function createPublicChangelogHandlers({
  serviceDeps,
  service = createChangelogService(serviceDeps),
}: ChangelogHandlerDeps = {}) {
  return {
    async handleListChangelogs(request: Request) {
      return withApiTiming(
        request,
        "public.changelogs.list",
        async (timing) => {
          const query = timing.timeSync("parse", () => {
            const url = new URL(request.url);
            return changelogListQuerySchema.parse({
              page: url.searchParams.get("page") ?? undefined,
              pageSize: url.searchParams.get("pageSize") ?? undefined,
              query: url.searchParams.get("query") ?? undefined,
              type: url.searchParams.get("type") ?? undefined,
              sortBy: url.searchParams.get("sortBy") ?? undefined,
              sortDirection: url.searchParams.get("sortDirection") ?? undefined,
            });
          });
          const result = await timing.time("service", () =>
            service.listChangelogs(query),
          );

          return timing.timeSync("response", () =>
            createSuccessResponse(
              {
                items: result.items.map(toPublicChangelog),
              },
              {
                page: query.page,
                pageSize: query.pageSize,
                total: result.total,
              },
            ),
          );
        },
      );
    },
    async handleGetChangelog(
      request: Request,
      params: Promise<{ version: string }>,
    ) {
      return withApiTiming(request, "public.changelogs.get", async (timing) => {
        const { version } = await timing.time("parse", async () =>
          publicChangelogVersionParamsSchema.parse(await params),
        );
        const changelog = await timing.time("service", () =>
          service.getPublicChangelogByVersion(version),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toPublicChangelog(changelog)),
        );
      });
    },
  };
}

const defaultAdminHandlers = createAdminChangelogHandlers();
const defaultPublicHandlers = createPublicChangelogHandlers();

export const handleAdminListChangelogs =
  defaultAdminHandlers.handleListChangelogs;
export const handleAdminCreateChangelog =
  defaultAdminHandlers.handleCreateChangelog;
export const handleAdminGetChangelog = defaultAdminHandlers.handleGetChangelog;
export const handleAdminUpdateChangelog =
  defaultAdminHandlers.handleUpdateChangelog;
export const handleAdminDeleteChangelog =
  defaultAdminHandlers.handleDeleteChangelog;

export const handlePublicListChangelogs =
  defaultPublicHandlers.handleListChangelogs;
export const handlePublicGetChangelog =
  defaultPublicHandlers.handleGetChangelog;
