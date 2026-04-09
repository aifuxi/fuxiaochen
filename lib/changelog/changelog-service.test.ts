import { ChangelogItemType } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import type { ApiError } from "@/lib/api/api-error";
import { changelogErrorCodes } from "@/lib/api/error-codes";
import type { ChangelogReleaseRepository } from "@/lib/changelog/changelog-repository";
import { createChangelogReleaseService } from "@/lib/changelog/changelog-service";

const baseReleaseRecord = {
  createdAt: new Date("2026-04-09T00:00:00.000Z"),
  id: "release_1",
  isMajor: false,
  items: [
    {
      description: null,
      id: "item_1",
      itemType: ChangelogItemType.Added,
      sortOrder: 0,
      title: "Added project CRUD API",
    },
  ],
  releasedOn: new Date("2026-04-09T00:00:00.000Z"),
  sortOrder: 0,
  summary: "Spring release summary.",
  title: "Spring release",
  version: "v1.2.0",
};

function createRepositoryStub(overrides: Partial<ChangelogReleaseRepository> = {}): ChangelogReleaseRepository {
  return {
    countByFilters: async () => 0,
    create: async (data) => ({
      ...baseReleaseRecord,
      ...data,
      items: data.items.map((item, index) => ({
        description: item.description ?? null,
        id: `item_${index + 1}`,
        itemType: item.itemType,
        sortOrder: item.sortOrder,
        title: item.title,
      })),
    }),
    delete: async () => undefined,
    findById: async () => baseReleaseRecord,
    findByVersion: async () => null,
    findManyWithPagination: async () => [baseReleaseRecord],
    update: async (_id, data) => ({
      ...baseReleaseRecord,
      ...data,
      items:
        data.items !== undefined
          ? data.items.map((item, index) => ({
              description: item.description ?? null,
              id: `item_${index + 1}`,
              itemType: item.itemType,
              sortOrder: item.sortOrder,
              title: item.title,
            }))
          : baseReleaseRecord.items,
      releasedOn: data.releasedOn ?? baseReleaseRecord.releasedOn,
    }),
    ...overrides,
  };
}

describe("changelog service", () => {
  test("returns CHANGELOG_VERSION_CONFLICT when version already exists on create", async () => {
    const service = createChangelogReleaseService(
      createRepositoryStub({
        findByVersion: async () => baseReleaseRecord,
      }),
    );

    await expect(
      service.createRelease({
        isMajor: false,
        items: [],
        releasedOn: new Date("2026-04-09T00:00:00.000Z"),
        sortOrder: 0,
        title: "Another release",
        version: "v1.2.0",
      }),
    ).rejects.toMatchObject({
      code: changelogErrorCodes.CHANGELOG_VERSION_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns CHANGELOG_VERSION_CONFLICT when update collides with another version", async () => {
    const service = createChangelogReleaseService(
      createRepositoryStub({
        findById: async () => baseReleaseRecord,
        findByVersion: async () => ({
          ...baseReleaseRecord,
          id: "release_2",
          version: "v1.3.0",
        }),
      }),
    );

    await expect(
      service.updateRelease("release_1", {
        version: "v1.3.0",
      }),
    ).rejects.toMatchObject({
      code: changelogErrorCodes.CHANGELOG_VERSION_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns CHANGELOG_RELEASE_NOT_FOUND when release does not exist", async () => {
    const service = createChangelogReleaseService(
      createRepositoryStub({
        findById: async () => null,
      }),
    );

    await expect(service.getReleaseById("missing")).rejects.toMatchObject({
      code: changelogErrorCodes.CHANGELOG_RELEASE_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });
});
