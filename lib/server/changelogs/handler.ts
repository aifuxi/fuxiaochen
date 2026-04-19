import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  changelogCreateSchema,
  changelogIdParamsSchema,
  changelogListQuerySchema,
  changelogUpdateSchema,
} from "./dto";
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

export function createChangelogHandlers({
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
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listChangelogs(query);

        return createSuccessResponse(
          {
            items: result.items,
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
        const body = changelogCreateSchema.parse(await toJsonBody(request));
        const changelog = await service.createChangelog(body);

        return createSuccessResponse(changelog, undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetChangelog(
      _request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = changelogIdParamsSchema.parse(await params);
        const changelog = await service.getChangelog(id);

        return createSuccessResponse(changelog);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateChangelog(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = changelogIdParamsSchema.parse(await params);
        const body = changelogUpdateSchema.parse(await toJsonBody(request));
        const changelog = await service.updateChangelog(id, body);

        return createSuccessResponse(changelog);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteChangelog(
      _request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        const { id } = changelogIdParamsSchema.parse(await params);
        await service.deleteChangelog(id);

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultHandlers = createChangelogHandlers();

export const handleListChangelogs = defaultHandlers.handleListChangelogs;
export const handleCreateChangelog = defaultHandlers.handleCreateChangelog;
export const handleGetChangelog = defaultHandlers.handleGetChangelog;
export const handleUpdateChangelog = defaultHandlers.handleUpdateChangelog;
export const handleDeleteChangelog = defaultHandlers.handleDeleteChangelog;
