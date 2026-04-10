import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from "@/lib/user/user-dto";
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
  userIdSchema,
} from "@/lib/user/user-dto";
import { successResponse } from "@/lib/api/response";
import type { UserService } from "@/lib/user/user-service";

type UserHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: UserService;
};

type UserRouteParams = {
  id: string;
};

type ListUsersResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type UserHandler = {
  createUser: (request: Request) => Promise<Response>;
  deleteUser: (request: Request, params: UserRouteParams) => Promise<Response>;
  getUser: (request: Request, params: UserRouteParams) => Promise<Response>;
  listUsers: (request: Request) => Promise<Response>;
  updateUser: (request: Request, params: UserRouteParams) => Promise<Response>;
};

export function createUserHandler(dependencies: UserHandlerDependencies): UserHandler {
  return {
    async createUser(request) {
      await dependencies.requireSession(request);

      const input = createUserBodySchema.parse(await parseJsonBody<CreateUserInput>(request));
      const user = await dependencies.service.createUser(input);

      return successResponse(user, {
        message: "User created successfully.",
        status: 201,
      });
    },
    async deleteUser(request, params) {
      await dependencies.requireSession(request);

      const id = userIdSchema.parse(params.id);
      const deletedUser = await dependencies.service.deleteUser(id);

      return successResponse(deletedUser, {
        message: "User deleted successfully.",
      });
    },
    async getUser(request, params) {
      await dependencies.requireSession(request);

      const id = userIdSchema.parse(params.id);
      const user = await dependencies.service.getUserById(id);

      return successResponse(user, {
        message: "User fetched successfully.",
      });
    },
    async listUsers(request) {
      await dependencies.requireSession(request);

      const query = parseListUsersQuery(request);
      const result = await dependencies.service.listUsers(query);

      return successResponse(
        {
          items: result.items,
        },
        {
          message: "Users fetched successfully.",
          meta: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          } satisfies ListUsersResponseMeta,
        },
      );
    },
    async updateUser(request, params) {
      await dependencies.requireSession(request);

      const id = userIdSchema.parse(params.id);
      const input = updateUserBodySchema.parse(await parseJsonBody<UpdateUserInput>(request));
      const user = await dependencies.service.updateUser(id, input);

      return successResponse(user, {
        message: "User updated successfully.",
      });
    },
  };
}

function parseListUsersQuery(request: Request): ListUsersQuery {
  const { searchParams } = new URL(request.url);

  return listUsersQuerySchema.parse({
    keyword: searchParams.get("keyword") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    role: searchParams.get("role") ?? undefined,
  });
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
