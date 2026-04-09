import { describe, expect, test } from "vitest";

import type { ApiError } from "@/lib/api/api-error";
import { categoryErrorCodes } from "@/lib/api/error-codes";
import type { CategoryRepository } from "@/lib/category/category-repository";
import { createCategoryService } from "@/lib/category/category-service";

const baseCategoryRecord = {
  _count: {
    articles: 0,
  },
  color: "#10B981",
  createdAt: new Date("2026-04-09T00:00:00.000Z"),
  description: null,
  id: "category_1",
  name: "Design Systems",
  slug: "design-systems",
  sortOrder: 0,
  updatedAt: new Date("2026-04-09T00:00:00.000Z"),
};

function createRepositoryStub(overrides: Partial<CategoryRepository> = {}): CategoryRepository {
  return {
    countByKeyword: async () => 0,
    create: async (data) => ({
      ...baseCategoryRecord,
      ...data,
    }),
    delete: async () => undefined,
    findById: async () => baseCategoryRecord,
    findByName: async () => null,
    findBySlug: async () => null,
    findManyWithPagination: async () => [baseCategoryRecord],
    update: async (_id, data) => ({
      ...baseCategoryRecord,
      ...data,
    }),
    ...overrides,
  };
}

describe("category service", () => {
  test("returns CATEGORY_NAME_CONFLICT when category name already exists on create", async () => {
    const service = createCategoryService(
      createRepositoryStub({
        findByName: async () => baseCategoryRecord,
      }),
    );

    await expect(
      service.createCategory({
        color: "#10B981",
        name: "Design Systems",
        slug: "design-systems-2",
        sortOrder: 0,
      }),
    ).rejects.toMatchObject({
      code: categoryErrorCodes.CATEGORY_NAME_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns CATEGORY_SLUG_CONFLICT when category slug already exists on create", async () => {
    const service = createCategoryService(
      createRepositoryStub({
        findBySlug: async () => baseCategoryRecord,
      }),
    );

    await expect(
      service.createCategory({
        color: "#10B981",
        name: "Engineering",
        slug: "design-systems",
        sortOrder: 0,
      }),
    ).rejects.toMatchObject({
      code: categoryErrorCodes.CATEGORY_SLUG_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns CATEGORY_NAME_CONFLICT when update collides with another category name", async () => {
    const service = createCategoryService(
      createRepositoryStub({
        findById: async () => baseCategoryRecord,
        findByName: async () => ({
          ...baseCategoryRecord,
          id: "category_2",
          name: "Engineering",
        }),
      }),
    );

    await expect(
      service.updateCategory("category_1", {
        name: "Engineering",
      }),
    ).rejects.toMatchObject({
      code: categoryErrorCodes.CATEGORY_NAME_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns CATEGORY_NOT_FOUND when category does not exist", async () => {
    const service = createCategoryService(
      createRepositoryStub({
        findById: async () => null,
      }),
    );

    await expect(service.getCategoryById("missing")).rejects.toMatchObject({
      code: categoryErrorCodes.CATEGORY_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });
});
