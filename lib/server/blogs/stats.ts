import { sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import { blogDailyStats } from "@/lib/db/schema";
import { getRedisClient } from "@/lib/server/redis";

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

export const DEFAULT_BLOG_STATS: BlogStats = {
  viewCount: 0,
  likeCount: 0,
  liked: false,
};

const likeToggleScript = `
local liked = redis.call("SISMEMBER", KEYS[1], ARGV[1])
if liked == 1 then
  redis.call("SREM", KEYS[1], ARGV[1])
  return {0, redis.call("SCARD", KEYS[1])}
end
redis.call("SADD", KEYS[1], ARGV[1])
return {1, redis.call("SCARD", KEYS[1])}
`;

const viewCountKey = (blogId: string) => `blog:stats:${blogId}:views`;
const viewSeenKey = (blogId: string, visitorId: string) =>
  `blog:stats:${blogId}:views:seen:${visitorId}`;
const likeSetKey = (blogId: string) => `blog:stats:${blogId}:likes`;

const recordDailyStatsDelta = async ({
  blogId,
  viewCount = 0,
  likeCount = 0,
  unlikeCount = 0,
}: {
  blogId: string;
  viewCount?: number;
  likeCount?: number;
  unlikeCount?: number;
}) => {
  await db
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

const tryRecordDailyStatsDelta = async (
  delta: Parameters<typeof recordDailyStatsDelta>[0],
) => {
  try {
    await recordDailyStatsDelta(delta);
  } catch {
    // Analytics persistence must not block the visitor interaction path.
  }
};

const toCount = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
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

    const redis = await getRedisClient();
    const pipeline = redis.pipeline();

    for (const blogId of uniqueBlogIds) {
      pipeline.get(viewCountKey(blogId));
      pipeline.scard(likeSetKey(blogId));

      if (visitorId) {
        pipeline.sismember(likeSetKey(blogId), visitorId);
      }
    }

    const rows = await pipeline.exec();

    if (!rows) {
      throw new Error("Redis pipeline failed");
    }

    const statsByBlogId = new Map<string, BlogStats>();
    let cursor = 0;

    for (const blogId of uniqueBlogIds) {
      const viewCountRow = rows[cursor++];
      const likeCountRow = rows[cursor++];
      const likedRow = visitorId ? rows[cursor++] : undefined;

      const rowError = viewCountRow?.[0] ?? likeCountRow?.[0] ?? likedRow?.[0];

      if (rowError) {
        throw rowError;
      }

      statsByBlogId.set(blogId, {
        viewCount: toCount(viewCountRow?.[1]),
        likeCount: toCount(likeCountRow?.[1]),
        liked: toCount(likedRow?.[1]) === 1,
      });
    }

    return statsByBlogId;
  },
  async trackView(blogId, visitorId) {
    const redis = await getRedisClient();
    const counted = await redis.set(
      viewSeenKey(blogId, visitorId),
      "1",
      "EX",
      VIEW_DEDUP_TTL_SECONDS,
      "NX",
    );

    if (counted === "OK") {
      const viewCount = await redis.incr(viewCountKey(blogId));
      await tryRecordDailyStatsDelta({ blogId, viewCount: 1 });

      return {
        viewCount,
        counted: true,
      };
    }

    return {
      viewCount: toCount(await redis.get(viewCountKey(blogId))),
      counted: false,
    };
  },
  async toggleLike(blogId, visitorId) {
    const redis = await getRedisClient();
    const result = await redis.eval(
      likeToggleScript,
      1,
      likeSetKey(blogId),
      visitorId,
    );

    if (!Array.isArray(result)) {
      throw new Error("Redis like toggle failed");
    }

    const liked = toCount(result[0]) === 1;
    await tryRecordDailyStatsDelta({
      blogId,
      likeCount: liked ? 1 : 0,
      unlikeCount: liked ? 0 : 1,
    });

    return {
      liked,
      likeCount: toCount(result[1]),
    };
  },
};
