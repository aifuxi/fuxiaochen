import pino from "pino";

export const logger = pino({
  base: undefined,
  level: process.env.LOG_LEVEL ?? "info",
});
