import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import type { NewTag, Tag } from "@/lib/db/schema";
import { tags } from "@/lib/db/schema";

export interface TagRepository {
  list(query: { page: number; pageSize: number }): Promise<{
    items: Tag[];
    total: number;
  }>;
  findById(id: string): Promise<Tag | null>;
  findBySlug(slug: string): Promise<Tag | null>;
  create(tag: NewTag): Promise<Tag>;
  update(
    id: string,
    tag: Partial<Pick<NewTag, "name" | "slug" | "description" | "updatedAt">>,
  ): Promise<Tag | null>;
  delete(id: string): Promise<boolean>;
}

const countTags = async () => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(tags);

  return rows[0]?.total ?? 0;
};

export const tagListOrderBy = [desc(tags.createdAt), desc(tags.id)] as const;

export const tagRepository: TagRepository = {
  async list({ page, pageSize }) {
    const offset = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      db
        .select()
        .from(tags)
        .orderBy(...tagListOrderBy)
        .limit(pageSize)
        .offset(offset),
      countTags(),
    ]);

    return { items, total };
  },
  async findById(id) {
    const rows = await db.select().from(tags).where(eq(tags.id, id)).limit(1);

    return rows[0] ?? null;
  },
  async findBySlug(slug) {
    const rows = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    return rows[0] ?? null;
  },
  async create(tag) {
    const rows = await db.insert(tags).values(tag).returning();

    return rows[0] as Tag;
  },
  async update(id, tag) {
    const rows = await db
      .update(tags)
      .set(tag)
      .where(eq(tags.id, id))
      .returning();

    return rows[0] ?? null;
  },
  async delete(id) {
    const rows = await db.delete(tags).where(eq(tags.id, id)).returning({
      id: tags.id,
    });

    return rows.length > 0;
  },
};
