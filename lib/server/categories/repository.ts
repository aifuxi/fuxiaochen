import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import type { Category, NewCategory } from "@/lib/db/schema";
import { categories } from "@/lib/db/schema";

export interface CategoryRepository {
  list(query: { page: number; pageSize: number }): Promise<{
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

const countCategories = async () => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(categories);

  return rows[0]?.total ?? 0;
};

export const categoryRepository: CategoryRepository = {
  async list({ page, pageSize }) {
    const offset = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      db
        .select()
        .from(categories)
        .orderBy(desc(categories.createdAt))
        .limit(pageSize)
        .offset(offset),
      countCategories(),
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
