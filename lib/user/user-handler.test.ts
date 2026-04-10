import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { handleRoute } from "@/lib/api/handle-route";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { createUserHandler } from "@/lib/user/user-handler";
import type { UserService } from "@/lib/user/user-service";

const sampleUser = {
  accountCount: 1,
  createdAt: "2026-04-09T00:00:00.000Z",
  email: "sarah@example.com",
  emailVerified: false,
  id: "user_1",
  image: null,
  name: "Sarah Chen",
  role: "Admin" as const,
  sessionCount: 0,
  updatedAt: "2026-04-09T00:00:00.000Z",
};

function createServiceStub(overrides: Partial<UserService> = {}): UserService {
  return {
    createUser: async () => sampleUser,
    deleteUser: async (id) => ({ id }),
    getUserById: async () => sampleUser,
    listUsers: async () => ({
      items: [sampleUser],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    updateUser: async () => sampleUser,
    ...overrides,
  };
}

describe("user handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createUserHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listUsers(request));
    const response = await route(new Request("http://localhost/api/users"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns list response with pagination meta", async () => {
    const handler = createUserHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listUsers(request));
    const response = await route(new Request("http://localhost/api/users?page=1&pageSize=10"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        items: [sampleUser],
      },
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
      success: true,
    });
  });

  test("returns 201 on create", async () => {
    const handler = createUserHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.createUser(request));
    const response = await route(
      new Request("http://localhost/api/users", {
        body: JSON.stringify({
          email: "sarah@example.com",
          name: "Sarah Chen",
          password: "test123456",
          role: "Normal",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleUser,
      success: true,
    });
  });

  test("returns updated user on patch", async () => {
    const handler = createUserHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.updateUser(request, { id: "user_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/users/user_1", {
        body: JSON.stringify({
          name: "Sarah Updated",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleUser,
      success: true,
    });
  });

  test("returns deleted user id on delete", async () => {
    const handler = createUserHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.deleteUser(request, { id: "user_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/users/user_1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        id: "user_1",
      },
      success: true,
    });
  });
});
