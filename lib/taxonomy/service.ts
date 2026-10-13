import "server-only";
import { asc, count, eq, getTableColumns } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getSession } from "@/lib/auth/service";
import { getDatabase, writeTransaction, type DatabaseTransaction } from "@/lib/database";
import { category, post, postTag, tag } from "@/lib/database/schema";

import type { CategoryInput, CategoryUpdateInput, TagInput } from "./schema";

import { taxonomyNameKey } from "./schema";

export class TaxonomyError extends Error {
  constructor(
    public code:
      | "UNAUTHORIZED"
      | "DUPLICATE_NAME"
      | "NOT_FOUND"
      | "RESOURCE_IN_USE"
      | "VERSION_CONFLICT",
    message: string,
  ) {
    super(message);
  }
}

export type TaxonomyActor = { adminId: number; sessionToken: string | undefined };

// 数据访问入口也核对会话，写入事务中重新核对，避免排队期间会话被撤销。
function authorize(actor: TaxonomyActor) {
  const admin = getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new TaxonomyError("UNAUTHORIZED", "登录已失效，请重新登录。");
  return admin;
}

export async function listCategories(actor: TaxonomyActor) {
  authorize(actor);
  return getDatabase()
    .select({ ...getTableColumns(category), posts: count(post.id) })
    .from(category)
    .leftJoin(post, eq(category.id, post.categoryId))
    .groupBy(category.id)
    .orderBy(asc(category.createdAt), asc(category.id))
    .all();
}
export async function listTags(actor: TaxonomyActor) {
  authorize(actor);
  return getDatabase()
    .select({ ...getTableColumns(tag), postLinks: count(postTag.postId) })
    .from(tag)
    .leftJoin(postTag, eq(tag.id, postTag.tagId))
    .groupBy(tag.id)
    .orderBy(asc(tag.createdAt), asc(tag.id))
    .all();
}
function categoryWithCount(tx: DatabaseTransaction, id: string) {
  return tx
    .select({ ...getTableColumns(category), posts: count(post.id) })
    .from(category)
    .leftJoin(post, eq(category.id, post.categoryId))
    .where(eq(category.id, id))
    .groupBy(category.id)
    .get();
}
export async function createCategory(input: CategoryInput, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorize(actor);
    const nameKey = taxonomyNameKey(input.name);
    if (tx.select({ id: category.id }).from(category).where(eq(category.nameKey, nameKey)).get())
      throw new TaxonomyError("DUPLICATE_NAME", "该分类已存在。");
    return tx
      .insert(category)
      .values({
        ...input,
        id: randomUUID(),
        nameKey,
        createdAt: new Date(),
      })
      .returning()
      .get();
  });
}
export async function createTag(input: TagInput, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorize(actor);
    const nameKey = taxonomyNameKey(input.name);
    if (tx.select({ id: tag.id }).from(tag).where(eq(tag.nameKey, nameKey)).get())
      throw new TaxonomyError("DUPLICATE_NAME", "该标签已存在。");
    return tx
      .insert(tag)
      .values({ ...input, id: randomUUID(), nameKey, createdAt: new Date() })
      .returning()
      .get();
  });
}
export async function updateCategory(id: string, input: CategoryUpdateInput, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorize(actor);
    const previous = tx.select().from(category).where(eq(category.id, id)).get();
    if (!previous) throw new TaxonomyError("NOT_FOUND", "分类不存在，可能已被删除。");
    if (previous.name !== input.expected.name || previous.color !== input.expected.color)
      throw new TaxonomyError("VERSION_CONFLICT", "分类已被其他页面修改，请重新载入后核对。");
    const nameKey = taxonomyNameKey(input.name);
    const duplicate = tx
      .select({ id: category.id })
      .from(category)
      .where(eq(category.nameKey, nameKey))
      .get();
    if (duplicate && duplicate.id !== id)
      throw new TaxonomyError("DUPLICATE_NAME", "该分类已存在。");
    tx.update(category)
      .set({ name: input.name, color: input.color, nameKey })
      .where(eq(category.id, id))
      .run();
    return categoryWithCount(tx, id)!;
  });
}
export async function deleteCategory(id: string, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorize(actor);
    if (tx.select({ id: post.id }).from(post).where(eq(post.categoryId, id)).get())
      throw new TaxonomyError("RESOURCE_IN_USE", "分类已被文章引用，请先修改或删除关联文章。");
    if (!tx.delete(category).where(eq(category.id, id)).run().changes)
      throw new TaxonomyError("NOT_FOUND", "分类不存在。");
    return { id };
  });
}
export async function deleteTag(id: string, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorize(actor);
    if (tx.select({ postId: postTag.postId }).from(postTag).where(eq(postTag.tagId, id)).get())
      throw new TaxonomyError("RESOURCE_IN_USE", "标签已被文章引用，请先移除文章中的标签。");
    if (!tx.delete(tag).where(eq(tag.id, id)).run().changes)
      throw new TaxonomyError("NOT_FOUND", "标签不存在。");
    return { id };
  });
}
