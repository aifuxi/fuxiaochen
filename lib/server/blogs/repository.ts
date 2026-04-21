import {
  and,
  asc,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  ne,
  or,
  sql,
  type SQL,
  type SQLWrapper,
} from "drizzle-orm";

import { db } from "@/lib/db";
import {
  blogTags,
  blogs,
  categories,
  tags,
  type Blog,
  type Category,
  type NewBlogTag,
} from "@/lib/db/schema";
import type {
  AdminBlogListQuery,
  PublicBlogListQuery,
} from "@/lib/server/blogs/dto";

import type {
  BlogCategorySummary,
  BlogReadModel,
  BlogRepository,
  BlogTagSummary,
} from "./service";

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

const buildAdminWhere = ({
  query,
  categoryId,
  tagId,
  featured,
  published,
}: Pick<
  AdminBlogListQuery,
  "query" | "categoryId" | "tagId" | "featured" | "published"
>) => {
  const filters: SQLWrapper[] = [];

  if (query) {
    filters.push(
      or(
        ilike(blogs.title, `%${query}%`),
        ilike(blogs.slug, `%${query}%`),
        ilike(blogs.description, `%${query}%`),
      )!,
    );
  }

  if (categoryId) {
    filters.push(eq(blogs.categoryId, categoryId));
  }

  if (tagId) {
    filters.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(blogTags)
          .where(and(eq(blogTags.blogId, blogs.id), eq(blogTags.tagId, tagId))),
      ),
    );
  }

  if (featured !== undefined) {
    filters.push(eq(blogs.featured, featured));
  }

  if (published !== undefined) {
    filters.push(eq(blogs.published, published));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};

const buildPublicWhere = ({
  query,
  category,
  tag,
  featured,
}: Pick<PublicBlogListQuery, "query" | "category" | "tag" | "featured">) => {
  const filters: SQLWrapper[] = [eq(blogs.published, true)];

  if (query) {
    filters.push(
      or(
        ilike(blogs.title, `%${query}%`),
        ilike(blogs.description, `%${query}%`),
        ilike(blogs.content, `%${query}%`),
      )!,
    );
  }

  if (category) {
    filters.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(categories)
          .where(
            and(
              eq(categories.id, blogs.categoryId),
              eq(categories.slug, category),
            ),
          ),
      ),
    );
  }

  if (tag) {
    filters.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(blogTags)
          .innerJoin(tags, eq(blogTags.tagId, tags.id))
          .where(and(eq(blogTags.blogId, blogs.id), eq(tags.slug, tag))),
      ),
    );
  }

  if (featured !== undefined) {
    filters.push(eq(blogs.featured, featured));
  }

  return and(...filters);
};

const buildAdminOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<AdminBlogListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "publishedAt") {
    return [
      sql`case when ${blogs.publishedAt} is null then 1 else 0 end`,
      sortDirection === "asc"
        ? asc(blogs.publishedAt)
        : desc(blogs.publishedAt),
      desc(blogs.updatedAt),
      desc(blogs.id),
    ] as const;
  }

  if (sortBy === "title") {
    return [
      sortDirection === "asc" ? asc(blogs.title) : desc(blogs.title),
      desc(blogs.updatedAt),
      desc(blogs.id),
    ] as const;
  }

  return [
    sortDirection === "asc" ? asc(blogs.updatedAt) : desc(blogs.updatedAt),
    desc(blogs.id),
  ] as const;
};

const buildPublicOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<PublicBlogListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "title") {
    return [
      sortDirection === "asc" ? asc(blogs.title) : desc(blogs.title),
      desc(blogs.publishedAt),
      desc(blogs.id),
    ] as const;
  }

  return [
    sql`case when ${blogs.publishedAt} is null then 1 else 0 end`,
    sortDirection === "asc" ? asc(blogs.publishedAt) : desc(blogs.publishedAt),
    desc(blogs.createdAt),
    desc(blogs.id),
  ] as const;
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
    .orderBy(asc(tags.name), asc(tags.id));

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

const getBaseSelection = () => ({
  blog: blogs,
  category: {
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
  },
});

export const blogRepository: BlogRepository = {
  async listAdmin({
    page,
    pageSize,
    query,
    categoryId,
    tagId,
    featured,
    published,
    sortBy,
    sortDirection,
  }) {
    const offset = (page - 1) * pageSize;
    const where = buildAdminWhere({
      query,
      categoryId,
      tagId,
      featured,
      published,
    });

    const [rows, total] = await Promise.all([
      db
        .select(getBaseSelection())
        .from(blogs)
        .leftJoin(categories, eq(blogs.categoryId, categories.id))
        .where(where)
        .orderBy(...buildAdminOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countBlogs(where),
    ]);

    return {
      items: await attachRelations(rows),
      total,
    };
  },
  async listPublic({
    page,
    pageSize,
    query,
    category,
    tag,
    featured,
    sortBy,
    sortDirection,
  }) {
    const offset = (page - 1) * pageSize;
    const where = buildPublicWhere({
      query,
      category,
      tag,
      featured,
    });

    const [rows, total] = await Promise.all([
      db
        .select(getBaseSelection())
        .from(blogs)
        .leftJoin(categories, eq(blogs.categoryId, categories.id))
        .where(where)
        .orderBy(...buildPublicOrderBy({ sortBy, sortDirection }))
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
      .select(getBaseSelection())
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
      .select(getBaseSelection())
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
  async listSimilar(blogId, categoryId, tagIds, limit) {
    const tagMatchFilter =
      tagIds.length > 0
        ? exists(
            db
              .select({ one: sql`1` })
              .from(blogTags)
              .where(
                and(
                  eq(blogTags.blogId, blogs.id),
                  inArray(blogTags.tagId, tagIds),
                ),
              ),
          )
        : undefined;

    const relationFilter =
      tagMatchFilter === undefined
        ? eq(blogs.categoryId, categoryId)
        : or(eq(blogs.categoryId, categoryId), tagMatchFilter)!;

    const rows = await db
      .select(getBaseSelection())
      .from(blogs)
      .leftJoin(categories, eq(blogs.categoryId, categories.id))
      .where(
        and(eq(blogs.published, true), ne(blogs.id, blogId), relationFilter),
      )
      .orderBy(
        sql`case when ${blogs.publishedAt} is null then 1 else 0 end`,
        desc(blogs.publishedAt),
        desc(blogs.createdAt),
        desc(blogs.id),
      )
      .limit(limit);

    return attachRelations(rows);
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
