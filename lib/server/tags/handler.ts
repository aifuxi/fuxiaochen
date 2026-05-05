import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { createSuccessResponse } from "@/lib/server/http/response";
import { revalidatePublicTagContent } from "@/lib/server/public-content-cache";

import {
  adminTagCreateSchema,
  adminTagIdParamsSchema,
  adminTagListQuerySchema,
  adminTagUpdateSchema,
} from "./dto";
import { toAdminTag, toPublicTag } from "./mappers";
import {
  createTagService,
  type TagService,
  type TagServiceDeps,
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

type TagHandlerDeps = {
  service?: TagService;
  serviceDeps?: TagServiceDeps;
};

export function createAdminTagHandlers({
  serviceDeps,
  service = createTagService(serviceDeps),
}: TagHandlerDeps = {}) {
  return {
    async handleListTags(request: Request) {
      return withApiTiming(request, "admin.tags.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return adminTagListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            includeCounts: url.searchParams.get("includeCounts") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listAdminTags(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminTag),
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
    async handleCreateTag(request: Request) {
      return withApiTiming(request, "admin.tags.create", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const body = await timing.time("parse", async () =>
          adminTagCreateSchema.parse(await toJsonBody(request)),
        );
        const tag = await timing.time("service", async () => {
          const createdTag = await service.createTag(body);
          revalidatePublicTagContent();

          return createdTag;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminTag(tag), undefined, 201),
        );
      });
    },
    async handleGetTag(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.tags.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminTagIdParamsSchema.parse(await params),
        );
        const tag = await timing.time("service", () => service.getTag(id));

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminTag(tag)),
        );
      });
    },
    async handleUpdateTag(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.tags.update", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id, body } = await timing.time("parse", async () => ({
          ...adminTagIdParamsSchema.parse(await params),
          body: adminTagUpdateSchema.parse(await toJsonBody(request)),
        }));
        const tag = await timing.time("service", async () => {
          const updatedTag = await service.updateTag(id, body);
          revalidatePublicTagContent();

          return updatedTag;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminTag(tag)),
        );
      });
    },
    async handleDeleteTag(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.tags.delete", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminTagIdParamsSchema.parse(await params),
        );
        await timing.time("service", async () => {
          await service.deleteTag(id);
          revalidatePublicTagContent();
        });

        return timing.timeSync("response", () => createSuccessResponse(null));
      });
    },
  };
}

export function createPublicTagHandlers({
  serviceDeps,
  service = createTagService(serviceDeps),
}: TagHandlerDeps = {}) {
  return {
    async handleListTags(request?: Request) {
      return withApiTiming(request, "public.tags.list", async (timing) => {
        const tags = await timing.time("service", () =>
          service.listPublicTags(),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse({
            items: tags.map(toPublicTag),
          }),
        );
      });
    },
  };
}

const defaultAdminHandlers = createAdminTagHandlers();
const defaultPublicHandlers = createPublicTagHandlers();

export const handleAdminListTags = defaultAdminHandlers.handleListTags;
export const handleAdminCreateTag = defaultAdminHandlers.handleCreateTag;
export const handleAdminGetTag = defaultAdminHandlers.handleGetTag;
export const handleAdminUpdateTag = defaultAdminHandlers.handleUpdateTag;
export const handleAdminDeleteTag = defaultAdminHandlers.handleDeleteTag;

export const handlePublicListTags = defaultPublicHandlers.handleListTags;
