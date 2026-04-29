import { z } from "zod";

import {
  createIdentityHash,
  defaultGenerateAuthGuardId,
  getAuthGuardVisitor,
  hashValue,
  incrementFixedWindow,
  normalizeEmail,
  type AuthGuardVisitor,
} from "@/lib/server/auth/auth-guard-common";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import {
  postgresRequestGuardStore,
  type RequestGuardStore,
} from "@/lib/server/request-guard-store";

const LOGIN_LOCK_TTL_SECONDS = 15 * 60;

const RATE_LIMITS = {
  identityPerMinute: {
    limit: 5,
    ttlSeconds: 60,
  },
  identityPerHour: {
    limit: 30,
    ttlSeconds: 60 * 60,
  },
  identityEmailFailure: {
    limit: 5,
    ttlSeconds: LOGIN_LOCK_TTL_SECONDS,
  },
  emailFailure: {
    limit: 20,
    ttlSeconds: LOGIN_LOCK_TTL_SECONDS,
  },
} as const;

const loginGuardBodySchema = z.object({
  email: z.string().trim().email(),
});

export type LoginGuardAttempt = {
  emailHash: string;
  identityEmailHash: string;
  identityHash: string;
  setCookie?: string;
};

export interface LoginGuard {
  validateSignInRequest(request: Request): Promise<LoginGuardAttempt>;
  recordFailedSignIn(attempt: LoginGuardAttempt): Promise<void>;
  clearFailedSignIn(attempt: LoginGuardAttempt): Promise<void>;
}

type LoginGuardDeps = {
  store?: RequestGuardStore;
  now?: () => Date;
  generateId?: () => string;
};

const createRateLimitedError = () =>
  new AppError(
    ERROR_CODES.AUTH_LOGIN_RATE_LIMITED,
    "登录请求太频繁，请稍后再试。",
    429,
  );

const createInvalidRequestError = () =>
  new AppError(ERROR_CODES.COMMON_INVALID_REQUEST, "登录请求无效。", 400);

const createGuardUnavailableError = () =>
  new AppError(
    ERROR_CODES.COMMON_INTERNAL_ERROR,
    "登录保护暂时不可用，请稍后再试。",
    503,
  );

async function parseGuardBody(request: Request) {
  try {
    return loginGuardBodySchema.parse(await request.clone().json());
  } catch {
    throw createInvalidRequestError();
  }
}

const getIdentityMinuteRateKey = (identityHash: string, window: number) =>
  `auth:login:guard:rate:identity:minute:${identityHash}:${window}`;

const getIdentityHourRateKey = (identityHash: string, window: number) =>
  `auth:login:guard:rate:identity:hour:${identityHash}:${window}`;

const getIdentityEmailFailureKey = (
  identityEmailHash: string,
  window: number,
) => `auth:login:guard:failure:identity_email:${identityEmailHash}:${window}`;

const getEmailFailureKey = (emailHash: string, window: number) =>
  `auth:login:guard:failure:email:${emailHash}:${window}`;

const getIdentityEmailLockKey = (identityEmailHash: string) =>
  `auth:login:guard:lock:identity_email:${identityEmailHash}`;

const getEmailLockKey = (emailHash: string) =>
  `auth:login:guard:lock:email:${emailHash}`;

async function assertFixedWindowLimit({
  key,
  limit,
  now,
  store,
  ttlSeconds,
}: {
  key: string;
  limit: number;
  now: Date;
  store: RequestGuardStore;
  ttlSeconds: number;
}) {
  const count = await incrementFixedWindow({ key, now, store, ttlSeconds });

  if (count > limit) {
    throw createRateLimitedError();
  }

  return count;
}

async function assertNotLocked({
  attempt,
  now,
  store,
}: {
  attempt: LoginGuardAttempt;
  now: Date;
  store: RequestGuardStore;
}) {
  const isLocked = await store.exists(
    [
      getIdentityEmailLockKey(attempt.identityEmailHash),
      getEmailLockKey(attempt.emailHash),
    ],
    now,
  );

  if (isLocked) {
    throw createRateLimitedError();
  }
}

async function recordFailureWindow({
  key,
  limit,
  lockKey,
  now,
  store,
  ttlSeconds,
}: {
  key: string;
  limit: number;
  lockKey: string;
  now: Date;
  store: RequestGuardStore;
  ttlSeconds: number;
}) {
  const count = await incrementFixedWindow({ key, now, store, ttlSeconds });

  if (count > limit) {
    await store.set({
      key: lockKey,
      type: "lock",
      now,
      ttlSeconds: LOGIN_LOCK_TTL_SECONDS,
    });
    throw createRateLimitedError();
  }
}

function createAttempt({
  bodyEmail,
  request,
  visitor,
}: {
  bodyEmail: string;
  request: Request;
  visitor: AuthGuardVisitor;
}): LoginGuardAttempt {
  const emailHash = hashValue(normalizeEmail(bodyEmail));
  const identityHash = createIdentityHash({
    request,
    visitorId: visitor.visitorId,
  });

  return {
    emailHash,
    identityHash,
    identityEmailHash: hashValue([identityHash, emailHash].join("\n")),
    setCookie: visitor.setCookie,
  };
}

export function createLoginGuard({
  store = postgresRequestGuardStore,
  now = () => new Date(),
  generateId = defaultGenerateAuthGuardId,
}: LoginGuardDeps = {}): LoginGuard {
  return {
    async validateSignInRequest(request) {
      const body = await parseGuardBody(request);
      const visitor = getAuthGuardVisitor({ generateId, request });
      const attempt = createAttempt({
        bodyEmail: body.email,
        request,
        visitor,
      });

      try {
        const nowDate = now();
        await assertNotLocked({ attempt, now: nowDate, store });

        const nowSeconds = Math.floor(nowDate.getTime() / 1000);
        const minuteWindow = Math.floor(
          nowSeconds / RATE_LIMITS.identityPerMinute.ttlSeconds,
        );
        const hourWindow = Math.floor(
          nowSeconds / RATE_LIMITS.identityPerHour.ttlSeconds,
        );

        await assertFixedWindowLimit({
          key: getIdentityMinuteRateKey(attempt.identityHash, minuteWindow),
          now: nowDate,
          store,
          ...RATE_LIMITS.identityPerMinute,
        });
        await assertFixedWindowLimit({
          key: getIdentityHourRateKey(attempt.identityHash, hourWindow),
          now: nowDate,
          store,
          ...RATE_LIMITS.identityPerHour,
        });

        return attempt;
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        throw createGuardUnavailableError();
      }
    },

    async recordFailedSignIn(attempt) {
      try {
        const nowDate = now();
        const nowSeconds = Math.floor(nowDate.getTime() / 1000);
        const failureWindow = Math.floor(
          nowSeconds / RATE_LIMITS.identityEmailFailure.ttlSeconds,
        );

        await recordFailureWindow({
          key: getIdentityEmailFailureKey(
            attempt.identityEmailHash,
            failureWindow,
          ),
          lockKey: getIdentityEmailLockKey(attempt.identityEmailHash),
          now: nowDate,
          store,
          ...RATE_LIMITS.identityEmailFailure,
        });
        await recordFailureWindow({
          key: getEmailFailureKey(attempt.emailHash, failureWindow),
          lockKey: getEmailLockKey(attempt.emailHash),
          now: nowDate,
          store,
          ...RATE_LIMITS.emailFailure,
        });
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        throw createGuardUnavailableError();
      }
    },

    async clearFailedSignIn(attempt) {
      try {
        const nowDate = now();
        const nowSeconds = Math.floor(nowDate.getTime() / 1000);
        const failureWindow = Math.floor(
          nowSeconds / RATE_LIMITS.identityEmailFailure.ttlSeconds,
        );

        await store.deleteKeys([
          getIdentityEmailFailureKey(attempt.identityEmailHash, failureWindow),
          getEmailFailureKey(attempt.emailHash, failureWindow),
          getIdentityEmailLockKey(attempt.identityEmailHash),
          getEmailLockKey(attempt.emailHash),
        ]);
      } catch {
        // Successful sign-in should not fail because cleanup is unavailable.
      }
    },
  };
}

export function applyLoginGuardCookie(
  response: Response,
  attempt: LoginGuardAttempt,
) {
  if (attempt.setCookie) {
    response.headers.append("Set-Cookie", attempt.setCookie);
  }

  return response;
}

export const loginGuard = createLoginGuard();
