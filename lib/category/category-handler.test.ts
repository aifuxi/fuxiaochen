import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { handleRoute } from "@/lib/api/handle-route";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { createCategoryHandler } from "@/lib/category/category-handler";
import type { CategoryService } from "@/lib/category/category-service";

const sampleCategory = {
  color: "#10B981",
  createdAt: "2026-04-09T00:00:00.000Z",
  description: null,
  id: "category_1",
  name: "Design Systems",
  slug: "design-systems",
  sortOrder: 1,
  updatedAt: "2026-04-09T00:00:00.000Z",
  usageCount: 2,
};

function createServiceStub(overrides: Partial<CategoryService> = {}): CategoryService {
  return {
    createCategory: async () => sampleCategory,
    deleteCategory: async (id) => ({ id }),
    getCategoryById: async () => sampleCategory,
    listCategories: async () => ({
      items: [sampleCategory],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    updateCategory: async () => sampleCategory,
    ...overrides,
  };
}

describe("category handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createCategoryHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listCategories(request));
    const response = await route(new Request("http://localhost/api/categories"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns list response with pagination meta", async () => {
    const handler = createCategoryHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listCategories(request));
    const response = await route(new Request("http://localhost/api/categories?page=1&pageSize=10"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        items: [sampleCategory],
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
    const handler = createCategoryHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.createCategory(request));
    const response = await route(
      new Request("http://localhost/api/categories", {
        body: JSON.stringify({
          color: "#10B981",
          name: "Design Systems",
          slug: "design-systems",
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
      data: sampleCategory,
      success: true,
    });
  });

  test("returns updated category on patch", async () => {
    const handler = createCategoryHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.updateCategory(request, { id: "category_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/categories/category_1", {
        body: JSON.stringify({
          name: "Design Systems Updated",
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
      data: sampleCategory,
      success: true,
    });
  });

  test("returns deleted category id on delete", async () => {
    const handler = createCategoryHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.deleteCategory(request, { id: "category_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/categories/category_1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        id: "category_1",
      },
      success: true,
    });
  });
});
