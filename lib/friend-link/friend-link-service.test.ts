import { FriendLinkStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import { friendLinkErrorCodes } from "@/lib/api/error-codes";
import type { ApiError } from "@/lib/api/api-error";
import { createFriendLinkService } from "@/lib/friend-link/friend-link-service";
import type { FriendLinkRepository } from "@/lib/friend-link/friend-link-repository";

const baseFriendLinkRecord = {
  avatarAsset: null,
  avatarAssetId: null,
  createdAt: new Date("2026-04-09T00:00:00.000Z"),
  description: "Independent builder notes.",
  domain: "example.com",
  id: "friend_link_1",
  siteName: "Lin Studio",
  siteUrl: "https://example.com",
  sortOrder: 0,
  status: FriendLinkStatus.Approved,
  subtitle: "Builder notes",
  updatedAt: new Date("2026-04-09T00:00:00.000Z"),
};

function createRepositoryStub(overrides: Partial<FriendLinkRepository> = {}): FriendLinkRepository {
  return {
    countByFilters: async () => 0,
    create: async (data) => ({
      ...baseFriendLinkRecord,
      ...data,
    }),
    delete: async () => undefined,
    findAvatarAssetById: async () => null,
    findById: async () => baseFriendLinkRecord,
    findBySiteUrl: async () => null,
    findManyWithPagination: async () => [baseFriendLinkRecord],
    update: async (_id, data) => ({
      ...baseFriendLinkRecord,
      ...data,
    }),
    ...overrides,
  };
}

describe("friend link service", () => {
  test("returns FRIEND_LINK_SITE_URL_CONFLICT when site URL already exists on create", async () => {
    const service = createFriendLinkService(
      createRepositoryStub({
        findBySiteUrl: async () => baseFriendLinkRecord,
      }),
    );

    await expect(
      service.createFriendLink({
        description: "Another site",
        siteName: "Another site",
        siteUrl: "https://example.com",
        sortOrder: 0,
        status: FriendLinkStatus.Approved,
      }),
    ).rejects.toMatchObject({
      code: friendLinkErrorCodes.FRIEND_LINK_SITE_URL_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns FRIEND_LINK_AVATAR_ASSET_NOT_FOUND when avatar asset is missing", async () => {
    const service = createFriendLinkService(createRepositoryStub());

    await expect(
      service.createFriendLink({
        avatarAssetId: "missing-asset",
        description: "Independent builder notes.",
        siteName: "Lin Studio",
        siteUrl: "https://lin.example.com",
        sortOrder: 0,
        status: FriendLinkStatus.Approved,
      }),
    ).rejects.toMatchObject({
      code: friendLinkErrorCodes.FRIEND_LINK_AVATAR_ASSET_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });

  test("returns FRIEND_LINK_SITE_URL_CONFLICT when update collides with another friend link", async () => {
    const service = createFriendLinkService(
      createRepositoryStub({
        findById: async () => baseFriendLinkRecord,
        findBySiteUrl: async () => ({
          ...baseFriendLinkRecord,
          id: "friend_link_2",
          siteUrl: "https://another.example.com",
        }),
      }),
    );

    await expect(
      service.updateFriendLink("friend_link_1", {
        siteUrl: "https://another.example.com",
      }),
    ).rejects.toMatchObject({
      code: friendLinkErrorCodes.FRIEND_LINK_SITE_URL_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns FRIEND_LINK_NOT_FOUND when friend link does not exist", async () => {
    const service = createFriendLinkService(
      createRepositoryStub({
        findById: async () => null,
      }),
    );

    await expect(service.getFriendLinkById("missing")).rejects.toMatchObject({
      code: friendLinkErrorCodes.FRIEND_LINK_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });
});
