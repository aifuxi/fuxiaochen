import {
  and,
  asc,
  desc,
  eq,
  ilike,
  sql,
  type SQL,
  type SQLWrapper,
} from "drizzle-orm";

import { db } from "@/lib/db";
import {
  blogs,
  comments,
  type Blog,
  type Comment as DbComment,
} from "@/lib/db/schema";
import type { AdminCommentListQuery } from "@/lib/server/comments/dto";

import type {
  CommentBlogSummary,
  CommentReadModel,
  CommentRepository,
  CommentStats,
} from "./service";

const toCommentBlog = (
  row: Pick<Blog, "id" | "slug" | "title"> | null,
): CommentBlogSummary | null => {
  if (!row?.id) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
  };
};

const getBaseSelection = () => ({
  comment: comments,
  blog: {
    id: blogs.id,
    slug: blogs.slug,
    title: blogs.title,
  },
});

const attachRelations = (
  items: Array<{
    comment: DbComment;
    blog: Pick<Blog, "id" | "slug" | "title"> | null;
  }>,
): CommentReadModel[] =>
  items.map(({ comment, blog }) => ({
    ...comment,
    blog: toCommentBlog(blog),
  }));

const buildAdminWhere = ({
  query,
  status,
  postSlug,
}: Pick<AdminCommentListQuery, "query" | "status" | "postSlug">) => {
  const filters: SQLWrapper[] = [];

  if (query) {
    filters.push(
      sql.join(
        [
          ilike(comments.author, `%${query}%`),
          ilike(comments.email, `%${query}%`),
          ilike(comments.content, `%${query}%`),
          ilike(blogs.title, `%${query}%`),
          ilike(blogs.slug, `%${query}%`),
        ],
        sql` or `,
      ) as SQLWrapper,
    );
  }

  if (status) {
    filters.push(eq(comments.status, status));
  }

  if (postSlug) {
    filters.push(eq(blogs.slug, postSlug));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};

const buildAdminOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<AdminCommentListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "author") {
    return [
      sortDirection === "asc" ? asc(comments.author) : desc(comments.author),
      desc(comments.createdAt),
      desc(comments.id),
    ] as const;
  }

  if (sortBy === "status") {
    return [
      sortDirection === "asc" ? asc(comments.status) : desc(comments.status),
      desc(comments.createdAt),
      desc(comments.id),
    ] as const;
  }

  if (sortBy === "updatedAt") {
    return [
      sortDirection === "asc"
        ? asc(comments.updatedAt)
        : desc(comments.updatedAt),
      desc(comments.id),
    ] as const;
  }

  return [
    sortDirection === "asc"
      ? asc(comments.createdAt)
      : desc(comments.createdAt),
    desc(comments.id),
  ] as const;
};

const countComments = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(comments)
    .innerJoin(blogs, eq(comments.blogId, blogs.id))
    .where(where);

  return rows[0]?.total ?? 0;
};

export const commentRepository: CommentRepository = {
  async listAdmin({
    page,
    pageSize,
    query,
    status,
    postSlug,
    sortBy,
    sortDirection,
  }) {
    const offset = (page - 1) * pageSize;
    const where = buildAdminWhere({
      query,
      status,
      postSlug,
    });

    const [rows, total] = await Promise.all([
      db
        .select(getBaseSelection())
        .from(comments)
        .innerJoin(blogs, eq(comments.blogId, blogs.id))
        .where(where)
        .orderBy(...buildAdminOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countComments(where),
    ]);

    return {
      items: attachRelations(rows),
      total,
    };
  },
  async listPublicByPostSlug(postSlug) {
    const rows = await db
      .select(getBaseSelection())
      .from(comments)
      .innerJoin(blogs, eq(comments.blogId, blogs.id))
      .where(
        and(
          eq(blogs.slug, postSlug),
          eq(blogs.published, true),
          eq(comments.status, "approved"),
        ),
      )
      .orderBy(desc(comments.createdAt), desc(comments.id));

    return attachRelations(rows);
  },
  async getStats() {
    const rows = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        pending:
          sql<number>`sum(case when ${comments.status} = 'pending' then 1 else 0 end)`.mapWith(
            Number,
          ),
        approved:
          sql<number>`sum(case when ${comments.status} = 'approved' then 1 else 0 end)`.mapWith(
            Number,
          ),
        spam: sql<number>`sum(case when ${comments.status} = 'spam' then 1 else 0 end)`.mapWith(
          Number,
        ),
      })
      .from(comments);

    const stats = rows[0];

    return {
      total: stats?.total ?? 0,
      pending: stats?.pending ?? 0,
      approved: stats?.approved ?? 0,
      spam: stats?.spam ?? 0,
    } satisfies CommentStats;
  },
  async findById(id) {
    const rows = await db
      .select(getBaseSelection())
      .from(comments)
      .innerJoin(blogs, eq(comments.blogId, blogs.id))
      .where(eq(comments.id, id))
      .limit(1);

    const row = rows[0];

    if (!row) {
      return null;
    }

    const [comment] = attachRelations([row]);
    return comment ?? null;
  },
  async findPublicBlogBySlug(slug) {
    const rows = await db
      .select({
        id: blogs.id,
        slug: blogs.slug,
        title: blogs.title,
        published: blogs.published,
      })
      .from(blogs)
      .where(eq(blogs.slug, slug))
      .limit(1);

    return rows[0] ?? null;
  },
  async create(comment) {
    const insertedComments = await db
      .insert(comments)
      .values(comment)
      .returning({
        id: comments.id,
      });
    const insertedComment = insertedComments[0];

    if (!insertedComment) {
      throw new Error("Comment insert did not return a row");
    }

    const createdComment = await this.findById(insertedComment.id);

    if (!createdComment) {
      throw new Error("Created comment could not be loaded");
    }

    return createdComment;
  },
  async update(id, comment) {
    const updatedComments = await db
      .update(comments)
      .set(comment)
      .where(eq(comments.id, id))
      .returning({
        id: comments.id,
      });
    const updatedComment = updatedComments[0];

    if (!updatedComment) {
      return null;
    }

    return this.findById(updatedComment.id);
  },
  async delete(id) {
    const rows = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({
        id: comments.id,
      });

    return rows.length > 0;
  },
};
