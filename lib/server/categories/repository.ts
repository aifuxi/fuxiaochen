import { asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import type { Category, NewCategory } from "@/lib/db/schema";
import { categories } from "@/lib/db/schema";
import type { CategoryListQuery } from "@/lib/server/categories/dto";

export interface CategoryRepository {
  list(query: CategoryListQuery): Promise<{
    items: Category[];
    total: number;
  }>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(category: NewCategory): Promise<Category>;
  update(
    id: string,
    category: Partial<
      Pick<NewCategory, "name" | "slug" | "description" | "updatedAt">
    >,
  ): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
}

const buildCategoryWhere = (query?: string) =>
  query
    ? (or(
        ilike(categories.name, `%${query}%`),
        ilike(categories.slug, `%${query}%`),
      ) ?? undefined)
    : undefined;

const countCategories = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(categories)
    .where(where);

  return rows[0]?.total ?? 0;
};

const categoryOrderByMap = {
  createdAt: categories.createdAt,
  updatedAt: categories.updatedAt,
  name: categories.name,
} as const;

export const categoryListOrderBy = [
  desc(categories.createdAt),
  desc(categories.id),
] as const;

const buildCategoryOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<CategoryListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "createdAt" && sortDirection === "desc") {
    return categoryListOrderBy;
  }

  const primaryOrder =
    sortDirection === "asc"
      ? asc(categoryOrderByMap[sortBy])
      : desc(categoryOrderByMap[sortBy]);

  if (sortBy === "name") {
    return [
      primaryOrder,
      desc(categories.updatedAt),
      desc(categories.id),
    ] as const;
  }

  return [primaryOrder, desc(categories.id)] as const;
};

export const categoryRepository: CategoryRepository = {
  async list({ page, pageSize, query, sortBy, sortDirection }) {
    const offset = (page - 1) * pageSize;
    const where = buildCategoryWhere(query);
    const [items, total] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(where)
        .orderBy(...buildCategoryOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countCategories(where),
    ]);

    return { items, total };
  },
  async findById(id) {
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return rows[0] ?? null;
  },
  async findBySlug(slug) {
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return rows[0] ?? null;
  },
  async create(category) {
    const rows = await db.insert(categories).values(category).returning();

    return rows[0] as Category;
  },
  async update(id, category) {
    const rows = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();

    return rows[0] ?? null;
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
