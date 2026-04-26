import type { Redis } from "ioredis";
import { createHash, randomUUID } from "node:crypto";

const AUTH_GUARD_VISITOR_COOKIE = "auth_guard_visitor_id";
const AUTH_GUARD_VISITOR_MAX_AGE = 60 * 60 * 24 * 365;

export type AuthGuardDeps = {
  getRedis?: () => Promise<Redis>;
  now?: () => Date;
  generateId?: () => string;
};

export type AuthGuardVisitor = {
  visitorId: string;
  setCookie?: string;
};

export const defaultGenerateAuthGuardId = randomUUID;

export const hashValue = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const parseCookieHeader = (cookieHeader: string | null) => {
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
    `${AUTH_GUARD_VISITOR_COOKIE}=${encodeURIComponent(visitorId)}`,
    "Path=/",
    `Max-Age=${AUTH_GUARD_VISITOR_MAX_AGE}`,
    "SameSite=Lax",
    "HttpOnly",
  ].join("; ");

export const getHeaderIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwardedFor?.split(",")[0]?.trim() ||
    "unknown"
  );
};

export const getAuthGuardVisitor = ({
  generateId,
  request,
}: {
  generateId: () => string;
  request: Request;
}): AuthGuardVisitor => {
  const visitorId = parseCookieHeader(request.headers.get("cookie")).get(
    AUTH_GUARD_VISITOR_COOKIE,
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

export const createIdentityHash = ({
  request,
  visitorId,
}: {
  request: Request;
  visitorId: string;
}) => {
  const ip = getHeaderIp(request);
  const userAgent = request.headers.get("user-agent")?.trim() ?? "unknown";

  return hashValue([ip, userAgent, visitorId].join("\n"));
};

export async function incrementFixedWindow({
  key,
  redis,
  ttlSeconds,
}: {
  key: string;
  redis: Redis;
  ttlSeconds: number;
}) {
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, ttlSeconds);
  }

  return count;
}
