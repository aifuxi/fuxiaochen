import { describe, expect, test } from "vitest";

import {
  categoryIdSchema,
  createCategoryBodySchema,
  listCategoriesQuerySchema,
  updateCategoryBodySchema,
} from "@/lib/category/category-dto";

describe("category dto", () => {
  test("rejects an empty category id", () => {
    const result = categoryIdSchema.safeParse("   ");

    expect(result.success).toBe(false);
  });

  test("rejects invalid pagination params", () => {
    const result = listCategoriesQuerySchema.safeParse({
      page: "0",
      pageSize: "99",
    });

    expect(result.success).toBe(false);
  });

  test("requires slug when creating a category", () => {
    const result = createCategoryBodySchema.safeParse({
      name: "Design Systems",
    });

    expect(result.success).toBe(false);
  });

  test("rejects invalid color values", () => {
    const result = createCategoryBodySchema.safeParse({
      color: "green",
      name: "Design Systems",
      slug: "design-systems",
    });

    expect(result.success).toBe(false);
  });

  test("requires at least one field when updating a category", () => {
    const result = updateCategoryBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
