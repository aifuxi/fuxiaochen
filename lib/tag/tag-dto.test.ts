import { describe, expect, test } from "vitest";

import {
  createTagBodySchema,
  listTagsQuerySchema,
  tagIdSchema,
  updateTagBodySchema,
} from "@/lib/tag/tag-dto";

describe("tag dto", () => {
  test("rejects an empty tag id", () => {
    const result = tagIdSchema.safeParse("   ");

    expect(result.success).toBe(false);
  });

  test("rejects invalid pagination params", () => {
    const result = listTagsQuerySchema.safeParse({
      page: "0",
      pageSize: "99",
    });

    expect(result.success).toBe(false);
  });

  test("requires slug when creating a tag", () => {
    const result = createTagBodySchema.safeParse({
      name: "Architecture",
    });

    expect(result.success).toBe(false);
  });

  test("requires at least one field when updating a tag", () => {
    const result = updateTagBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
