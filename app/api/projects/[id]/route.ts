import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createProjectHandler } from "@/lib/project/project-handler";
import { createProjectRepository } from "@/lib/project/project-repository";
import { createProjectService } from "@/lib/project/project-service";

const projectHandler = createProjectHandler({
  requireSession: requireApiSession,
  service: createProjectService(createProjectRepository()),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  projectHandler.getProject(request, await context.params),
);

export const PATCH = handleRoute(async (request: Request, context: RouteContext) =>
  projectHandler.updateProject(request, await context.params),
);

export const DELETE = handleRoute(async (request: Request, context: RouteContext) =>
  projectHandler.deleteProject(request, await context.params),
);
