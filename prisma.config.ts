import "dotenv/config";
import { defineConfig } from "@prisma/orm-postgres/config";
import { definePrismaConfig } from "prisma/config";

import { databaseUrl } from "./lib/database-url";

export default definePrismaConfig({
  orm: defineConfig({
    contract: "./prisma/contract.ts",
    output: "./generated/prisma",
    migrations: { dir: "./prisma/migrations" },
    db: { connection: databaseUrl() },
  }),
});
