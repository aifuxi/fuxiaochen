import { CommentStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import {
  commentIdSchema,
  createCommentBodySchema,
  listCommentsQuerySchema,
  updateCommentBodySchema,
} from "@/lib/comment/comment-dto";

describe("comment dto", () => {
  test("rejects an empty comment id", () => {
    const result = commentIdSchema.safeParse("   ");

    expect(result.success).toBe(false);
  });

  test("rejects invalid pagination params", () => {
    const result = listCommentsQuerySchema.safeParse({
      page: "0",
      pageSize: "99",
    });

    expect(result.success).toBe(false);
  });

  test("requires article id when creating a comment", () => {
    const result = createCommentBodySchema.safeParse({
      authorName: "Lin",
      body: "Nice article.",
    });

    expect(result.success).toBe(false);
  });

  test("accepts comment status and email", () => {
    const result = createCommentBodySchema.safeParse({
      articleId: "article_1",
      authorEmail: "lin@example.com",
      authorName: "Lin",
      body: "Nice article.",
      status: CommentStatus.Pending,
    });

    expect(result.success).toBe(true);
  });

  test("requires at least one field when updating a comment", () => {
    const result = updateCommentBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
