import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  blogDailyStats,
  blogs,
  blogTags,
  categories,
  changelogs,
  comments,
  friends,
  projects,
  tags,
} from "@/lib/db/schema";

import type {
  AnalyticsActivity,
  AnalyticsCommentStatus,
  AnalyticsDailyMetric,
  AnalyticsDistributionItem,
  AnalyticsOverview,
  AnalyticsRepository,
  AnalyticsTopPost,
} from "./service";

const dateRangeFilter = <T>(column: T, startDate: string) =>
  sql`${column} >= ${startDate}::date`;

const toNumber = (value: number | null | undefined) => value ?? 0;

const countRows = async (
  table: typeof categories | typeof tags | typeof friends | typeof changelogs,
) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number).as("total"),
    })
    .from(table);

  return rows[0]?.total ?? 0;
};

const blogStatsByRange = (startDate: string) =>
  db
    .select({
      blogId: blogDailyStats.blogId,
      viewCount: sql<number>`coalesce(sum(${blogDailyStats.viewCount}), 0)`
        .mapWith(Number)
        .as("view_count"),
      likeCount: sql<number>`coalesce(sum(${blogDailyStats.likeCount}), 0)`
        .mapWith(Number)
        .as("like_count"),
      unlikeCount: sql<number>`coalesce(sum(${blogDailyStats.unlikeCount}), 0)`
        .mapWith(Number)
        .as("unlike_count"),
    })
    .from(blogDailyStats)
    .where(dateRangeFilter(blogDailyStats.metricDate, startDate))
    .groupBy(blogDailyStats.blogId)
    .as("blog_stats_by_range");

const commentsByBlog = db
  .select({
    blogId: comments.blogId,
    commentCount: sql<number>`count(*)`.mapWith(Number).as("comment_count"),
  })
  .from(comments)
  .groupBy(comments.blogId)
  .as("comments_by_blog");

const categoryCounts = db
  .select({
    categoryId: blogs.categoryId,
    total: sql<number>`count(*)`.mapWith(Number).as("total"),
    published: sql<number>`count(*) filter (where ${blogs.published} = true)`
      .mapWith(Number)
      .as("published"),
  })
  .from(blogs)
  .groupBy(blogs.categoryId)
  .as("category_counts");

const tagCounts = db
  .select({
    tagId: blogTags.tagId,
    total: sql<number>`count(*)`.mapWith(Number).as("total"),
    published: sql<number>`count(*) filter (where ${blogs.published} = true)`
      .mapWith(Number)
      .as("published"),
  })
  .from(blogTags)
  .innerJoin(blogs, eq(blogTags.blogId, blogs.id))
  .groupBy(blogTags.tagId)
  .as("tag_counts");

const getBlogOverview = async () => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number).as("total"),
      published: sql<number>`count(*) filter (where ${blogs.published} = true)`
        .mapWith(Number)
        .as("published"),
      drafts: sql<number>`count(*) filter (where ${blogs.published} = false)`
        .mapWith(Number)
        .as("drafts"),
      featured: sql<number>`count(*) filter (where ${blogs.featured} = true)`
        .mapWith(Number)
        .as("featured"),
    })
    .from(blogs);

  return (
    rows[0] ?? {
      total: 0,
      published: 0,
      drafts: 0,
      featured: 0,
    }
  );
};

const getCommentOverview = async () => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number).as("total"),
      pending:
        sql<number>`count(*) filter (where ${comments.status} = 'pending')`
          .mapWith(Number)
          .as("pending"),
      approved:
        sql<number>`count(*) filter (where ${comments.status} = 'approved')`
          .mapWith(Number)
          .as("approved"),
      spam: sql<number>`count(*) filter (where ${comments.status} = 'spam')`
        .mapWith(Number)
        .as("spam"),
    })
    .from(comments);

  return (
    rows[0] ?? {
      total: 0,
      pending: 0,
      approved: 0,
      spam: 0,
    }
  );
};

const getInteractionOverview = async (startDate: string) => {
  const rows = await db
    .select({
      views: sql<number>`coalesce(sum(${blogDailyStats.viewCount}), 0)`
        .mapWith(Number)
        .as("views"),
      likes: sql<number>`coalesce(sum(${blogDailyStats.likeCount}), 0)`
        .mapWith(Number)
        .as("likes"),
      unlikes: sql<number>`coalesce(sum(${blogDailyStats.unlikeCount}), 0)`
        .mapWith(Number)
        .as("unlikes"),
    })
    .from(blogDailyStats)
    .where(dateRangeFilter(blogDailyStats.metricDate, startDate));

  return (
    rows[0] ?? {
      views: 0,
      likes: 0,
      unlikes: 0,
    }
  );
};

const getProjectOverview = async () => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number).as("total"),
      published:
        sql<number>`count(*) filter (where ${projects.published} = true)`
          .mapWith(Number)
          .as("published"),
    })
    .from(projects);

  return (
    rows[0] ?? {
      total: 0,
      published: 0,
    }
  );
};

const mergeDailyRows = (
  rows: Array<Partial<AnalyticsDailyMetric> & { date: string }>,
) => {
  const metricsByDate = new Map<string, AnalyticsDailyMetric>();

  for (const row of rows) {
    const current = metricsByDate.get(row.date) ?? {
      date: row.date,
      views: 0,
      likes: 0,
      unlikes: 0,
      comments: 0,
      posts: 0,
    };

    metricsByDate.set(row.date, {
      date: row.date,
      views: current.views + (row.views ?? 0),
      likes: current.likes + (row.likes ?? 0),
      unlikes: current.unlikes + (row.unlikes ?? 0),
      comments: current.comments + (row.comments ?? 0),
      posts: current.posts + (row.posts ?? 0),
    });
  }

  return [...metricsByDate.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
};

export const analyticsRepository: AnalyticsRepository = {
  async getOverview(startDate) {
    const [
      blogOverview,
      categoryTotal,
      tagTotal,
      commentOverview,
      interactionOverview,
      projectOverview,
      friendTotal,
      changelogTotal,
    ] = await Promise.all([
      getBlogOverview(),
      countRows(categories),
      countRows(tags),
      getCommentOverview(),
      getInteractionOverview(startDate),
      getProjectOverview(),
      countRows(friends),
      countRows(changelogs),
    ]);

    return {
      posts: {
        total: blogOverview.total,
        published: blogOverview.published,
        drafts: blogOverview.drafts,
        featured: blogOverview.featured,
      },
      taxonomy: {
        categories: categoryTotal,
        tags: tagTotal,
      },
      interactions: {
        comments: commentOverview.total,
        pendingComments: commentOverview.pending,
        approvedComments: commentOverview.approved,
        spamComments: commentOverview.spam,
        views: interactionOverview.views,
        likes: interactionOverview.likes,
        unlikes: interactionOverview.unlikes,
      },
      library: {
        projects: projectOverview.total,
        publishedProjects: projectOverview.published,
        friends: friendTotal,
        changelogs: changelogTotal,
      },
    } satisfies AnalyticsOverview;
  },
  async listDailyMetrics(startDate) {
    const statsDate = sql<string>`to_char(${blogDailyStats.metricDate}, 'YYYY-MM-DD')`;
    const commentDate = sql<string>`to_char(${comments.createdAt}, 'YYYY-MM-DD')`;
    const postDate = sql<string>`to_char(${blogs.publishedAt}, 'YYYY-MM-DD')`;

    const [statsRows, commentRows, postRows] = await Promise.all([
      db
        .select({
          date: statsDate.as("date"),
          views: sql<number>`coalesce(sum(${blogDailyStats.viewCount}), 0)`
            .mapWith(Number)
            .as("views"),
          likes: sql<number>`coalesce(sum(${blogDailyStats.likeCount}), 0)`
            .mapWith(Number)
            .as("likes"),
          unlikes: sql<number>`coalesce(sum(${blogDailyStats.unlikeCount}), 0)`
            .mapWith(Number)
            .as("unlikes"),
        })
        .from(blogDailyStats)
        .where(dateRangeFilter(blogDailyStats.metricDate, startDate))
        .groupBy(statsDate),
      db
        .select({
          date: commentDate.as("date"),
          comments: sql<number>`count(*)`.mapWith(Number).as("comments"),
        })
        .from(comments)
        .where(dateRangeFilter(comments.createdAt, startDate))
        .groupBy(commentDate),
      db
        .select({
          date: postDate.as("date"),
          posts: sql<number>`count(*)`.mapWith(Number).as("posts"),
        })
        .from(blogs)
        .where(
          sql`${blogs.published} = true and ${blogs.publishedAt} is not null and ${blogs.publishedAt} >= ${startDate}::date`,
        )
        .groupBy(postDate),
    ]);

    return mergeDailyRows([...statsRows, ...commentRows, ...postRows]);
  },
  async listTopPosts(startDate, limit) {
    const stats = blogStatsByRange(startDate);

    const rows = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        published: blogs.published,
        viewCount: sql<number>`coalesce(${stats.viewCount}, 0)`
          .mapWith(Number)
          .as("view_count"),
        likeCount: sql<number>`coalesce(${stats.likeCount}, 0)`
          .mapWith(Number)
          .as("like_count"),
        commentCount: sql<number>`coalesce(${commentsByBlog.commentCount}, 0)`
          .mapWith(Number)
          .as("comment_count"),
      })
      .from(blogs)
      .leftJoin(stats, eq(blogs.id, stats.blogId))
      .leftJoin(commentsByBlog, eq(blogs.id, commentsByBlog.blogId))
      .orderBy(
        desc(sql`coalesce(${stats.viewCount}, 0)`),
        desc(sql`coalesce(${stats.likeCount}, 0)`),
        desc(blogs.updatedAt),
      )
      .limit(limit);

    return rows satisfies AnalyticsTopPost[];
  },
  async listCategoryDistribution(limit) {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        total: sql<number>`coalesce(${categoryCounts.total}, 0)`
          .mapWith(Number)
          .as("total"),
        published: sql<number>`coalesce(${categoryCounts.published}, 0)`
          .mapWith(Number)
          .as("published"),
      })
      .from(categories)
      .leftJoin(categoryCounts, eq(categories.id, categoryCounts.categoryId))
      .orderBy(desc(sql`coalesce(${categoryCounts.total}, 0)`), categories.name)
      .limit(limit);

    return rows satisfies AnalyticsDistributionItem[];
  },
  async listTagDistribution(limit) {
    const rows = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        total: sql<number>`coalesce(${tagCounts.total}, 0)`
          .mapWith(Number)
          .as("total"),
        published: sql<number>`coalesce(${tagCounts.published}, 0)`
          .mapWith(Number)
          .as("published"),
      })
      .from(tags)
      .leftJoin(tagCounts, eq(tags.id, tagCounts.tagId))
      .orderBy(desc(sql`coalesce(${tagCounts.total}, 0)`), tags.name)
      .limit(limit);

    return rows satisfies AnalyticsDistributionItem[];
  },
  async listCommentStatuses() {
    const rows = await db
      .select({
        status: comments.status,
        total: sql<number>`count(*)`.mapWith(Number).as("total"),
      })
      .from(comments)
      .groupBy(comments.status);

    const totals = new Map(rows.map((row) => [row.status, row.total]));

    return [
      { status: "pending", total: toNumber(totals.get("pending")) },
      { status: "approved", total: toNumber(totals.get("approved")) },
      { status: "spam", total: toNumber(totals.get("spam")) },
    ] satisfies AnalyticsCommentStatus[];
  },
  async listRecentActivity(limit) {
    const [postRows, commentRows, projectRows, changelogRows] =
      await Promise.all([
        db
          .select({
            id: blogs.id,
            type: sql<"post">`'post'`.as("type"),
            title: blogs.title,
            description: blogs.description,
            createdAt: blogs.updatedAt,
          })
          .from(blogs)
          .orderBy(desc(blogs.updatedAt))
          .limit(limit),
        db
          .select({
            id: comments.id,
            type: sql<"comment">`'comment'`.as("type"),
            title: comments.author,
            description: comments.content,
            createdAt: comments.createdAt,
          })
          .from(comments)
          .orderBy(desc(comments.createdAt))
          .limit(limit),
        db
          .select({
            id: projects.id,
            type: sql<"project">`'project'`.as("type"),
            title: projects.title,
            description: projects.description,
            createdAt: projects.updatedAt,
          })
          .from(projects)
          .orderBy(desc(projects.updatedAt))
          .limit(limit),
        db
          .select({
            id: changelogs.id,
            type: sql<"changelog">`'changelog'`.as("type"),
            title: changelogs.title,
            description: changelogs.description,
            createdAt: changelogs.releaseDate,
          })
          .from(changelogs)
          .orderBy(desc(changelogs.releaseDate))
          .limit(limit),
      ]);

    return [...postRows, ...commentRows, ...projectRows, ...changelogRows]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      )
      .slice(0, limit) satisfies AnalyticsActivity[];
  },
};
