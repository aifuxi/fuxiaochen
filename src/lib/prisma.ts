import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { db: PrismaClient };

export const db =
  globalForPrisma.db ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log:
      process.env.NODE_ENV === "development"
        ? // ? ['query', 'info', 'warn', 'error']
          ["warn", "error"]
        : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;
