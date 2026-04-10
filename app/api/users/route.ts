import { handleRoute } from "@/lib/api/handle-route";
import { requireAdminApiSession } from "@/lib/api/require-api-session";
import { createUserHandler } from "@/lib/user/user-handler";
import { createUserRepository } from "@/lib/user/user-repository";
import { createUserService } from "@/lib/user/user-service";

const userHandler = createUserHandler({
  requireSession: requireAdminApiSession,
  service: createUserService(createUserRepository()),
});

export const GET = handleRoute(async (request: Request) => userHandler.listUsers(request));

export const POST = handleRoute(async (request: Request) => userHandler.createUser(request));
