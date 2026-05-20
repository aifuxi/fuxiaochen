import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const DEFAULT_PUBLIC_SITE_URL = "https://fuxiaochen.com";
const MAX_API_MOCK_DELAY_MS = 10_000;

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const nonEmptyString = z.string().trim().min(1);

const normalizeSiteUrl = (url: string) =>
  url.trim().endsWith("/") ? url.trim().slice(0, -1) : url.trim();

const positiveIntegerString = (fallback: string) =>
  z
    .string()
    .regex(/^\d+$/)
    .default(fallback)
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().positive());

export const env = createEnv({
  server: {
    ANALYZE: booleanString,
    API_MOCK_DELAY_MS: z
      .string()
      .regex(/^\d+$/)
      .default("0")
      .transform((value) => Number.parseInt(value, 10))
      .pipe(z.number().int().min(0).max(MAX_API_MOCK_DELAY_MS)),
    API_TIMING_DB_LOGS: booleanString,
    API_TIMING_DB_SLOW_MS: positiveIntegerString("1000"),
    API_TIMING_LOG_RETENTION_DAYS: positiveIntegerString("30"),
    API_TIMING_LOGS: booleanString,
    BETTER_AUTH_SECRET: nonEmptyString,
    BETTER_AUTH_URL: z.string().trim().url(),
    DATABASE_URL: nonEmptyString,
    GITHUB_CLIENT_ID: nonEmptyString.optional(),
    GITHUB_CLIENT_SECRET: nonEmptyString.optional(),
    LOG_LEVEL: nonEmptyString.default("info"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    OSS_ACCESS_KEY_ID: nonEmptyString.optional(),
    OSS_ACCESS_KEY_SECRET: nonEmptyString.optional(),
    OSS_BUCKET: nonEmptyString.optional(),
    OSS_REGION: nonEmptyString.optional(),
    OSS_UPLOAD_DIR: z.string().trim().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z
      .string()
      .trim()
      .url()
      .default(DEFAULT_PUBLIC_SITE_URL)
      .transform(normalizeSiteUrl),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    API_MOCK_DELAY_MS: process.env.API_MOCK_DELAY_MS,
    API_TIMING_DB_LOGS: process.env.API_TIMING_DB_LOGS,
    API_TIMING_DB_SLOW_MS: process.env.API_TIMING_DB_SLOW_MS,
    API_TIMING_LOG_RETENTION_DAYS: process.env.API_TIMING_LOG_RETENTION_DAYS,
    API_TIMING_LOGS: process.env.API_TIMING_LOGS,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    LOG_LEVEL: process.env.LOG_LEVEL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: process.env.NODE_ENV,
    OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET,
    OSS_BUCKET: process.env.OSS_BUCKET,
    OSS_REGION: process.env.OSS_REGION,
    OSS_UPLOAD_DIR: process.env.OSS_UPLOAD_DIR,
  },
  emptyStringAsUndefined: true,
});

export const isProduction = () => env.NODE_ENV === "production";

export const isGithubOAuthConfigured = () =>
  Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);

export const getPublicSiteUrl = () => env.NEXT_PUBLIC_SITE_URL;

export const getAbsoluteSiteUrl = (pathname: string) =>
  new URL(pathname, `${getPublicSiteUrl()}/`).href;
