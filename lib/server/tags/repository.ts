import { asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { blogTags, blogs, tags, type Tag } from "@/lib/db/schema";
import type { AdminTagListQuery } from "@/lib/server/tags/dto";

import type { TagReadModel, TagRepository } from "./service";

const buildTagWhere = (query?: string) =>
  query
    ? (or(
        ilike(tags.name, `%${query}%`),
        ilike(tags.slug, `%${query}%`),
        ilike(tags.description, `%${query}%`),
      ) ?? undefined)
    : undefined;

const tagFields = {
  id: tags.id,
  createdAt: tags.createdAt,
  updatedAt: tags.updatedAt,
  name: tags.name,
  slug: tags.slug,
  description: tags.description,
};

const tagCounts = db
  .select({
    tagId: blogTags.tagId,
    blogCount: sql<number>`count(*)`.mapWith(Number).as("blog_count"),
    publishedBlogCount:
      sql<number>`count(*) filter (where ${blogs.published} = true)`
        .mapWith(Number)
        .as("published_blog_count"),
  })
  .from(blogTags)
  .innerJoin(blogs, eq(blogTags.blogId, blogs.id))
  .groupBy(blogTags.tagId)
  .as("tag_counts");

const countTags = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(tags)
    .where(where);

  return rows[0]?.total ?? 0;
};

const adminOrderByMap = {
  name: tags.name,
  updatedAt: tags.updatedAt,
} as const;

const buildAdminOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<AdminTagListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "postCount") {
    return [
      sortDirection === "asc"
        ? sql`coalesce(${tagCounts.blogCount}, 0) asc`
        : sql`coalesce(${tagCounts.blogCount}, 0) desc`,
      asc(tags.name),
      desc(tags.id),
    ] as const;
  }

  return [
    sortDirection === "asc"
      ? asc(adminOrderByMap[sortBy])
      : desc(adminOrderByMap[sortBy]),
    asc(tags.name),
    desc(tags.id),
  ] as const;
};

const toTagReadModel = (
  row: Tag & {
    blogCount: number | null;
    publishedBlogCount: number | null;
  },
): TagReadModel => ({
  ...row,
  blogCount: row.blogCount ?? 0,
  publishedBlogCount: row.publishedBlogCount ?? 0,
});

export const tagRepository: TagRepository = {
  async listAdmin({ page, pageSize, query, sortBy, sortDirection }) {
    const offset = (page - 1) * pageSize;
    const where = buildTagWhere(query);
    const [items, total] = await Promise.all([
      db
        .select({
          ...tagFields,
          blogCount: tagCounts.blogCount,
          publishedBlogCount: tagCounts.publishedBlogCount,
        })
        .from(tags)
        .leftJoin(tagCounts, eq(tags.id, tagCounts.tagId))
        .where(where)
        .orderBy(...buildAdminOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countTags(where),
    ]);

    return {
      items: items.map(toTagReadModel),
      total,
    };
  },
  async listPublic() {
    const items = await db
      .select({
        ...tagFields,
        blogCount: tagCounts.blogCount,
        publishedBlogCount: tagCounts.publishedBlogCount,
      })
      .from(tags)
      .leftJoin(tagCounts, eq(tags.id, tagCounts.tagId))
      .where(sql`coalesce(${tagCounts.publishedBlogCount}, 0) > 0`)
      .orderBy(asc(tags.name), asc(tags.id));

    return items.map(toTagReadModel);
  },
  async findById(id) {
    const rows = await db
      .select({
        ...tagFields,
        blogCount: tagCounts.blogCount,
        publishedBlogCount: tagCounts.publishedBlogCount,
      })
      .from(tags)
      .leftJoin(tagCounts, eq(tags.id, tagCounts.tagId))
      .where(eq(tags.id, id))
      .limit(1);

    const row = rows[0];
    return row ? toTagReadModel(row) : null;
  },
  async findBySlug(slug) {
    const rows = await db
      .select({
        ...tagFields,
        blogCount: tagCounts.blogCount,
        publishedBlogCount: tagCounts.publishedBlogCount,
      })
      .from(tags)
      .leftJoin(tagCounts, eq(tags.id, tagCounts.tagId))
      .where(eq(tags.slug, slug))
      .limit(1);

    const row = rows[0];
    return row ? toTagReadModel(row) : null;
  },
  async create(tag) {
    const rows = await db.insert(tags).values(tag).returning();
    const insertedTag = rows[0] as Tag | undefined;

    if (!insertedTag) {
      throw new Error("Tag insert did not return a row");
    }

    return {
      ...insertedTag,
      blogCount: 0,
      publishedBlogCount: 0,
    };
  },
  async update(id, tag) {
    const rows = await db
      .update(tags)
      .set(tag)
      .where(eq(tags.id, id))
      .returning();

    const updatedTag = rows[0];

    if (!updatedTag) {
      return null;
    }

    return this.findById(updatedTag.id);
  },
  async delete(id) {
    const rows = await db.delete(tags).where(eq(tags.id, id)).returning({
      id: tags.id,
    });

    return rows.length > 0;
  },
};
