import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";
import { revalidatePublicProjectContent } from "@/lib/server/public-content-cache";

import {
  adminProjectCreateSchema,
  adminProjectIdParamsSchema,
  adminProjectListQuerySchema,
  adminProjectUpdateSchema,
  publicProjectListQuerySchema,
  publicProjectSlugParamsSchema,
} from "./dto";
import { toAdminProject, toPublicProject } from "./mappers";
import {
  createProjectService,
  type ProjectService,
  type ProjectServiceDeps,
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

type ProjectHandlerDeps = {
  service?: ProjectService;
  serviceDeps?: ProjectServiceDeps;
};

export function createAdminProjectHandlers({
  serviceDeps,
  service = createProjectService(serviceDeps),
}: ProjectHandlerDeps = {}) {
  return {
    async handleListProjects(request: Request) {
      try {
        await requireRequestSession(request);

        const url = new URL(request.url);
        const query = adminProjectListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          featured: url.searchParams.get("featured") ?? undefined,
          published: url.searchParams.get("published") ?? undefined,
          year: url.searchParams.get("year") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listAdminProjects(query);

        return createSuccessResponse(
          {
            items: result.items.map(toAdminProject),
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
    async handleCreateProject(request: Request) {
      try {
        await requireAdminRequestSession(request);

        const body = adminProjectCreateSchema.parse(await toJsonBody(request));
        const project = await service.createProject(body);

        revalidatePublicProjectContent();

        return createSuccessResponse(toAdminProject(project), undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleGetProject(request: Request, params: Promise<{ id: string }>) {
      try {
        await requireRequestSession(request);

        const { id } = adminProjectIdParamsSchema.parse(await params);
        const project = await service.getAdminProject(id);

        return createSuccessResponse(toAdminProject(project));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateProject(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminProjectIdParamsSchema.parse(await params);
        const body = adminProjectUpdateSchema.parse(await toJsonBody(request));
        const project = await service.updateProject(id, body);

        revalidatePublicProjectContent();

        return createSuccessResponse(toAdminProject(project));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleDeleteProject(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      try {
        await requireAdminRequestSession(request);

        const { id } = adminProjectIdParamsSchema.parse(await params);
        await service.deleteProject(id);

        revalidatePublicProjectContent();

        return createSuccessResponse(null);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

export function createPublicProjectHandlers({
  serviceDeps,
  service = createProjectService(serviceDeps),
}: ProjectHandlerDeps = {}) {
  return {
    async handleListProjects(request: Request) {
      try {
        const url = new URL(request.url);
        const query = publicProjectListQuerySchema.parse({
          page: url.searchParams.get("page") ?? undefined,
          pageSize: url.searchParams.get("pageSize") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
          featured: url.searchParams.get("featured") ?? undefined,
          year: url.searchParams.get("year") ?? undefined,
          tag: url.searchParams.get("tag") ?? undefined,
          sortBy: url.searchParams.get("sortBy") ?? undefined,
          sortDirection: url.searchParams.get("sortDirection") ?? undefined,
        });
        const result = await service.listPublicProjects(query);

        return createSuccessResponse(
          {
            items: result.items.map(toPublicProject),
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
    async handleGetProject(
      _request: Request,
      params: Promise<{ slug: string }>,
    ) {
      try {
        const { slug } = publicProjectSlugParamsSchema.parse(await params);
        const project = await service.getPublicProjectBySlug(slug);

        return createSuccessResponse(toPublicProject(project));
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultAdminHandlers = createAdminProjectHandlers();
const defaultPublicHandlers = createPublicProjectHandlers();

export const handleAdminListProjects = defaultAdminHandlers.handleListProjects;
export const handleAdminCreateProject =
  defaultAdminHandlers.handleCreateProject;
export const handleAdminGetProject = defaultAdminHandlers.handleGetProject;
export const handleAdminUpdateProject =
  defaultAdminHandlers.handleUpdateProject;
export const handleAdminDeleteProject =
  defaultAdminHandlers.handleDeleteProject;

export const handlePublicListProjects =
  defaultPublicHandlers.handleListProjects;
export const handlePublicGetProject = defaultPublicHandlers.handleGetProject;
