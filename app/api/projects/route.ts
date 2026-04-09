import { handleRoute } from "@/lib/api/handle-route";
import { requireApiSession } from "@/lib/api/require-api-session";
import { createProjectHandler } from "@/lib/project/project-handler";
import { createProjectRepository } from "@/lib/project/project-repository";
import { createProjectService } from "@/lib/project/project-service";

const projectHandler = createProjectHandler({
  requireSession: requireApiSession,
  service: createProjectService(createProjectRepository()),
});

export const GET = handleRoute(async (request: Request) => projectHandler.listProjects(request));

export const POST = handleRoute(async (request: Request) => projectHandler.createProject(request));
