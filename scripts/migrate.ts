import "dotenv/config";
import { spawnSync } from "node:child_process";

import { requiredDatabaseUrl } from "../lib/database-url";

requiredDatabaseUrl();
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
