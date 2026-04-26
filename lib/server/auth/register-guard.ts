import type { Redis } from "ioredis";
import { z } from "zod";

import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import { getRedisClient } from "@/lib/server/redis";

import {
  createIdentityHash,
  defaultGenerateAuthGuardId,
  getAuthGuardVisitor,
  hashValue,
  incrementFixedWindow,
  normalizeEmail,
} from "./auth-guard-common";

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

async function assertFixedWindowLimit({
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
  const count = await incrementFixedWindow({ key, redis, ttlSeconds });
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
  generateId = defaultGenerateAuthGuardId,
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

      const visitor = getAuthGuardVisitor({ generateId, request });
      const identityHash = createIdentityHash({
        request,
        visitorId: visitor.visitorId,
      });
      const emailHash = hashValue(normalizeEmail(body.email));

      try {
        const redis = await getRedis();
        const nowSeconds = Math.floor(now().getTime() / 1000);
        const minuteWindow = Math.floor(
          nowSeconds / RATE_LIMITS.identityPerMinute.ttlSeconds,
        );
        const hourWindow = Math.floor(
          nowSeconds / RATE_LIMITS.identityPerHour.ttlSeconds,
        );

        await assertFixedWindowLimit({
          key: `auth:register:guard:rate:identity:minute:${identityHash}:${minuteWindow}`,
          redis,
          ...RATE_LIMITS.identityPerMinute,
        });
        await assertFixedWindowLimit({
          key: `auth:register:guard:rate:identity:hour:${identityHash}:${hourWindow}`,
          redis,
          ...RATE_LIMITS.identityPerHour,
        });
        await assertFixedWindowLimit({
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
