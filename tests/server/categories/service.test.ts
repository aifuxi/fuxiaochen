import assert from "node:assert/strict";
import test from "node:test";

import type { CategoryRepository } from "../../../lib/server/categories/repository";
import { createCategoryService } from "../../../lib/server/categories/service";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";
import { AppError } from "../../../lib/server/http/errors";

test("createCategory generates an id and timestamps before persisting", async () => {
  const now = new Date("2026-04-19T10:00:00.000Z");
  type CreateCategoryInput = Parameters<CategoryRepository["create"]>[0];

  const calls: CreateCategoryInput[] = [];
  const repository: CategoryRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return null;
    },
    async create(category: CreateCategoryInput) {
      calls.push(category);
      return category;
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createCategoryService({
    repository,
    generateId: () => "cat_test_1",
    now: () => now,
  });

  const result = await service.createCategory({
    name: "Design",
    slug: "design",
    description: "Design notes and assets",
  });

  assert.deepEqual(result, {
    id: "cat_test_1",
    createdAt: now,
    updatedAt: now,
    name: "Design",
    slug: "design",
    description: "Design notes and assets",
  });
  assert.deepEqual(calls, [
    {
      id: "cat_test_1",
      createdAt: now,
      updatedAt: now,
      name: "Design",
      slug: "design",
      description: "Design notes and assets",
    },
  ]);
});

test("createCategory rejects duplicate slugs with CATEGORY_SLUG_CONFLICT", async () => {
  const repository: CategoryRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return {
        id: "cat_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        name: "Existing",
        slug: "design",
        description: "Existing category",
      };
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createCategoryService({ repository });

  await assert.rejects(
    service.createCategory({
      name: "Design",
      slug: "design",
      description: "Design notes and assets",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CATEGORY_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("createCategory converts repository duplicate errors into CATEGORY_SLUG_CONFLICT", async () => {
  const duplicateError = Object.assign(new Error("duplicate key"), {
    code: "23505",
  });

  const repository: CategoryRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return null;
    },
    async create() {
      throw duplicateError;
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createCategoryService({ repository });

  await assert.rejects(
    service.createCategory({
      name: "Design",
      slug: "design",
      description: "Design notes and assets",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CATEGORY_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("updateCategory rejects missing categories with CATEGORY_NOT_FOUND", async () => {
  const repository: CategoryRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return null;
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      return false;
    },
  };

  const service = createCategoryService({ repository });

  await assert.rejects(
    service.updateCategory("cat_missing", {
      description: "Updated description",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CATEGORY_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("updateCategory converts repository duplicate errors into CATEGORY_SLUG_CONFLICT", async () => {
  const duplicateError = Object.assign(new Error("duplicate key"), {
    code: "23505",
  });

  const repository: CategoryRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return {
        id: "cat_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        name: "Existing",
        slug: "design",
        description: "Existing category",
      };
    },
    async findBySlug() {
      return null;
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw duplicateError;
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createCategoryService({ repository });

  await assert.rejects(
    service.updateCategory("cat_existing", {
      slug: "design-2",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CATEGORY_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("deleteCategory converts delete races into CATEGORY_NOT_FOUND", async () => {
  const repository: CategoryRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return {
        id: "cat_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        name: "Existing",
        slug: "design",
        description: "Existing category",
      };
    },
    async findBySlug() {
      return null;
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      return false;
    },
  };

  const service = createCategoryService({ repository });

  await assert.rejects(
    service.deleteCategory("cat_existing"),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CATEGORY_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});
