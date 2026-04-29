import { and, eq, inArray, lte, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import { blogDailyStats, blogLikes, blogViewDedup } from "@/lib/db/schema";

const BLOG_STATS_VISITOR_COOKIE = "blog_stats_visitor_id";
const BLOG_STATS_VISITOR_MAX_AGE = 60 * 60 * 24 * 365;
const VIEW_DEDUP_TTL_SECONDS = 60 * 60 * 24;

export type BlogStats = {
  viewCount: number;
  likeCount: number;
  liked: boolean;
};

export type BlogViewResult = {
  viewCount: number;
  counted: boolean;
};

export type BlogLikeResult = {
  likeCount: number;
  liked: boolean;
};

export type BlogStatsVisitor = {
  visitorId: string;
  setCookie?: string;
};

export interface BlogStatsService {
  getStatsByBlogIds(
    blogIds: string[],
    visitorId?: string | null,
  ): Promise<Map<string, BlogStats>>;
  trackView(blogId: string, visitorId: string): Promise<BlogViewResult>;
  toggleLike(blogId: string, visitorId: string): Promise<BlogLikeResult>;
}

type StatsExecutor = Pick<typeof db, "delete" | "insert" | "select">;

export const DEFAULT_BLOG_STATS: BlogStats = {
  viewCount: 0,
  likeCount: 0,
  liked: false,
};

const addSeconds = (date: Date, seconds: number) =>
  new Date(date.getTime() + seconds * 1000);

const recordDailyStatsDelta = async (
  executor: StatsExecutor,
  {
    blogId,
    viewCount = 0,
    likeCount = 0,
    unlikeCount = 0,
  }: {
    blogId: string;
    viewCount?: number;
    likeCount?: number;
    unlikeCount?: number;
  },
) => {
  await executor
    .insert(blogDailyStats)
    .values({
      blogId,
      metricDate: sql`current_date`,
      viewCount,
      likeCount,
      unlikeCount,
    })
    .onConflictDoUpdate({
      target: [blogDailyStats.blogId, blogDailyStats.metricDate],
      set: {
        viewCount: sql`${blogDailyStats.viewCount} + ${viewCount}`,
        likeCount: sql`${blogDailyStats.likeCount} + ${likeCount}`,
        unlikeCount: sql`${blogDailyStats.unlikeCount} + ${unlikeCount}`,
      },
    });
};

const getViewCount = async (executor: StatsExecutor, blogId: string) => {
  const rows = await executor
    .select({
      viewCount: sql<number>`coalesce(sum(${blogDailyStats.viewCount}), 0)`
        .mapWith(Number)
        .as("view_count"),
    })
    .from(blogDailyStats)
    .where(eq(blogDailyStats.blogId, blogId));

  return rows[0]?.viewCount ?? 0;
};

const getLikeCount = async (executor: StatsExecutor, blogId: string) => {
  const rows = await executor
    .select({
      likeCount: sql<number>`count(*)`.mapWith(Number).as("like_count"),
    })
    .from(blogLikes)
    .where(eq(blogLikes.blogId, blogId));

  return rows[0]?.likeCount ?? 0;
};

const parseCookieHeader = (cookieHeader: string | null) => {
  const cookies = new Map<string, string>();

  for (const part of cookieHeader?.split(";") ?? []) {
    const [rawName, ...rawValueParts] = part.trim().split("=");
    const rawValue = rawValueParts.join("=");

    if (!rawName || !rawValue) {
      continue;
    }

    try {
      cookies.set(rawName, decodeURIComponent(rawValue));
    } catch {
      cookies.set(rawName, rawValue);
    }
  }

  return cookies;
};

const isValidVisitorId = (value: string | undefined): value is string =>
  typeof value === "string" && /^[\da-f-]{36}$/i.test(value);

const createVisitorCookie = (visitorId: string) =>
  [
    `${BLOG_STATS_VISITOR_COOKIE}=${encodeURIComponent(visitorId)}`,
    "Path=/",
    `Max-Age=${BLOG_STATS_VISITOR_MAX_AGE}`,
    "SameSite=Lax",
    "HttpOnly",
  ].join("; ");

export function getBlogStatsVisitorId(request: Request) {
  const visitorId = parseCookieHeader(request.headers.get("cookie")).get(
    BLOG_STATS_VISITOR_COOKIE,
  );

  return isValidVisitorId(visitorId) ? visitorId : null;
}

export function ensureBlogStatsVisitor(request: Request): BlogStatsVisitor {
  const visitorId = getBlogStatsVisitorId(request);

  if (visitorId) {
    return { visitorId };
  }

  const nextVisitorId = randomUUID();

  return {
    visitorId: nextVisitorId,
    setCookie: createVisitorCookie(nextVisitorId),
  };
}

export function applyBlogStatsVisitorCookie(
  response: Response,
  visitor: BlogStatsVisitor,
) {
  if (visitor.setCookie) {
    response.headers.append("Set-Cookie", visitor.setCookie);
  }

  return response;
}

export const blogStatsService: BlogStatsService = {
  async getStatsByBlogIds(blogIds, visitorId) {
    const uniqueBlogIds = [...new Set(blogIds)];

    if (uniqueBlogIds.length === 0) {
      return new Map();
    }

    const [viewRows, likeRows, likedRows] = await Promise.all([
      db
        .select({
          blogId: blogDailyStats.blogId,
          viewCount: sql<number>`coalesce(sum(${blogDailyStats.viewCount}), 0)`
            .mapWith(Number)
            .as("view_count"),
        })
        .from(blogDailyStats)
        .where(inArray(blogDailyStats.blogId, uniqueBlogIds))
        .groupBy(blogDailyStats.blogId),
      db
        .select({
          blogId: blogLikes.blogId,
          likeCount: sql<number>`count(*)`.mapWith(Number).as("like_count"),
        })
        .from(blogLikes)
        .where(inArray(blogLikes.blogId, uniqueBlogIds))
        .groupBy(blogLikes.blogId),
      visitorId
        ? db
            .select({
              blogId: blogLikes.blogId,
            })
            .from(blogLikes)
            .where(
              and(
                inArray(blogLikes.blogId, uniqueBlogIds),
                eq(blogLikes.visitorId, visitorId),
              ),
            )
        : Promise.resolve([]),
    ]);

    const viewCounts = new Map(
      viewRows.map((row) => [row.blogId, row.viewCount]),
    );
    const likeCounts = new Map(
      likeRows.map((row) => [row.blogId, row.likeCount]),
    );
    const likedBlogIds = new Set(likedRows.map((row) => row.blogId));

    return new Map(
      uniqueBlogIds.map((blogId) => [
        blogId,
        {
          viewCount: viewCounts.get(blogId) ?? 0,
          likeCount: likeCounts.get(blogId) ?? 0,
          liked: likedBlogIds.has(blogId),
        },
      ]),
    );
  },
  async trackView(blogId, visitorId) {
    return db.transaction(async (tx) => {
      const now = new Date();

      await tx
        .delete(blogViewDedup)
        .where(
          and(
            eq(blogViewDedup.blogId, blogId),
            eq(blogViewDedup.visitorId, visitorId),
            lte(blogViewDedup.expiresAt, now),
          ),
        );

      const dedupRows = await tx
        .insert(blogViewDedup)
        .values({
          blogId,
          visitorId,
          createdAt: now,
          expiresAt: addSeconds(now, VIEW_DEDUP_TTL_SECONDS),
        })
        .onConflictDoNothing()
        .returning({ blogId: blogViewDedup.blogId });
      const counted = dedupRows.length > 0;

      if (counted) {
        await recordDailyStatsDelta(tx, { blogId, viewCount: 1 });
      }

      return {
        viewCount: await getViewCount(tx, blogId),
        counted,
      };
    });
  },
  async toggleLike(blogId, visitorId) {
    return db.transaction(async (tx) => {
      const now = new Date();
      const deletedRows = await tx
        .delete(blogLikes)
        .where(
          and(eq(blogLikes.blogId, blogId), eq(blogLikes.visitorId, visitorId)),
        )
        .returning({ blogId: blogLikes.blogId });
      const liked = deletedRows.length === 0;

      if (liked) {
        await tx.insert(blogLikes).values({
          blogId,
          visitorId,
          createdAt: now,
        });
      }

      await recordDailyStatsDelta(tx, {
        blogId,
        likeCount: liked ? 1 : 0,
        unlikeCount: liked ? 0 : 1,
      });

      return {
        liked,
        likeCount: await getLikeCount(tx, blogId),
      };
    });
  },
};
