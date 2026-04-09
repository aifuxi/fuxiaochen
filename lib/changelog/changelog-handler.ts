import { successResponse } from "@/lib/api/response";
import type { ChangelogReleaseService } from "@/lib/changelog/changelog-service";
import type {
  CreateChangelogReleaseInput,
  ListChangelogReleasesQuery,
  UpdateChangelogReleaseInput,
} from "@/lib/changelog/changelog-dto";
import {
  changelogReleaseIdSchema,
  createChangelogReleaseBodySchema,
  listChangelogReleasesQuerySchema,
  updateChangelogReleaseBodySchema,
} from "@/lib/changelog/changelog-dto";

type ChangelogHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: ChangelogReleaseService;
};

type ChangelogRouteParams = {
  id: string;
};

type ListChangelogReleasesResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ChangelogReleaseHandler = {
  createRelease: (request: Request) => Promise<Response>;
  deleteRelease: (request: Request, params: ChangelogRouteParams) => Promise<Response>;
  getRelease: (request: Request, params: ChangelogRouteParams) => Promise<Response>;
  listReleases: (request: Request) => Promise<Response>;
  updateRelease: (request: Request, params: ChangelogRouteParams) => Promise<Response>;
};

export function createChangelogReleaseHandler(dependencies: ChangelogHandlerDependencies): ChangelogReleaseHandler {
  return {
    async createRelease(request) {
      await dependencies.requireSession(request);

      const input = createChangelogReleaseBodySchema.parse(await parseJsonBody<CreateChangelogReleaseInput>(request));
      const release = await dependencies.service.createRelease(input);

      return successResponse(release, {
        message: "Changelog release created successfully.",
        status: 201,
      });
    },
    async deleteRelease(request, params) {
      await dependencies.requireSession(request);

      const id = changelogReleaseIdSchema.parse(params.id);
      const deletedRelease = await dependencies.service.deleteRelease(id);

      return successResponse(deletedRelease, {
        message: "Changelog release deleted successfully.",
      });
    },
    async getRelease(request, params) {
      await dependencies.requireSession(request);

      const id = changelogReleaseIdSchema.parse(params.id);
      const release = await dependencies.service.getReleaseById(id);

      return successResponse(release, {
        message: "Changelog release fetched successfully.",
      });
    },
    async listReleases(request) {
      await dependencies.requireSession(request);

      const query = parseListReleasesQuery(request);
      const result = await dependencies.service.listReleases(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Changelog releases fetched successfully.",
          meta: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          } satisfies ListChangelogReleasesResponseMeta,
        },
      );
    },
    async updateRelease(request, params) {
      await dependencies.requireSession(request);

      const id = changelogReleaseIdSchema.parse(params.id);
      const input = updateChangelogReleaseBodySchema.parse(await parseJsonBody<UpdateChangelogReleaseInput>(request));
      const release = await dependencies.service.updateRelease(id, input);

      return successResponse(release, {
        message: "Changelog release updated successfully.",
      });
    },
  };
}

function parseListReleasesQuery(request: Request): ListChangelogReleasesQuery {
  const { searchParams } = new URL(request.url);

  return listChangelogReleasesQuerySchema.parse({
    isMajor: searchParams.get("isMajor") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
