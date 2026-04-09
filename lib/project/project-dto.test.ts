import { ProjectCategory } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import {
  createProjectBodySchema,
  listProjectsQuerySchema,
  projectIdSchema,
  updateProjectBodySchema,
} from "@/lib/project/project-dto";

describe("project dto", () => {
  test("rejects an empty project id", () => {
    const result = projectIdSchema.safeParse("   ");

    expect(result.success).toBe(false);
  });

  test("rejects invalid pagination params", () => {
    const result = listProjectsQuerySchema.safeParse({
      page: "0",
      pageSize: "99",
    });

    expect(result.success).toBe(false);
  });

  test("requires summary when creating a project", () => {
    const result = createProjectBodySchema.safeParse({
      category: ProjectCategory.Web,
      name: "StreamLine",
      slug: "streamline",
    });

    expect(result.success).toBe(false);
  });

  test("accepts project category and de-duplicates technologies", () => {
    const result = createProjectBodySchema.safeParse({
      category: ProjectCategory.Web,
      name: "StreamLine",
      slug: "streamline",
      summary: "Project management for modern teams.",
      techNames: ["Svelte", "Svelte", "Supabase"],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.techNames).toEqual(["Svelte", "Supabase"]);
    }
  });

  test("requires at least one field when updating a project", () => {
    const result = updateProjectBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
