import "server-only";
import { randomUUID } from "node:crypto";

import { getSession } from "@/lib/auth/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import type { CategoryInput, TagInput } from "./schema";

import { taxonomyNameKey } from "./schema";

export class TaxonomyError extends Error {
  constructor(
    public code: "UNAUTHORIZED" | "DUPLICATE_NAME" | "NOT_FOUND" | "RESOURCE_IN_USE",
    message: string,
  ) {
    super(message);
  }
}

export type TaxonomyActor = { adminId: number; sessionToken: string | undefined };

// 数据访问入口也核对会话，写入事务中重新核对，避免排队期间会话被撤销。
async function authorize(actor: TaxonomyActor) {
  const admin = await getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new TaxonomyError("UNAUTHORIZED", "登录已失效，请重新登录。");
  return admin;
}

export async function listCategories(actor: TaxonomyActor) {
  await authorize(actor);
  return getDatabase()
    .orm.Category.include("posts", (posts) => posts.count())
    .orderBy([(c) => c.createdAt.asc(), (c) => c.id.asc()])
    .all();
}
export async function listTags(actor: TaxonomyActor) {
  await authorize(actor);
  return getDatabase()
    .orm.Tag.include("postLinks", (links) => links.count())
    .orderBy([(t) => t.createdAt.asc(), (t) => t.id.asc()])
    .all();
}

export async function createCategory(input: CategoryInput, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorize(actor);
    const nameKey = taxonomyNameKey(input.name);
    if (await tx.orm.Category.where({ nameKey }).first()) {
      throw new TaxonomyError("DUPLICATE_NAME", "该分类已存在。");
    }
    return tx.orm.Category.create({ ...input, id: randomUUID(), nameKey, createdAt: new Date() });
  });
}
export async function createTag(input: TagInput, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorize(actor);
    const nameKey = taxonomyNameKey(input.name);
    if (await tx.orm.Tag.where({ nameKey }).first()) {
      throw new TaxonomyError("DUPLICATE_NAME", "该标签已存在。");
    }
    return tx.orm.Tag.create({ ...input, id: randomUUID(), nameKey, createdAt: new Date() });
  });
}
export async function deleteCategory(id: string, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorize(actor);
    if (await tx.orm.Post.where({ categoryId: id }).first())
      throw new TaxonomyError("RESOURCE_IN_USE", "分类已被文章引用，请先修改或删除关联文章。");
    if (!(await tx.orm.Category.where({ id }).deleteAndCount())) {
      throw new TaxonomyError("NOT_FOUND", "分类不存在。");
    }
    return { id };
  });
}
export async function deleteTag(id: string, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorize(actor);
    if (await tx.orm.PostTag.where({ tagId: id }).first())
      throw new TaxonomyError("RESOURCE_IN_USE", "标签已被文章引用，请先移除文章中的标签。");
    if (!(await tx.orm.Tag.where({ id }).deleteAndCount())) {
      throw new TaxonomyError("NOT_FOUND", "标签不存在。");
    }
    return { id };
  });
}
