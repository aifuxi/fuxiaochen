import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
