import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    /** prisma */
    DATABASE_URL: z.string(),

    /** 运行时 */
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    /** next-auth */
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === 'production'
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.string().url(),
    GITHUB_ID: z.string(),
    GITHUB_SECRET: z.string(),

    /** 网站 */
    SITE_URL: z.string().url(),

    /** 阿里云OSS */
    OSS_ACCESS_KEY_ID: z.string(),
    OSS_ACCESS_KEY_SECRET: z.string(),
    OSS_REGION: z.string(),
    OSS_BUCKET: z.string(),

    /** ADMIN */
    ADMIN_NICKNAME: z.string(),
    ADMIN_AVATAR: z.string().optional(),
    ADMIN_EMAIL: z.string().email(),
    ADMIN_PASSWORD: z.string().min(6).max(20),
  },
  client: {},
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    /** prisma */
    DATABASE_URL: process.env.DATABASE_URL,

    /** 运行时 */
    NODE_ENV: process.env.NODE_ENV,

    /** 网站 */
    SITE_URL: process.env.SITE_URL,

    /** next-auth */
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,

    /** 阿里云OSS */
    OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET,
    OSS_REGION: process.env.OSS_REGION,
    OSS_BUCKET: process.env.OSS_BUCKET,

    /** ADMIN */
    ADMIN_NICKNAME: process.env.ADMIN_NICKNAME,
    ADMIN_AVATAR: process.env.ADMIN_AVATAR,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.OSS_BUCKET,
  },

  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
