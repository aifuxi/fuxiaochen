import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { schema, users, type UserRole } from "@/lib/db/schema";

const DEFAULT_USER_ROLE: UserRole = "user";
const ADMIN_USER_ROLE: UserRole = "admin";
const FIRST_ADMIN_ADVISORY_LOCK_ID = 2_024_042_301;

export const auth = betterAuth({
  appName: "Fuxiaochen",
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 20,
  },
  user: {
    additionalFields: {
      role: {
        type: [ADMIN_USER_ROLE, DEFAULT_USER_ROLE],
        defaultValue: DEFAULT_USER_ROLE,
        input: false,
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: DEFAULT_USER_ROLE,
            },
          };
        },
        after: async (user) => {
          await db.transaction(async (tx) => {
            await tx.execute(
              sql`SELECT pg_advisory_xact_lock(${FIRST_ADMIN_ADVISORY_LOCK_ID})`,
            );

            const existingAdmin = await tx
              .select({ id: users.id })
              .from(users)
              .where(eq(users.role, ADMIN_USER_ROLE))
              .limit(1);

            if (existingAdmin.length > 0) {
              return;
            }

            await tx
              .update(users)
              .set({
                role: ADMIN_USER_ROLE,
              })
              .where(eq(users.id, user.id));
          });
        },
      },
    },
  },
  socialProviders:
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {},
});
