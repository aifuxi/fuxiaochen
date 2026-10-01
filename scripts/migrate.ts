import "dotenv/config";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { databasePath } from "../lib/database-path";

mkdirSync(dirname(databasePath()), { recursive: true });
for (const command of ["migrate", "verify"]) {
  const result = spawnSync(
    process.execPath,
    ["node_modules/prisma/dist/prisma.js", "db", command],
    { stdio: "inherit" },
  );
  if (result.error || result.status !== 0) {
    process.exitCode = result.status ?? 1;
    break;
  }
}
