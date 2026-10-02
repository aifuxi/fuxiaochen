import "server-only";
import type { Context } from "hono";

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

import { SESSION_COOKIE, getSession } from "@/lib/auth/service";

import type { TaxonomyActor } from "./service";

import { categorySchema, tagSchema, taxonomyIdSchema } from "./schema";
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  listCategories,
  listTags,
  TaxonomyError,
} from "./service";

type TaxonomyEnv = { Variables: { admin: TaxonomyActor } };
export const taxonomyRoutes = new Hono<TaxonomyEnv>();
taxonomyRoutes.use("*", async (c, next) => {
  const sessionToken = getCookie(c, SESSION_COOKIE);
  const admin = await getSession(sessionToken);
  if (!admin) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "登录已失效，请重新登录。" } }, 401);
  }
  c.set("admin", { adminId: admin.adminId, sessionToken });
  if (
    c.req.method === "POST" &&
    c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
  ) {
    return c.json(
      { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "请使用 JSON 提交。" } },
      415,
    );
  }
  return next();
});

const categoryValidator = zValidator("json", categorySchema, (result, c) => {
  if (!result.success)
    return c.json(
      { error: { code: "INVALID_INPUT", message: result.error.issues[0].message } },
      400,
    );
  return undefined;
});
const tagValidator = zValidator("json", tagSchema, (result, c) => {
  if (!result.success)
    return c.json(
      { error: { code: "INVALID_INPUT", message: result.error.issues[0].message } },
      400,
    );
  return undefined;
});
const idValidator = zValidator("param", taxonomyIdSchema, (result, c) => {
  if (!result.success)
    return c.json({ error: { code: "INVALID_INPUT", message: "无效的记录 ID。" } }, 400);
  return undefined;
});
const actor = (c: Context<TaxonomyEnv>) => c.get("admin");
taxonomyRoutes.get("/categories", async (c) =>
  c.json({
    data: (await listCategories(actor(c))).map(({ nameKey: _nameKey, posts, ...item }) => ({
      ...item,
      postCount: posts,
    })),
  }),
);
taxonomyRoutes.get("/tags", async (c) =>
  c.json({
    data: (await listTags(actor(c))).map(({ nameKey: _nameKey, postLinks, ...item }) => ({
      ...item,
      postCount: postLinks,
    })),
  }),
);
taxonomyRoutes.post("/categories", categoryValidator, async (c) => {
  const { nameKey: _nameKey, ...item } = await createCategory(c.req.valid("json"), actor(c));
  return c.json({ data: { ...item, postCount: 0 } }, 201);
});
taxonomyRoutes.post("/tags", tagValidator, async (c) => {
  const { nameKey: _nameKey, ...item } = await createTag(c.req.valid("json"), actor(c));
  return c.json({ data: { ...item, postCount: 0 } }, 201);
});
taxonomyRoutes.delete("/categories/:id", idValidator, async (c) =>
  c.json({ data: await deleteCategory(c.req.valid("param").id, actor(c)) }),
);
taxonomyRoutes.delete("/tags/:id", idValidator, async (c) =>
  c.json({ data: await deleteTag(c.req.valid("param").id, actor(c)) }),
);
taxonomyRoutes.notFound((c) =>
  c.json({ error: { code: "NOT_FOUND", message: "接口不存在。" } }, 404),
);
taxonomyRoutes.onError((error, c) => {
  if (error instanceof TaxonomyError) {
    const status = error.code === "UNAUTHORIZED" ? 401 : error.code === "NOT_FOUND" ? 404 : 409;
    return c.json({ error: { code: error.code, message: error.message } }, status);
  }
  // Prisma SQLite 驱动将唯一约束错误规范化为 SQLSTATE 23505。
  if (
    "kind" in error &&
    error.kind === "sql_query" &&
    "sqlState" in error &&
    error.sqlState === "23505"
  ) {
    return c.json({ error: { code: "DUPLICATE_NAME", message: "该名称已存在。" } }, 409);
  }
  if (error instanceof HTTPException && error.status === 400) {
    return c.json({ error: { code: "INVALID_INPUT", message: "请求 JSON 格式无效。" } }, 400);
  }
  console.error("分类与标签接口失败", { name: error.name });
  return c.json(
    { error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请稍后重试。" } },
    503,
  );
});
