import { runWithTransaction } from "@better-auth/core/context";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { UserRole } from "@/lib/user/user-role";

type UserRecord = {
  _count: {
    accounts: number;
    sessions: number;
  };
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  role: UserRole;
  updatedAt: Date;
};

type TransactionAdapter = Parameters<typeof runWithTransaction>[0];

type ManagedUserAuthContext = {
  adapter: TransactionAdapter;
  internalAdapter: {
    createUser: (data: {
      email: string;
      emailVerified: boolean;
      image?: string | null;
      name: string;
      role?: UserRole;
    }) => Promise<{ id: string } | null>;
    deleteUser: (userId: string) => Promise<void>;
    findAccounts: (userId: string) => Promise<
      Array<{
        providerId: string;
      }>
    >;
    linkAccount: (data: {
      accountId: string;
      password: string;
      providerId: string;
      userId: string;
    }) => Promise<unknown>;
    updatePassword: (userId: string, password: string) => Promise<void>;
    updateUser: (
      userId: string,
      data: {
        email?: string;
        emailVerified?: boolean;
        image?: string | null;
        name?: string;
        role?: UserRole;
      },
    ) => Promise<unknown>;
  };
};

type CreateUserData = {
  email: string;
  emailVerified: boolean;
  image?: string | null;
  name: string;
  passwordHash: string;
  role: UserRole;
};

type UpdateUserData = {
  email?: string;
  emailVerified?: boolean;
  image?: string | null;
  name?: string;
  passwordHash?: string;
  role?: UserRole;
};

type FindManyOptions = {
  keyword?: string;
  role?: UserRole;
  skip: number;
  take: number;
};

type GetAuthContext = () => Promise<ManagedUserAuthContext>;

export type UserRepository = {
  countByKeyword: (keyword?: string, role?: UserRole) => Promise<number>;
  create: (data: CreateUserData) => Promise<UserRecord>;
  delete: (id: string) => Promise<void>;
  findByEmail: (email: string) => Promise<UserRecord | null>;
  findById: (id: string) => Promise<UserRecord | null>;
  findManyWithPagination: (options: FindManyOptions) => Promise<UserRecord[]>;
  update: (id: string, data: UpdateUserData) => Promise<UserRecord>;
};

const userSelect = {
  _count: {
    select: {
      accounts: true,
      sessions: true,
    },
  },
  createdAt: true,
  email: true,
  emailVerified: true,
  id: true,
  image: true,
  name: true,
  role: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

function buildUserWhere(keyword?: string, role?: UserRole): Prisma.UserWhereInput {
  const filters: Prisma.UserWhereInput[] = [];

  if (keyword) {
    filters.push({
      OR: [
        {
          email: {
            contains: keyword,
          },
        },
        {
          name: {
            contains: keyword,
          },
        },
      ],
    });
  }

  if (role) {
    filters.push({
      role,
    });
  }

  if (filters.length === 0) {
    return {};
  }

  if (filters.length === 1) {
    return filters[0] ?? {};
  }

  return {
    AND: filters,
  };
}

function omitUndefinedValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as {
    [K in keyof T as undefined extends T[K] ? never : K]: Exclude<T[K], undefined>;
  } & Partial<T>;
}

async function getRequiredUser(database: PrismaClient, id: string) {
  const user = await database.user.findUnique({
    select: userSelect,
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error(`User "${id}" was not found after persistence.`);
  }

  return user;
}

export function createUserRepository(
  database: PrismaClient = prisma,
  getAuthContext: GetAuthContext = async () => (await auth.$context) as unknown as ManagedUserAuthContext,
): UserRepository {
  return {
    async countByKeyword(keyword, role) {
      return database.user.count({
        where: buildUserWhere(keyword, role),
      });
    },
    async create(data) {
      const authContext = await getAuthContext();
      const userId = await runWithTransaction(authContext.adapter, async () => {
        const createdUser = await authContext.internalAdapter.createUser({
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image ?? null,
          name: data.name,
          role: data.role,
        });

        if (!createdUser) {
          throw new Error("Failed to create user.");
        }

        await authContext.internalAdapter.linkAccount({
          accountId: createdUser.id,
          password: data.passwordHash,
          providerId: "credential",
          userId: createdUser.id,
        });

        return createdUser.id;
      });

      return getRequiredUser(database, userId);
    },
    async delete(id) {
      const authContext = await getAuthContext();

      await runWithTransaction(authContext.adapter, async () => {
        await authContext.internalAdapter.deleteUser(id);
      });
    },
    async findByEmail(email) {
      return database.user.findUnique({
        select: userSelect,
        where: {
          email,
        },
      });
    },
    async findById(id) {
      return database.user.findUnique({
        select: userSelect,
        where: {
          id,
        },
      });
    },
    async findManyWithPagination({ keyword, role, skip, take }) {
      return database.user.findMany({
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        select: userSelect,
        skip,
        take,
        where: buildUserWhere(keyword, role),
      });
    },
    async update(id, data) {
      const authContext = await getAuthContext();

      await runWithTransaction(authContext.adapter, async () => {
        const { passwordHash, ...userData } = data;
        const normalizedUserData = omitUndefinedValues(userData);

        if (Object.keys(normalizedUserData).length > 0) {
          await authContext.internalAdapter.updateUser(id, normalizedUserData);
        }

        if (passwordHash !== undefined) {
          const accounts = await authContext.internalAdapter.findAccounts(id);
          const credentialAccount = accounts.find((account) => account.providerId === "credential");

          if (credentialAccount) {
            await authContext.internalAdapter.updatePassword(id, passwordHash);
          } else {
            await authContext.internalAdapter.linkAccount({
              accountId: id,
              password: passwordHash,
              providerId: "credential",
              userId: id,
            });
          }
        }
      });

      return getRequiredUser(database, id);
    },
  };
}
