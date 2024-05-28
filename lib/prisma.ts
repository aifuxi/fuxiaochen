import { PrismaClient } from "@prisma/client";

import { DATABASE_URL, NODE_ENV } from "@/config";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: DATABASE_URL,
    log:
      NODE_ENV === "development"
        ? // ? ['query', 'info', 'warn', 'error']
          ["warn", "error"]
        : undefined,
  });

if (NODE_ENV !== "production") globalForPrisma.prisma = prisma;
