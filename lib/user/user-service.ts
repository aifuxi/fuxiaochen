import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/api-error";
import { userErrorCodes } from "@/lib/api/error-codes";
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from "@/lib/user/user-dto";
import { toUserDto } from "@/lib/user/user-dto";
import type { UserRepository } from "@/lib/user/user-repository";

type ListUsersResult = {
  items: ReturnType<typeof toUserDto>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type UserServiceOptions = {
  hashPassword?: (password: string) => Promise<string>;
};

export type UserService = {
  createUser: (input: CreateUserInput) => Promise<ReturnType<typeof toUserDto>>;
  deleteUser: (id: string) => Promise<{ id: string }>;
  getUserById: (id: string) => Promise<ReturnType<typeof toUserDto>>;
  listUsers: (query: ListUsersQuery) => Promise<ListUsersResult>;
  updateUser: (id: string, input: UpdateUserInput) => Promise<ReturnType<typeof toUserDto>>;
};

export function createUserService(
  repository: UserRepository,
  options: UserServiceOptions = {},
): UserService {
  const hashPassword = options.hashPassword ?? createPasswordHasher;

  return {
    async createUser(input) {
      await ensureEmailAvailable(repository, input.email);

      const user = await createUserWithConflictHandling(repository, {
        email: input.email,
        emailVerified: input.emailVerified,
        image: input.image,
        name: input.name,
        passwordHash: await hashPassword(input.password),
        role: input.role,
      });

      return toUserDto(user);
    },
    async deleteUser(id) {
      await getExistingUser(repository, id);
      await repository.delete(id);

      return { id };
    },
    async getUserById(id) {
      const user = await getExistingUser(repository, id);

      return toUserDto(user);
    },
    async listUsers(query) {
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findManyWithPagination({
          keyword: query.keyword,
          role: query.role,
          skip,
          take: query.pageSize,
        }),
        repository.countByKeyword(query.keyword, query.role),
      ]);

      return {
        items: items.map(toUserDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      };
    },
    async updateUser(id, input) {
      const existingUser = await getExistingUser(repository, id);

      if (input.email && input.email !== existingUser.email) {
        await ensureEmailAvailable(repository, input.email, existingUser.id);
      }

      const updatedUser = await updateUserWithConflictHandling(repository, id, {
        email: input.email,
        emailVerified: input.emailVerified,
        image: input.image,
        name: input.name,
        passwordHash: input.password ? await hashPassword(input.password) : undefined,
        role: input.role,
      });

      return toUserDto(updatedUser);
    },
  };
}

async function createPasswordHasher(password: string) {
  const { auth } = await import("@/lib/auth");
  const authContext = await auth.$context;

  return authContext.password.hash(password);
}

async function ensureEmailAvailable(repository: UserRepository, email: string, currentId?: string) {
  const existingUser = await repository.findByEmail(email);

  if (existingUser && existingUser.id !== currentId) {
    throw new ApiError({
      code: userErrorCodes.USER_EMAIL_CONFLICT,
      message: "User email already exists.",
    });
  }
}

async function getExistingUser(repository: UserRepository, id: string) {
  const user = await repository.findById(id);

  if (!user) {
    throw new ApiError({
      code: userErrorCodes.USER_NOT_FOUND,
      message: "User does not exist.",
    });
  }

  return user;
}

async function createUserWithConflictHandling(
  repository: UserRepository,
  input: {
    email: string;
    emailVerified: boolean;
    image?: string | null;
    name: string;
    passwordHash: string;
    role: CreateUserInput["role"];
  },
) {
  try {
    return await repository.create(input);
  } catch (error) {
    throw normalizeUserPersistenceError(error);
  }
}

async function updateUserWithConflictHandling(
  repository: UserRepository,
  id: string,
  input: {
    email?: string;
    emailVerified?: boolean;
    image?: string | null;
    name?: string;
    passwordHash?: string;
    role?: UpdateUserInput["role"];
  },
) {
  try {
    return await repository.update(id, input);
  } catch (error) {
    throw normalizeUserPersistenceError(error);
  }
}

function normalizeUserPersistenceError(error: unknown) {
  if (isPrismaUniqueConflictError(error)) {
    const targets = getErrorTargets(error);

    if (targets.includes("email")) {
      return new ApiError({
        code: userErrorCodes.USER_EMAIL_CONFLICT,
        message: "User email already exists.",
      });
    }
  }

  return error;
}

function getErrorTargets(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;

  return Array.isArray(target) ? target.filter((item): item is string => typeof item === "string") : [];
}

function isPrismaUniqueConflictError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
