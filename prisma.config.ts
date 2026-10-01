import "dotenv/config";
import { defineConfig } from "@prisma/orm-sqlite/config";
import { definePrismaConfig } from "prisma/config";

import { databasePath } from "./lib/database-path";

export default definePrismaConfig({
  orm: defineConfig({
    contract: "./prisma/contract.ts",
    output: "./generated/prisma",
    migrations: { dir: "./prisma/migrations" },
    db: { connection: databasePath() },
  }),
});
