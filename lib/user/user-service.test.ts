import { describe, expect, test, vi } from "vitest";

import { userErrorCodes } from "@/lib/api/error-codes";
import { createUserService } from "@/lib/user/user-service";
import type { ApiError } from "@/lib/api/api-error";
import type { UserRepository } from "@/lib/user/user-repository";

const baseUserRecord = {
  _count: {
    accounts: 1,
    sessions: 0,
  },
  createdAt: new Date("2026-04-09T00:00:00.000Z"),
  email: "sarah@example.com",
  emailVerified: false,
  id: "user_1",
  image: null,
  name: "Sarah Chen",
  role: "Admin" as const,
  updatedAt: new Date("2026-04-09T00:00:00.000Z"),
};

function createRepositoryStub(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    countByKeyword: async () => 0,
    create: async (data) => ({
      ...baseUserRecord,
      email: data.email,
      emailVerified: data.emailVerified,
      image: data.image ?? null,
      name: data.name,
      role: data.role,
    }),
    delete: async () => undefined,
    findByEmail: async () => null,
    findById: async () => baseUserRecord,
    findManyWithPagination: async () => [baseUserRecord],
    update: async (_id, data) => ({
      ...baseUserRecord,
      email: data.email ?? baseUserRecord.email,
      emailVerified: data.emailVerified ?? baseUserRecord.emailVerified,
      image: data.image === undefined ? baseUserRecord.image : data.image,
      name: data.name ?? baseUserRecord.name,
      role: data.role ?? baseUserRecord.role,
    }),
    ...overrides,
  };
}

describe("user service", () => {
  test("returns USER_EMAIL_CONFLICT when user email already exists on create", async () => {
    const service = createUserService(
      createRepositoryStub({
        findByEmail: async () => baseUserRecord,
      }),
      {
        hashPassword: async () => "hashed-password",
      },
    );

    await expect(
      service.createUser({
        email: "sarah@example.com",
        emailVerified: false,
        name: "Sarah Chen",
        password: "test123456",
        role: "Normal",
      }),
    ).rejects.toMatchObject({
      code: userErrorCodes.USER_EMAIL_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns USER_EMAIL_CONFLICT when update collides with another user email", async () => {
    const service = createUserService(createRepositoryStub({
      findByEmail: async () => ({
        ...baseUserRecord,
        email: "other@example.com",
        id: "user_2",
      }),
      findById: async () => baseUserRecord,
    }));

    await expect(
      service.updateUser("user_1", {
        email: "other@example.com",
      }),
    ).rejects.toMatchObject({
      code: userErrorCodes.USER_EMAIL_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns USER_NOT_FOUND when user does not exist", async () => {
    const service = createUserService(createRepositoryStub({
      findById: async () => null,
    }));

    await expect(service.getUserById("missing")).rejects.toMatchObject({
      code: userErrorCodes.USER_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });

  test("hashes password before updating user credentials", async () => {
    const hashPassword = vi.fn(async () => "hashed-password");
    const update = vi.fn(async (_id: string, data: Parameters<UserRepository["update"]>[1]) => ({
      ...baseUserRecord,
      email: data.email ?? baseUserRecord.email,
      emailVerified: data.emailVerified ?? baseUserRecord.emailVerified,
      image: data.image === undefined ? baseUserRecord.image : data.image,
      name: data.name ?? baseUserRecord.name,
    }));
    const service = createUserService(
      createRepositoryStub({
        update,
      }),
      {
        hashPassword,
      },
    );

    await service.updateUser("user_1", {
      password: "updated123",
    });

    expect(hashPassword).toHaveBeenCalledWith("updated123");
    expect(update).toHaveBeenCalledWith("user_1", {
      email: undefined,
      emailVerified: undefined,
      image: undefined,
      name: undefined,
      passwordHash: "hashed-password",
      role: undefined,
    });
  });
});
