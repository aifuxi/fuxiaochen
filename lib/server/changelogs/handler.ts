import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

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
      try {
        const url = new URL(request.url);
        const query = changelogListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          type: url.searchParams.get("type") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listChangelogs(query);

        return createSuccessResponse(
          {
            items: result.items.map(toAdminChangelog),
          },
          {
            page: query.page,
            pageSize: query.pageSize,
            total: result.total,
          },
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleCreateChangelog(request: Request) {
      try {
        const body = adminChangelogCreateSchema.parse(
          await toJsonBody(request),
        );
        const changelog = await service.createChangelog(body);

        return createSuccessResponse(
          toAdminChangelog(changelog),
          undefined,
          201,
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetChangelog(
      _request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = adminChangelogIdParamsSchema.parse(await params);
        const changelog = await service.getAdminChangelog(id);

        return createSuccessResponse(toAdminChangelog(changelog));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateChangelog(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = adminChangelogIdParamsSchema.parse(await params);
        const body = adminChangelogUpdateSchema.parse(
          await toJsonBody(request),
        );
        const changelog = await service.updateChangelog(id, body);

        return createSuccessResponse(toAdminChangelog(changelog));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteChangelog(
      _request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = adminChangelogIdParamsSchema.parse(await params);
        await service.deleteChangelog(id);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

export function createPublicChangelogHandlers({
  serviceDeps,
  service = createChangelogService(serviceDeps),
}: ChangelogHandlerDeps = {}) {
  return {
    async handleListChangelogs(request: Request) {
      try {
        const url = new URL(request.url);
        const query = changelogListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          type: url.searchParams.get("type") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listChangelogs(query);

        return createSuccessResponse(
          {
            items: result.items.map(toPublicChangelog),
          },
          {
            page: query.page,
            pageSize: query.pageSize,
            total: result.total,
          },
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetChangelog(
      _request: Request,
      params: Promise<{ version: string }>,
    ) {
      try {
        const { version } = publicChangelogVersionParamsSchema.parse(
          await params,
        );
        const changelog = await service.getPublicChangelogByVersion(version);

        return createSuccessResponse(toPublicChangelog(changelog));
      } catch (error) {
        return toErrorResponse(error);
      }
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
