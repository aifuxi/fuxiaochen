import "server-only";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { listPublicComments, submitPublicComment, PublicCommentError } from "./comments";
import { pageSchema, publicCommentSchema } from "./schema";

export const publicRoutes = new Hono();
publicRoutes.use("*", async (c, next) => {
  if (
    c.req.method === "POST" &&
    c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
  )
    return c.json(
      { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "请使用 JSON 提交。" } },
      415,
    );
  return next();
});
const postId = zValidator("param", z.object({ id: z.uuid() }), (result, c) =>
  result.success
    ? undefined
    : c.json({ error: { code: "INVALID_INPUT", message: "文章标识无效。" } }, 400),
);
publicRoutes.get(
  "/posts/:id/comments",
  postId,
  zValidator("query", z.object({ page: pageSchema }), (result, c) =>
    result.success
      ? undefined
      : c.json({ error: { code: "INVALID_INPUT", message: "页码无效。" } }, 400),
  ),
  async (c) =>
    c.json({ data: await listPublicComments(c.req.valid("param").id, c.req.valid("query").page) }),
);
publicRoutes.post(
  "/posts/:id/comments",
  postId,
  zValidator("json", publicCommentSchema, (result, c) =>
    result.success
      ? undefined
      : c.json(
          {
            error: {
              code: "INVALID_INPUT",
              message: "请检查填写内容。",
              fieldErrors: z.flattenError(result.error).fieldErrors,
            },
          },
          400,
        ),
  ),
  async (c) =>
    c.json({ data: await submitPublicComment(c.req.valid("param").id, c.req.valid("json")) }, 201),
);
publicRoutes.onError((error, c) => {
  if (error instanceof PublicCommentError) {
    if (error.retryAfter) c.header("Retry-After", String(error.retryAfter));
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "RATE_LIMITED"
          ? 429
          : error.code === "COMMENTS_CLOSED"
            ? 403
            : error.code === "SUBMISSION_CONFLICT"
              ? 409
              : 400;
    return c.json({ error: { code: error.code, message: error.message } }, status);
  }
  if (error instanceof HTTPException && error.status === 400)
    return c.json({ error: { code: "INVALID_INPUT", message: "请求 JSON 格式无效。" } }, 400);
  console.error("公开评论接口失败", { name: error.name });
  return c.json(
    { error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请稍后重试。" } },
    503,
  );
});
