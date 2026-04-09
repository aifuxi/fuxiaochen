import { ChangelogItemType } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import {
  changelogReleaseIdSchema,
  createChangelogReleaseBodySchema,
  listChangelogReleasesQuerySchema,
  updateChangelogReleaseBodySchema,
} from "@/lib/changelog/changelog-dto";

describe("changelog dto", () => {
  test("rejects an empty changelog release id", () => {
    const result = changelogReleaseIdSchema.safeParse("   ");

    expect(result.success).toBe(false);
  });

  test("rejects invalid pagination params", () => {
    const result = listChangelogReleasesQuerySchema.safeParse({
      page: "0",
      pageSize: "99",
    });

    expect(result.success).toBe(false);
  });

  test("requires version when creating a release", () => {
    const result = createChangelogReleaseBodySchema.safeParse({
      releasedOn: "2026-04-09",
      title: "Spring release",
    });

    expect(result.success).toBe(false);
  });

  test("accepts nested changelog items", () => {
    const result = createChangelogReleaseBodySchema.safeParse({
      items: [
        {
          itemType: ChangelogItemType.Added,
          title: "Added project CRUD API",
        },
      ],
      releasedOn: "2026-04-09",
      title: "Spring release",
      version: "v1.2.0",
    });

    expect(result.success).toBe(true);
  });

  test("requires at least one field when updating a release", () => {
    const result = updateChangelogReleaseBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
