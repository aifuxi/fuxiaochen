import type { Redis } from "ioredis";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";

import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import { getRedisClient } from "@/lib/server/redis";

const REGISTER_GUARD_VISITOR_COOKIE = "register_guard_visitor_id";
const REGISTER_GUARD_VISITOR_MAX_AGE = 60 * 60 * 24 * 365;
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
  emailPerHour: {
    limit: 3,
    ttlSeconds: 60 * 60,
  },
} as const;

const registerGuardBodySchema = z.object({
  email: z.string().trim().email(),
  website: z.string().trim().max(200).optional(),
  startedAt: z.coerce.number().int().positive(),
});

export type RegisterGuardResult = {
  setCookie?: string;
};

export interface RegisterGuard {
  validateSignUpRequest(request: Request): Promise<RegisterGuardResult>;
}

type RegisterGuardDeps = {
  getRedis?: () => Promise<Redis>;
  now?: () => Date;
  generateId?: () => string;
};

const hashValue = (value: string) =>
  createHash("sha256").update(value).digest("hex");

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
    `${REGISTER_GUARD_VISITOR_COOKIE}=${encodeURIComponent(visitorId)}`,
    "Path=/",
    `Max-Age=${REGISTER_GUARD_VISITOR_MAX_AGE}`,
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
    REGISTER_GUARD_VISITOR_COOKIE,
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
    ERROR_CODES.AUTH_REGISTER_RATE_LIMITED,
    "注册请求太频繁，请稍后再试。",
    429,
  );

const createDuplicateSubmissionError = () =>
  new AppError(
    ERROR_CODES.AUTH_REGISTER_DUPLICATE_SUBMISSION,
    "请勿重复提交相同注册请求。",
    409,
  );

const createSpamDetectedError = () =>
  new AppError(
    ERROR_CODES.AUTH_REGISTER_SPAM_DETECTED,
    "注册请求被拒绝。",
    400,
  );

const createGuardUnavailableError = () =>
  new AppError(
    ERROR_CODES.COMMON_INTERNAL_ERROR,
    "注册保护暂时不可用，请稍后再试。",
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

async function parseGuardBody(request: Request) {
  try {
    return registerGuardBodySchema.parse(await request.clone().json());
  } catch {
    throw createSpamDetectedError();
  }
}

export function createRegisterGuard({
  getRedis = getRedisClient,
  now = () => new Date(),
  generateId = randomUUID,
}: RegisterGuardDeps = {}): RegisterGuard {
  return {
    async validateSignUpRequest(request) {
      const body = await parseGuardBody(request);

      if (body.website && body.website.trim().length > 0) {
        throw createSpamDetectedError();
      }

      const elapsedSeconds = (now().getTime() - body.startedAt) / 1000;

      if (elapsedSeconds < MIN_SUBMIT_SECONDS) {
        throw createRateLimitedError();
      }

      const visitor = getVisitor({ generateId, request });
      const ip = getHeaderIp(request);
      const userAgent = request.headers.get("user-agent")?.trim() ?? "unknown";
      const identityHash = hashValue(
        [ip, userAgent, visitor.visitorId].join("\n"),
      );
      const emailHash = hashValue(body.email.trim().toLowerCase());

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
          key: `auth:register:guard:rate:identity:minute:${identityHash}:${minuteWindow}`,
          redis,
          ...RATE_LIMITS.identityPerMinute,
        });
        await incrementFixedWindow({
          key: `auth:register:guard:rate:identity:hour:${identityHash}:${hourWindow}`,
          redis,
          ...RATE_LIMITS.identityPerHour,
        });
        await incrementFixedWindow({
          key: `auth:register:guard:rate:email:hour:${emailHash}:${hourWindow}`,
          redis,
          ...RATE_LIMITS.emailPerHour,
        });

        const duplicateResult = await redis.set(
          `auth:register:guard:duplicate:${identityHash}:${emailHash}`,
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

export function applyRegisterGuardCookie(
  response: Response,
  guardResult: RegisterGuardResult,
) {
  if (guardResult.setCookie) {
    response.headers.append("Set-Cookie", guardResult.setCookie);
  }

  return response;
}

export const registerGuard = createRegisterGuard();
