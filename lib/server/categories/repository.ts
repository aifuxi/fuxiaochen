import { asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import type { Category } from "@/lib/db/schema";
import { blogs, categories } from "@/lib/db/schema";
import type { AdminCategoryListQuery } from "@/lib/server/categories/dto";

import type { CategoryReadModel, CategoryRepository } from "./service";

const buildCategoryWhere = (query?: string) =>
  query
    ? (or(
        ilike(categories.name, `%${query}%`),
        ilike(categories.slug, `%${query}%`),
      ) ?? undefined)
    : undefined;

const categoryFields = {
  id: categories.id,
  createdAt: categories.createdAt,
  updatedAt: categories.updatedAt,
  name: categories.name,
  slug: categories.slug,
};

const categoryCounts = db
  .select({
    categoryId: blogs.categoryId,
    blogCount: sql<number>`count(*)`.mapWith(Number).as("blog_count"),
    publishedBlogCount:
      sql<number>`count(*) filter (where ${blogs.published} = true)`
        .mapWith(Number)
        .as("published_blog_count"),
  })
  .from(blogs)
  .groupBy(blogs.categoryId)
  .as("category_counts");

const countCategories = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(categories)
    .where(where);

  return rows[0]?.total ?? 0;
};

const adminOrderByMap = {
  name: categories.name,
  updatedAt: categories.updatedAt,
} as const;

const buildAdminOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<AdminCategoryListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "postCount") {
    return [
      sortDirection === "asc"
        ? sql`coalesce(${categoryCounts.blogCount}, 0) asc`
        : sql`coalesce(${categoryCounts.blogCount}, 0) desc`,
      asc(categories.name),
      desc(categories.id),
    ] as const;
  }

  return [
    sortDirection === "asc"
      ? asc(adminOrderByMap[sortBy])
      : desc(adminOrderByMap[sortBy]),
    asc(categories.name),
    desc(categories.id),
  ] as const;
};

const toCategoryReadModel = (
  row: Category & {
    blogCount: number | null;
    publishedBlogCount: number | null;
  },
): CategoryReadModel => ({
  ...row,
  blogCount: row.blogCount ?? 0,
  publishedBlogCount: row.publishedBlogCount ?? 0,
});

export const categoryRepository: CategoryRepository = {
  async listAdmin({ page, pageSize, query, sortBy, sortDirection }) {
    const offset = (page - 1) * pageSize;
    const where = buildCategoryWhere(query);
    const [items, total] = await Promise.all([
      db
        .select({
          ...categoryFields,
          blogCount: categoryCounts.blogCount,
          publishedBlogCount: categoryCounts.publishedBlogCount,
        })
        .from(categories)
        .leftJoin(categoryCounts, eq(categories.id, categoryCounts.categoryId))
        .where(where)
        .orderBy(...buildAdminOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countCategories(where),
    ]);

    return {
      items: items.map(toCategoryReadModel),
      total,
    };
  },
  async listPublic() {
    const items = await db
      .select({
        ...categoryFields,
        blogCount: categoryCounts.blogCount,
        publishedBlogCount: categoryCounts.publishedBlogCount,
      })
      .from(categories)
      .leftJoin(categoryCounts, eq(categories.id, categoryCounts.categoryId))
      .where(sql`coalesce(${categoryCounts.publishedBlogCount}, 0) > 0`)
      .orderBy(asc(categories.name), asc(categories.id));

    return items.map(toCategoryReadModel);
  },
  async findById(id) {
    const rows = await db
      .select({
        ...categoryFields,
        blogCount: categoryCounts.blogCount,
        publishedBlogCount: categoryCounts.publishedBlogCount,
      })
      .from(categories)
      .leftJoin(categoryCounts, eq(categories.id, categoryCounts.categoryId))
      .where(eq(categories.id, id))
      .limit(1);

    const row = rows[0];
    return row ? toCategoryReadModel(row) : null;
  },
  async findBySlug(slug) {
    const rows = await db
      .select({
        ...categoryFields,
        blogCount: categoryCounts.blogCount,
        publishedBlogCount: categoryCounts.publishedBlogCount,
      })
      .from(categories)
      .leftJoin(categoryCounts, eq(categories.id, categoryCounts.categoryId))
      .where(eq(categories.slug, slug))
      .limit(1);

    const row = rows[0];
    return row ? toCategoryReadModel(row) : null;
  },
  async create(category) {
    const rows = await db.insert(categories).values(category).returning();
    const insertedCategory = rows[0] as Category | undefined;

    if (!insertedCategory) {
      throw new Error("Category insert did not return a row");
    }

    return {
      ...insertedCategory,
      blogCount: 0,
      publishedBlogCount: 0,
    };
  },
  async update(id, category) {
    const rows = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();

    const updatedCategory = rows[0];

    if (!updatedCategory) {
      return null;
    }

    const counts = await this.findById(updatedCategory.id);
    return counts;
  },
  async delete(id) {
    const rows = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({
        id: categories.id,
      });

    return rows.length > 0;
  },
};
