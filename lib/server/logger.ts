import pino from "pino";

import { env } from "@/lib/env";

export const logger = pino({
  base: undefined,
  level: env.LOG_LEVEL,
});
