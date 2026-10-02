import "server-only";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { SESSION_COOKIE, getSession } from "@/lib/auth/service";

import {
  commentIdSchema,
  commentQuerySchema,
  commentSchema,
  deleteCommentSchema,
  moderateCommentSchema,
  replyCommentSchema,
} from "./schema";
import {
  CommentError,
  createComment,
  deleteComment,
  getComment,
  getCommentSummary,
  listComments,
  moderateComment,
  replyComment,
} from "./service";

export const commentRoutes = new Hono<{ Variables: { admin: TaxonomyActor } }>();
commentRoutes.use("*", async (c, next) => {
  const sessionToken = getCookie(c, SESSION_COOKIE);
  const admin = await getSession(sessionToken);
  if (!admin)
    return c.json({ error: { code: "UNAUTHORIZED", message: "登录已失效，请重新登录。" } }, 401);
  c.set("admin", { adminId: admin.adminId, sessionToken });
  if (
    ["POST", "PUT"].includes(c.req.method) &&
    c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
  )
    return c.json(
      { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "请使用 JSON 提交。" } },
      415,
    );
  return next();
});
const idValidator = zValidator("param", commentIdSchema, (result, c) => {
  if (!result.success)
    return c.json({ error: { code: "INVALID_INPUT", message: "无效的评论 ID。" } }, 400);
  return undefined;
});
const queryValidator = zValidator("query", commentQuerySchema, (result, c) => {
  if (!result.success)
    return c.json(
      { error: { code: "INVALID_INPUT", message: result.error.issues[0].message } },
      400,
    );
  return undefined;
});
function jsonValidator<T extends z.ZodType>(schema: T) {
  return zValidator("json", schema, (result, c) => {
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
}
commentRoutes.get("/", queryValidator, async (c) =>
  c.json({ data: await listComments(c.req.valid("query"), c.get("admin")) }),
);
commentRoutes.get("/summary", async (c) =>
  c.json({ data: await getCommentSummary(c.get("admin")) }),
);
commentRoutes.get("/:id", idValidator, async (c) =>
  c.json({ data: await getComment(c.req.valid("param").id, c.get("admin")) }),
);
commentRoutes.post("/", jsonValidator(commentSchema), async (c) =>
  c.json({ data: await createComment(c.req.valid("json"), c.get("admin")) }, 201),
);
commentRoutes.put("/:id/status", idValidator, jsonValidator(moderateCommentSchema), async (c) =>
  c.json({
    data: await moderateComment(c.req.valid("param").id, c.req.valid("json"), c.get("admin")),
  }),
);
commentRoutes.post("/:id/replies", idValidator, jsonValidator(replyCommentSchema), async (c) =>
  c.json(
    { data: await replyComment(c.req.valid("param").id, c.req.valid("json"), c.get("admin")) },
    201,
  ),
);
commentRoutes.delete(
  "/:id",
  idValidator,
  zValidator("query", deleteCommentSchema, (result, c) => {
    if (!result.success)
      return c.json({ error: { code: "INVALID_INPUT", message: "请提供有效的评论版本号。" } }, 400);
    return undefined;
  }),
  async (c) =>
    c.json({
      data: await deleteComment(
        c.req.valid("param").id,
        c.req.valid("query").version,
        c.get("admin"),
      ),
    }),
);
commentRoutes.onError((error, c) => {
  if (error instanceof CommentError) {
    const status =
      error.code === "UNAUTHORIZED"
        ? 401
        : error.code === "NOT_FOUND"
          ? 404
          : error.code === "VERSION_CONFLICT"
            ? 409
            : 400;
    return c.json({ error: { code: error.code, message: error.message } }, status);
  }
  if (error instanceof HTTPException && error.status === 400)
    return c.json({ error: { code: "INVALID_INPUT", message: "请求 JSON 格式无效。" } }, 400);
  console.error("评论接口失败", { name: error.name });
  return c.json(
    { error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请稍后重试。" } },
    503,
  );
});
