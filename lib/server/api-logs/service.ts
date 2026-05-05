import { logger } from "@/lib/server/logger";

import type {
  AdminApiTimingLogListQuery,
  ApiTimingLogEvent,
  ApiTimingLogScope,
} from "./dto";
import {
  apiTimingLogRepository,
  type ApiTimingLogRepository,
  type NewApiTimingLog,
} from "./repository";

export type ApiTimingLogWriteInput = {
  authMs?: number;
  errorCode?: string;
  event: ApiTimingLogEvent;
  method: string;
  operation?: string;
  parseMs?: number;
  path: string;
  proxyAuthMs?: number;
  requestId: string;
  responseMs?: number;
  role?: string;
  scope: ApiTimingLogScope;
  serviceMs?: number;
  status: number;
  totalMs?: number;
  userId?: string;
};

export interface ApiTimingLogService {
  listLogs(query: AdminApiTimingLogListQuery): Promise<{
    items: Awaited<ReturnType<ApiTimingLogRepository["list"]>>["items"];
    total: number;
  }>;
  recordLog(input: ApiTimingLogWriteInput): Promise<void>;
  cleanupOldLogs(now?: Date): Promise<number>;
}

export interface ApiTimingLogServiceDeps {
  repository?: ApiTimingLogRepository;
}

const ADMIN_LOGS_PATH_PREFIX = "/api/admin/logs";
const DEFAULT_SLOW_MS = 1000;
const DEFAULT_RETENTION_DAYS = 30;
const CLEANUP_THROTTLE_MS = 24 * 60 * 60 * 1000;

let lastCleanupStartedAt = 0;

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isDbLoggingEnabled = () => process.env.API_TIMING_DB_LOGS === "true";

const getSlowThresholdMs = () =>
  parsePositiveInteger(process.env.API_TIMING_DB_SLOW_MS, DEFAULT_SLOW_MS);

const getRetentionDays = () =>
  parsePositiveInteger(
    process.env.API_TIMING_LOG_RETENTION_DAYS,
    DEFAULT_RETENTION_DAYS,
  );

const normalizeMs = (value: number | undefined) =>
  Math.max(0, Math.round(value ?? 0));

const normalizeOptionalMs = (value: number | undefined) =>
  value === undefined ? undefined : normalizeMs(value);

const isPersistableRole = (value: string | undefined) =>
  value === "admin" || value === "user";

const shouldPersistLog = (input: ApiTimingLogWriteInput) => {
  if (!isDbLoggingEnabled()) {
    return false;
  }

  if (input.path === ADMIN_LOGS_PATH_PREFIX) {
    return false;
  }

  if (input.path.startsWith(`${ADMIN_LOGS_PATH_PREFIX}/`)) {
    return false;
  }

  const comparableMs = normalizeMs(input.totalMs ?? input.proxyAuthMs);

  return input.status >= 400 || comparableMs >= getSlowThresholdMs();
};

const toNewApiTimingLog = (input: ApiTimingLogWriteInput): NewApiTimingLog => ({
  id: crypto.randomUUID(),
  authMs: normalizeMs(input.authMs),
  createdAt: new Date(),
  errorCode: input.errorCode,
  event: input.event,
  method: input.method,
  operation: input.operation,
  parseMs: normalizeMs(input.parseMs),
  path: input.path,
  proxyAuthMs: normalizeOptionalMs(input.proxyAuthMs),
  requestId: input.requestId,
  responseMs: normalizeMs(input.responseMs),
  role: isPersistableRole(input.role) ? input.role : undefined,
  scope: input.scope,
  serviceMs: normalizeMs(input.serviceMs),
  status: input.status,
  totalMs: normalizeMs(input.totalMs ?? input.proxyAuthMs),
  userId: input.userId,
});

export function createApiTimingLogService({
  repository = apiTimingLogRepository,
}: ApiTimingLogServiceDeps = {}): ApiTimingLogService {
  return {
    listLogs(query) {
      return repository.list(query);
    },
    async recordLog(input) {
      if (!shouldPersistLog(input)) {
        return;
      }

      await repository.create(toNewApiTimingLog(input));
    },
    async cleanupOldLogs(now = new Date()) {
      const retentionDays = getRetentionDays();
      const before = new Date(
        now.getTime() - retentionDays * 24 * 60 * 60 * 1000,
      );

      return repository.deleteOlderThan(before);
    },
  };
}

export const apiTimingLogService = createApiTimingLogService();

export function enqueueApiTimingLog(input: ApiTimingLogWriteInput) {
  if (!shouldPersistLog(input)) {
    return;
  }

  void apiTimingLogService.recordLog(input).catch((error: unknown) => {
    logger.warn(
      {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : { message: "Unknown api timing log persistence error" },
        event: "api_timing_log_persist_failed",
        requestId: input.requestId,
      },
      "Failed to persist API timing log",
    );
  });

  const now = Date.now();

  if (now - lastCleanupStartedAt < CLEANUP_THROTTLE_MS) {
    return;
  }

  lastCleanupStartedAt = now;

  void apiTimingLogService
    .cleanupOldLogs(new Date(now))
    .catch((error: unknown) => {
      logger.warn(
        {
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  name: error.name,
                }
              : { message: "Unknown api timing log cleanup error" },
          event: "api_timing_log_cleanup_failed",
        },
        "Failed to cleanup old API timing logs",
      );
    });
}
