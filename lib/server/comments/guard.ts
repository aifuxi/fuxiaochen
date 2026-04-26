import type { Redis } from "ioredis";
import { createHash, randomUUID } from "node:crypto";

import type { PublicCommentCreateInput } from "@/lib/server/comments/dto";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import { getRedisClient } from "@/lib/server/redis";

const COMMENT_GUARD_VISITOR_COOKIE = "comment_guard_visitor_id";
const COMMENT_GUARD_VISITOR_MAX_AGE = 60 * 60 * 24 * 365;
const MIN_SUBMIT_SECONDS = 3;
const DUPLICATE_TTL_SECONDS = 60 * 60 * 24;

const RATE_LIMITS = {
  identityPerMinute: {
    limit: 3,
    ttlSeconds: 60,
  },
  identityPerHour: {
    limit: 10,
    ttlSeconds: 60 * 60,
  },
  identityPostPerHour: {
    limit: 5,
    ttlSeconds: 60 * 60,
  },
} as const;

export type CommentGuardResult = {
  setCookie?: string;
};

export interface CommentGuard {
  validateCreateRequest(
    request: Request,
    input: PublicCommentCreateInput,
  ): Promise<CommentGuardResult>;
}

type CommentGuardDeps = {
  getRedis?: () => Promise<Redis>;
  now?: () => Date;
  generateId?: () => string;
};

const hashValue = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const normalizeText = (value: string) =>
  value.trim().replaceAll(/\s+/g, " ").toLowerCase();

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
    `${COMMENT_GUARD_VISITOR_COOKIE}=${encodeURIComponent(visitorId)}`,
    "Path=/",
    `Max-Age=${COMMENT_GUARD_VISITOR_MAX_AGE}`,
    "SameSite=Lax",
    "HttpOnly",
  ].join("; ");

const getHeaderIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwardedFor?.split(",")[0]?.trim() ||
    "unknown"
  );
};

const getVisitor = ({
  generateId,
  request,
}: {
  generateId: () => string;
  request: Request;
}) => {
  const visitorId = parseCookieHeader(request.headers.get("cookie")).get(
    COMMENT_GUARD_VISITOR_COOKIE,
  );

  if (isValidVisitorId(visitorId)) {
    return {
      visitorId,
      setCookie: undefined,
    };
  }

  const nextVisitorId = generateId();

  return {
    visitorId: nextVisitorId,
    setCookie: createVisitorCookie(nextVisitorId),
  };
};

const createRateLimitedError = () =>
  new AppError(
    ERROR_CODES.COMMENT_RATE_LIMITED,
    "提交太频繁，请稍后再试。",
    429,
  );

const createDuplicateSubmissionError = () =>
  new AppError(
    ERROR_CODES.COMMENT_DUPLICATE_SUBMISSION,
    "请勿重复提交相同评论。",
    409,
  );

const createSpamDetectedError = () =>
  new AppError(ERROR_CODES.COMMENT_SPAM_DETECTED, "评论提交被拒绝。", 400);

const createGuardUnavailableError = () =>
  new AppError(
    ERROR_CODES.COMMON_INTERNAL_ERROR,
    "评论保护暂时不可用，请稍后再试。",
    503,
  );

async function incrementFixedWindow({
  key,
  limit,
  redis,
  ttlSeconds,
}: {
  key: string;
  limit: number;
  redis: Redis;
  ttlSeconds: number;
}) {
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, ttlSeconds);
  }

  if (count > limit) {
    throw createRateLimitedError();
  }
}

export function createCommentGuard({
  getRedis = getRedisClient,
  now = () => new Date(),
  generateId = randomUUID,
}: CommentGuardDeps = {}): CommentGuard {
  return {
    async validateCreateRequest(request, input) {
      if (input.website && input.website.trim().length > 0) {
        throw createSpamDetectedError();
      }

      const elapsedSeconds = (now().getTime() - input.startedAt) / 1000;

      if (elapsedSeconds < MIN_SUBMIT_SECONDS) {
        throw createRateLimitedError();
      }

      const visitor = getVisitor({ generateId, request });
      const ip = getHeaderIp(request);
      const userAgent = request.headers.get("user-agent")?.trim() ?? "unknown";
      const identityHash = hashValue(
        [ip, userAgent, visitor.visitorId].join("\n"),
      );
      const postHash = hashValue(input.postSlug);
      const parentHash = hashValue(input.parentId ?? "root");
      const contentHash = hashValue(normalizeText(input.content));
      const submissionHash = hashValue(
        [postHash, parentHash, contentHash].join("\n"),
      );

      try {
        const redis = await getRedis();
        const nowSeconds = Math.floor(now().getTime() / 1000);
        const minuteWindow = Math.floor(
          nowSeconds / RATE_LIMITS.identityPerMinute.ttlSeconds,
        );
        const hourWindow = Math.floor(
          nowSeconds / RATE_LIMITS.identityPerHour.ttlSeconds,
        );

        await incrementFixedWindow({
          key: `comment:guard:rate:identity:minute:${identityHash}:${minuteWindow}`,
          redis,
          ...RATE_LIMITS.identityPerMinute,
        });
        await incrementFixedWindow({
          key: `comment:guard:rate:identity:hour:${identityHash}:${hourWindow}`,
          redis,
          ...RATE_LIMITS.identityPerHour,
        });
        await incrementFixedWindow({
          key: `comment:guard:rate:post:hour:${identityHash}:${postHash}:${hourWindow}`,
          redis,
          ...RATE_LIMITS.identityPostPerHour,
        });

        const duplicateResult = await redis.set(
          `comment:guard:duplicate:${identityHash}:${submissionHash}`,
          "1",
          "EX",
          DUPLICATE_TTL_SECONDS,
          "NX",
        );

        if (duplicateResult !== "OK") {
          throw createDuplicateSubmissionError();
        }

        return {
          setCookie: visitor.setCookie,
        };
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        throw createGuardUnavailableError();
      }
    },
  };
}

export function applyCommentGuardCookie(
  response: Response,
  guardResult: CommentGuardResult,
) {
  if (guardResult.setCookie) {
    response.headers.append("Set-Cookie", guardResult.setCookie);
  }

  return response;
}

export const commentGuard = createCommentGuard();
