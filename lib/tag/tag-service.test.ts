import { describe, expect, test } from "vitest";

import { tagErrorCodes } from "@/lib/api/error-codes";
import { createTagService } from "@/lib/tag/tag-service";
import type { ApiError } from "@/lib/api/api-error";
import type { TagRepository } from "@/lib/tag/tag-repository";

const baseTagRecord = {
  _count: {
    articleTags: 0,
  },
  createdAt: new Date("2026-04-09T00:00:00.000Z"),
  description: null,
  id: "tag_1",
  name: "Architecture",
  slug: "architecture",
  sortOrder: 0,
  updatedAt: new Date("2026-04-09T00:00:00.000Z"),
};

function createRepositoryStub(overrides: Partial<TagRepository> = {}): TagRepository {
  return {
    countByKeyword: async () => 0,
    create: async (data) => ({
      ...baseTagRecord,
      ...data,
    }),
    delete: async () => undefined,
    findById: async () => baseTagRecord,
    findByName: async () => null,
    findBySlug: async () => null,
    findManyWithPagination: async () => [baseTagRecord],
    update: async (_id, data) => ({
      ...baseTagRecord,
      ...data,
    }),
    ...overrides,
  };
}

describe("tag service", () => {
  test("returns TAG_NAME_CONFLICT when tag name already exists on create", async () => {
    const service = createTagService(
      createRepositoryStub({
        findByName: async () => baseTagRecord,
      }),
    );

    await expect(
      service.createTag({
        name: "Architecture",
        slug: "architecture-2",
        sortOrder: 0,
      }),
    ).rejects.toMatchObject({
      code: tagErrorCodes.TAG_NAME_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns TAG_SLUG_CONFLICT when tag slug already exists on create", async () => {
    const service = createTagService(
      createRepositoryStub({
        findBySlug: async () => baseTagRecord,
      }),
    );

    await expect(
      service.createTag({
        name: "Engineering",
        slug: "architecture",
        sortOrder: 0,
      }),
    ).rejects.toMatchObject({
      code: tagErrorCodes.TAG_SLUG_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns TAG_NAME_CONFLICT when update collides with another tag name", async () => {
    const service = createTagService(
      createRepositoryStub({
        findById: async () => baseTagRecord,
        findByName: async () => ({
          ...baseTagRecord,
          id: "tag_2",
          name: "Engineering",
        }),
      }),
    );

    await expect(
      service.updateTag("tag_1", {
        name: "Engineering",
      }),
    ).rejects.toMatchObject({
      code: tagErrorCodes.TAG_NAME_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns TAG_NOT_FOUND when tag does not exist", async () => {
    const service = createTagService(
      createRepositoryStub({
        findById: async () => null,
      }),
    );

    await expect(service.getTagById("missing")).rejects.toMatchObject({
      code: tagErrorCodes.TAG_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });
});
