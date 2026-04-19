import { asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import type { NewTag, Tag } from "@/lib/db/schema";
import { tags } from "@/lib/db/schema";
import type { TagListQuery } from "@/lib/server/tags/dto";

export interface TagRepository {
  list(query: TagListQuery): Promise<{
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

const buildTagWhere = (query?: string) =>
  query
    ? or(ilike(tags.name, `%${query}%`), ilike(tags.slug, `%${query}%`)) ??
      undefined
    : undefined;

const countTags = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(tags)
    .where(where);

  return rows[0]?.total ?? 0;
};

const tagOrderByMap = {
  createdAt: tags.createdAt,
  updatedAt: tags.updatedAt,
  name: tags.name,
} as const;

const buildTagOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<TagListQuery, "sortBy" | "sortDirection">) => {
  const primaryOrder =
    sortDirection === "asc" ? asc(tagOrderByMap[sortBy]) : desc(tagOrderByMap[sortBy]);

  if (sortBy === "name") {
    return [primaryOrder, desc(tags.updatedAt), desc(tags.id)] as const;
  }

  return [primaryOrder, desc(tags.id)] as const;
};

export const tagRepository: TagRepository = {
  async list({ page, pageSize, query, sortBy, sortDirection }) {
    const offset = (page - 1) * pageSize;
    const where = buildTagWhere(query);
    const [items, total] = await Promise.all([
      db
        .select()
        .from(tags)
        .where(where)
        .orderBy(...buildTagOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countTags(where),
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
