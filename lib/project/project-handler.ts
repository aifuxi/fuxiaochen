import { successResponse } from "@/lib/api/response";
import type { ProjectService } from "@/lib/project/project-service";
import type { CreateProjectInput, ListProjectsQuery, UpdateProjectInput } from "@/lib/project/project-dto";
import {
  createProjectBodySchema,
  listProjectsQuerySchema,
  projectIdSchema,
  updateProjectBodySchema,
} from "@/lib/project/project-dto";

type ProjectHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: ProjectService;
};

type ProjectRouteParams = {
  id: string;
};

type ListProjectsResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProjectHandler = {
  createProject: (request: Request) => Promise<Response>;
  deleteProject: (request: Request, params: ProjectRouteParams) => Promise<Response>;
  getProject: (request: Request, params: ProjectRouteParams) => Promise<Response>;
  listProjects: (request: Request) => Promise<Response>;
  updateProject: (request: Request, params: ProjectRouteParams) => Promise<Response>;
};

export function createProjectHandler(dependencies: ProjectHandlerDependencies): ProjectHandler {
  return {
    async createProject(request) {
      await dependencies.requireSession(request);

      const input = createProjectBodySchema.parse(await parseJsonBody<CreateProjectInput>(request));
      const project = await dependencies.service.createProject(input);

      return successResponse(project, {
        message: "Project created successfully.",
        status: 201,
      });
    },
    async deleteProject(request, params) {
      await dependencies.requireSession(request);

      const id = projectIdSchema.parse(params.id);
      const deletedProject = await dependencies.service.deleteProject(id);

      return successResponse(deletedProject, {
        message: "Project deleted successfully.",
      });
    },
    async getProject(request, params) {
      await dependencies.requireSession(request);

      const id = projectIdSchema.parse(params.id);
      const project = await dependencies.service.getProjectById(id);

      return successResponse(project, {
        message: "Project fetched successfully.",
      });
    },
    async listProjects(request) {
      await dependencies.requireSession(request);

      const query = parseListProjectsQuery(request);
      const result = await dependencies.service.listProjects(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Projects fetched successfully.",
          meta: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          } satisfies ListProjectsResponseMeta,
        },
      );
    },
    async updateProject(request, params) {
      await dependencies.requireSession(request);

      const id = projectIdSchema.parse(params.id);
      const input = updateProjectBodySchema.parse(await parseJsonBody<UpdateProjectInput>(request));
      const project = await dependencies.service.updateProject(id, input);

      return successResponse(project, {
        message: "Project updated successfully.",
      });
    },
  };
}

function parseListProjectsQuery(request: Request): ListProjectsQuery {
  const { searchParams } = new URL(request.url);

  return listProjectsQuerySchema.parse({
    category: searchParams.get("category") ?? undefined,
    isFeatured: searchParams.get("isFeatured") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
