import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
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
      return withApiTiming(request, "admin.projects.list", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return adminProjectListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            featured: url.searchParams.get("featured") ?? undefined,
            published: url.searchParams.get("published") ?? undefined,
            year: url.searchParams.get("year") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listAdminProjects(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toAdminProject),
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
    async handleCreateProject(request: Request) {
      return withApiTiming(request, "admin.projects.create", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const body = await timing.time("parse", async () =>
          adminProjectCreateSchema.parse(await toJsonBody(request)),
        );
        const project = await timing.time("service", async () => {
          const createdProject = await service.createProject(body);
          revalidatePublicProjectContent();

          return createdProject;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminProject(project), undefined, 201),
        );
      });
    },
    async handleGetProject(request: Request, params: Promise<{ id: string }>) {
      return withApiTiming(request, "admin.projects.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminProjectIdParamsSchema.parse(await params),
        );
        const project = await timing.time("service", () =>
          service.getAdminProject(id),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminProject(project)),
        );
      });
    },
    async handleUpdateProject(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(request, "admin.projects.update", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id, body } = await timing.time("parse", async () => ({
          ...adminProjectIdParamsSchema.parse(await params),
          body: adminProjectUpdateSchema.parse(await toJsonBody(request)),
        }));
        const project = await timing.time("service", async () => {
          const updatedProject = await service.updateProject(id, body);
          revalidatePublicProjectContent();

          return updatedProject;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(toAdminProject(project)),
        );
      });
    },
    async handleDeleteProject(
      request: Request,
      params: Promise<{ id: string }>,
    ) {
      return withApiTiming(request, "admin.projects.delete", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const { id } = await timing.time("parse", async () =>
          adminProjectIdParamsSchema.parse(await params),
        );
        await timing.time("service", async () => {
          await service.deleteProject(id);
          revalidatePublicProjectContent();
        });

        return timing.timeSync("response", () => createSuccessResponse(null));
      });
    },
  };
}

export function createPublicProjectHandlers({
  serviceDeps,
  service = createProjectService(serviceDeps),
}: ProjectHandlerDeps = {}) {
  return {
    async handleListProjects(request: Request) {
      return withApiTiming(request, "public.projects.list", async (timing) => {
        const query = timing.timeSync("parse", () => {
          const url = new URL(request.url);
          return publicProjectListQuerySchema.parse({
            page: url.searchParams.get("page") ?? undefined,
            pageSize: url.searchParams.get("pageSize") ?? undefined,
            query: url.searchParams.get("query") ?? undefined,
            featured: url.searchParams.get("featured") ?? undefined,
            year: url.searchParams.get("year") ?? undefined,
            tag: url.searchParams.get("tag") ?? undefined,
            sortBy: url.searchParams.get("sortBy") ?? undefined,
            sortDirection: url.searchParams.get("sortDirection") ?? undefined,
          });
        });
        const result = await timing.time("service", () =>
          service.listPublicProjects(query),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            {
              items: result.items.map(toPublicProject),
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
    async handleGetProject(
      request: Request,
      params: Promise<{ slug: string }>,
    ) {
      return withApiTiming(request, "public.projects.get", async (timing) => {
        const { slug } = await timing.time("parse", async () =>
          publicProjectSlugParamsSchema.parse(await params),
        );
        const project = await timing.time("service", () =>
          service.getPublicProjectBySlug(slug),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(toPublicProject(project)),
        );
      });
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
