import {
  and,
  desc,
  eq,
  inArray,
  sql,
  type SQL,
  type SQLWrapper,
} from "drizzle-orm";

import { db } from "@/lib/db";
import type { Blog, Category, NewBlogTag } from "@/lib/db/schema";
import { blogTags, blogs, categories, tags } from "@/lib/db/schema";

import type {
  BlogCategorySummary,
  BlogReadModel,
  BlogRepository,
  BlogTagSummary,
} from "./service";

const blogListOrderBy = [
  sql`case when ${blogs.publishedAt} is null then 1 else 0 end`,
  desc(blogs.publishedAt),
  desc(blogs.createdAt),
  desc(blogs.id),
] as const;

const toBlogCategory = (
  row: Pick<Category, "id" | "name" | "slug"> | null,
): BlogCategorySummary | null => {
  if (!row?.id) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
};

const buildFilters = ({
  published,
  featured,
  categoryId,
}: {
  published?: boolean;
  featured?: boolean;
  categoryId?: string;
}) => {
  const filters: SQLWrapper[] = [];

  if (published !== undefined) {
    filters.push(eq(blogs.published, published));
  }
  if (featured !== undefined) {
    filters.push(eq(blogs.featured, featured));
  }
  if (categoryId !== undefined) {
    filters.push(eq(blogs.categoryId, categoryId));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};

const countBlogs = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(blogs)
    .where(where);

  return rows[0]?.total ?? 0;
};

const listTagsByBlogIds = async (blogIds: string[]) => {
  if (blogIds.length === 0) {
    return new Map<string, BlogTagSummary[]>();
  }

  const rows = await db
    .select({
      blogId: blogTags.blogId,
      tagId: tags.id,
      tagName: tags.name,
      tagSlug: tags.slug,
    })
    .from(blogTags)
    .innerJoin(tags, eq(blogTags.tagId, tags.id))
    .where(inArray(blogTags.blogId, blogIds))
    .orderBy(desc(tags.createdAt), desc(tags.id));

  const tagsByBlogId = new Map<string, BlogTagSummary[]>();

  for (const row of rows) {
    const currentTags = tagsByBlogId.get(row.blogId) ?? [];
    currentTags.push({
      id: row.tagId,
      name: row.tagName,
      slug: row.tagSlug,
    });
    tagsByBlogId.set(row.blogId, currentTags);
  }

  return tagsByBlogId;
};

const attachRelations = async (
  items: Array<{
    blog: Blog;
    category: Pick<Category, "id" | "name" | "slug"> | null;
  }>,
): Promise<BlogReadModel[]> => {
  const tagsByBlogId = await listTagsByBlogIds(
    items.map((item) => item.blog.id),
  );

  return items.map(({ blog, category }) => ({
    ...blog,
    category: toBlogCategory(category),
    tags: tagsByBlogId.get(blog.id) ?? [],
  }));
};

export const blogRepository: BlogRepository = {
  async list({ page, pageSize, published, featured, categoryId }) {
    const offset = (page - 1) * pageSize;
    const where = buildFilters({
      published,
      featured,
      categoryId,
    });

    const [rows, total] = await Promise.all([
      db
        .select({
          blog: blogs,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(blogs)
        .leftJoin(categories, eq(blogs.categoryId, categories.id))
        .where(where)
        .orderBy(...blogListOrderBy)
        .limit(pageSize)
        .offset(offset),
      countBlogs(where),
    ]);

    return {
      items: await attachRelations(rows),
      total,
    };
  },
  async findById(id) {
    const rows = await db
      .select({
        blog: blogs,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(blogs)
      .leftJoin(categories, eq(blogs.categoryId, categories.id))
      .where(eq(blogs.id, id))
      .limit(1);

    const row = rows[0];

    if (!row) {
      return null;
    }

    const [blog] = await attachRelations([row]);
    return blog ?? null;
  },
  async findBySlug(slug) {
    const rows = await db
      .select({
        blog: blogs,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(blogs)
      .leftJoin(categories, eq(blogs.categoryId, categories.id))
      .where(eq(blogs.slug, slug))
      .limit(1);

    const row = rows[0];

    if (!row) {
      return null;
    }

    const [blog] = await attachRelations([row]);
    return blog ?? null;
  },
  async findCategoryById(id) {
    const rows = await db
      .select({
        id: categories.id,
      })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return rows[0] ?? null;
  },
  async findTagsByIds(ids) {
    if (ids.length === 0) {
      return [];
    }

    return db
      .select({
        id: tags.id,
      })
      .from(tags)
      .where(inArray(tags.id, ids));
  },
  async create(blog, { tagIds }) {
    const createdBlogId = await db.transaction(async (tx) => {
      const insertedBlogs = await tx.insert(blogs).values(blog).returning();
      const insertedBlog = insertedBlogs[0];

      if (!insertedBlog) {
        throw new Error("Blog insert did not return a row");
      }

      if (tagIds.length > 0) {
        const values: NewBlogTag[] = tagIds.map((tagId) => ({
          blogId: insertedBlog.id,
          tagId,
        }));

        await tx.insert(blogTags).values(values);
      }
      return insertedBlog.id;
    });

    const createdBlog = await this.findById(createdBlogId);

    if (!createdBlog) {
      throw new Error("Created blog could not be loaded");
    }

    return createdBlog;
  },
  async update(id, blog, { replaceTagIds }) {
    const updatedBlogId = await db.transaction(async (tx) => {
      const updatedBlogs = await tx
        .update(blogs)
        .set(blog)
        .where(eq(blogs.id, id))
        .returning();
      const updatedBlog = updatedBlogs[0];

      if (!updatedBlog) {
        return null;
      }

      if (replaceTagIds !== undefined) {
        await tx.delete(blogTags).where(eq(blogTags.blogId, id));

        if (replaceTagIds.length > 0) {
          const values: NewBlogTag[] = replaceTagIds.map((tagId) => ({
            blogId: id,
            tagId,
          }));

          await tx.insert(blogTags).values(values);
        }
      }
      return updatedBlog.id;
    });

    if (!updatedBlogId) {
      return null;
    }

    return this.findById(updatedBlogId);
  },
  async delete(id) {
    const rows = await db.delete(blogs).where(eq(blogs.id, id)).returning({
      id: blogs.id,
    });

    return rows.length > 0;
  },
};
