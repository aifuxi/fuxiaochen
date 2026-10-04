import "server-only";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { SESSION_COOKIE, getSession } from "@/lib/auth/service";

import {
  featuredPostSchema,
  postSchema,
  updatePostSchema,
  postQuerySchema,
  postIdSchema,
  deletePostSchema,
} from "./schema";
import {
  createPost,
  deletePost,
  getPost,
  getPostSummary,
  listPosts,
  PostError,
  updatePost,
  updatePostFeatured,
} from "./service";

export const postRoutes = new Hono<{ Variables: { admin: TaxonomyActor } }>();
postRoutes.use("*", async (c, next) => {
  const sessionToken = getCookie(c, SESSION_COOKIE);
  const admin = await getSession(sessionToken);
  if (!admin)
    return c.json({ error: { code: "UNAUTHORIZED", message: "登录已失效，请重新登录。" } }, 401);
  c.set("admin", { adminId: admin.adminId, sessionToken });
  if (
    ["POST", "PUT", "PATCH"].includes(c.req.method) &&
    c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
  )
    return c.json(
      { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "请使用 JSON 提交。" } },
      415,
    );
  return next();
});
const idValidator = zValidator("param", postIdSchema, (result, c) => {
  if (!result.success)
    return c.json({ error: { code: "INVALID_INPUT", message: "无效的文章 ID。" } }, 400);
  return undefined;
});
const createValidator = zValidator("json", postSchema, (result, c) => {
  if (!result.success)
    return c.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: result.error.issues[0].message,
          fieldErrors: z.flattenError(result.error).fieldErrors,
        },
      },
      400,
    );
  return undefined;
});
const updateValidator = zValidator("json", updatePostSchema, (result, c) => {
  if (!result.success)
    return c.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: result.error.issues[0].message,
          fieldErrors: z.flattenError(result.error).fieldErrors,
        },
      },
      400,
    );
  return undefined;
});
postRoutes.get(
  "/",
  zValidator("query", postQuerySchema, (result, c) => {
    if (!result.success)
      return c.json(
        { error: { code: "INVALID_INPUT", message: result.error.issues[0].message } },
        400,
      );
    return undefined;
  }),
  async (c) => c.json({ data: await listPosts(c.req.valid("query"), c.get("admin")) }),
);
postRoutes.get("/summary", async (c) => c.json({ data: await getPostSummary(c.get("admin")) }));
postRoutes.get("/:id", idValidator, async (c) =>
  c.json({ data: await getPost(c.req.valid("param").id, c.get("admin")) }),
);
postRoutes.post("/", createValidator, async (c) =>
  c.json({ data: await createPost(c.req.valid("json"), c.get("admin")) }, 201),
);
postRoutes.put("/:id", idValidator, updateValidator, async (c) =>
  c.json({ data: await updatePost(c.req.valid("param").id, c.req.valid("json"), c.get("admin")) }),
);
postRoutes.patch(
  "/:id/featured",
  idValidator,
  zValidator("json", featuredPostSchema, (result, c) => {
    if (!result.success)
      return c.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: result.error.issues[0].message,
            fieldErrors: z.flattenError(result.error).fieldErrors,
          },
        },
        400,
      );
    return undefined;
  }),
  async (c) =>
    c.json({
      data: await updatePostFeatured(c.req.valid("param").id, c.req.valid("json"), c.get("admin")),
    }),
);
postRoutes.delete(
  "/:id",
  idValidator,
  zValidator("query", deletePostSchema, (result, c) => {
    if (!result.success)
      return c.json({ error: { code: "INVALID_INPUT", message: "请提供有效的文章版本号。" } }, 400);
    return undefined;
  }),
  async (c) =>
    c.json({
      data: await deletePost(c.req.valid("param").id, c.req.valid("query").version, c.get("admin")),
    }),
);
postRoutes.onError((error, c) => {
  if (error instanceof PostError) {
    const status =
      error.code === "UNAUTHORIZED"
        ? 401
        : error.code === "NOT_FOUND"
          ? 404
          : ["VERSION_CONFLICT", "SLUG_CONFLICT", "SLUG_LOCKED"].includes(error.code)
            ? 409
            : 400;
    return c.json(
      { error: { code: error.code, message: error.message, fieldErrors: error.fieldErrors } },
      status,
    );
  }
  if (error instanceof HTTPException && error.status === 400)
    return c.json({ error: { code: "INVALID_INPUT", message: "请求 JSON 格式无效。" } }, 400);
  console.error("文章接口失败", { name: error.name });
  return c.json(
    { error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请稍后重试。" } },
    503,
  );
});
