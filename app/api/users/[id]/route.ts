import { handleRoute } from "@/lib/api/handle-route";
import { requireAdminApiSession } from "@/lib/api/require-api-session";
import { createUserHandler } from "@/lib/user/user-handler";
import { createUserRepository } from "@/lib/user/user-repository";
import { createUserService } from "@/lib/user/user-service";

const userHandler = createUserHandler({
  requireSession: requireAdminApiSession,
  service: createUserService(createUserRepository()),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = handleRoute(async (request: Request, context: RouteContext) =>
  userHandler.getUser(request, await context.params),
);

export const PATCH = handleRoute(async (request: Request, context: RouteContext) =>
  userHandler.updateUser(request, await context.params),
);

export const DELETE = handleRoute(async (request: Request, context: RouteContext) =>
  userHandler.deleteUser(request, await context.params),
);
