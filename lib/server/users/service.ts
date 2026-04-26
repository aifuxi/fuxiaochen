import type { UserRole } from "@/lib/db/schema";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

import type { AdminUserListQuery, AdminUserRoleUpdateInput } from "./dto";
import {
  userRepository,
  type AdminUserRecord,
  type AdminUserStats,
  type UserRepository,
} from "./repository";

export interface UserService {
  listAdminUsers(query: AdminUserListQuery): Promise<{
    items: AdminUserRecord[];
    total: number;
    stats: AdminUserStats;
  }>;
  getAdminUser(id: string): Promise<AdminUserRecord>;
  updateUserRole(
    id: string,
    input: AdminUserRoleUpdateInput,
    actorUserId: string,
  ): Promise<AdminUserRecord>;
  revokeUserSessions(id: string, actorUserId: string): Promise<void>;
}

export interface UserServiceDeps {
  repository?: UserRepository;
}

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404, {
    id,
  });

const createSelfDemotionError = (id: string) =>
  new AppError(
    ERROR_CODES.USER_SELF_DEMOTION_FORBIDDEN,
    "You cannot remove your own admin role",
    409,
    {
      id,
    },
  );

const createLastAdminDemotionError = (id: string) =>
  new AppError(
    ERROR_CODES.USER_LAST_ADMIN_DEMOTION_FORBIDDEN,
    "The last admin account cannot be downgraded",
    409,
    {
      id,
    },
  );

const createSelfSessionRevokeError = (id: string) =>
  new AppError(
    ERROR_CODES.USER_SELF_SESSION_REVOKE_FORBIDDEN,
    "You cannot revoke your own active sessions",
    409,
    {
      id,
    },
  );

const isRoleDowngrade = (currentRole: UserRole, nextRole: UserRole) =>
  currentRole === "admin" && nextRole === "user";

export function createUserService({
  repository = userRepository,
}: UserServiceDeps = {}): UserService {
  return {
    listAdminUsers(query) {
      return repository.listAdmin(query);
    },
    async getAdminUser(id) {
      const user = await repository.findById(id);

      if (!user) {
        throw createNotFoundError(id);
      }

      return user;
    },
    async updateUserRole(id, input, actorUserId) {
      const existingUser = await repository.findById(id);

      if (!existingUser) {
        throw createNotFoundError(id);
      }

      if (existingUser.role === input.role) {
        return existingUser;
      }

      if (
        actorUserId === id &&
        isRoleDowngrade(existingUser.role, input.role)
      ) {
        throw createSelfDemotionError(id);
      }

      if (isRoleDowngrade(existingUser.role, input.role)) {
        const adminCount = await repository.countByRole("admin");

        if (adminCount <= 1) {
          throw createLastAdminDemotionError(id);
        }
      }

      const updated = await repository.updateRole(id, input.role);

      if (!updated) {
        throw createNotFoundError(id);
      }

      const updatedUser = await repository.findById(id);

      if (!updatedUser) {
        throw createNotFoundError(id);
      }

      return updatedUser;
    },
    async revokeUserSessions(id, actorUserId) {
      const user = await repository.findById(id);

      if (!user) {
        throw createNotFoundError(id);
      }

      if (actorUserId === id) {
        throw createSelfSessionRevokeError(id);
      }

      await repository.deleteSessionsByUserId(id);
    },
  };
}

export const userService = createUserService();
