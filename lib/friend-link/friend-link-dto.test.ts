import { FriendLinkStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import {
  createFriendLinkBodySchema,
  friendLinkIdSchema,
  listFriendLinksQuerySchema,
  updateFriendLinkBodySchema,
} from "@/lib/friend-link/friend-link-dto";

describe("friend link dto", () => {
  test("rejects an empty friend link id", () => {
    const result = friendLinkIdSchema.safeParse("   ");

    expect(result.success).toBe(false);
  });

  test("rejects invalid pagination params", () => {
    const result = listFriendLinksQuerySchema.safeParse({
      page: "0",
      pageSize: "99",
      status: FriendLinkStatus.Approved,
    });

    expect(result.success).toBe(false);
  });

  test("requires a valid site URL when creating a friend link", () => {
    const result = createFriendLinkBodySchema.safeParse({
      description: "Independent builder notes.",
      siteName: "Lin Studio",
      siteUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });

  test("requires at least one field when updating a friend link", () => {
    const result = updateFriendLinkBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
