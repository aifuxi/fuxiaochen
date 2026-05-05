import type { ApiTimingLog } from "@/lib/db/schema";

export type AdminApiTimingLogListItem = {
  authMs: number;
  createdAt: string;
  errorCode: string | null;
  event: ApiTimingLog["event"];
  id: string;
  method: string;
  operation: string | null;
  parseMs: number;
  path: string;
  proxyAuthMs: number | null;
  requestId: string;
  responseMs: number;
  role: ApiTimingLog["role"];
  scope: ApiTimingLog["scope"];
  serviceMs: number;
  status: number;
  totalMs: number;
  userId: string | null;
};

export function toAdminApiTimingLogListItem(
  log: ApiTimingLog,
): AdminApiTimingLogListItem {
  return {
    authMs: log.authMs,
    createdAt: log.createdAt.toISOString(),
    errorCode: log.errorCode,
    event: log.event,
    id: log.id,
    method: log.method,
    operation: log.operation,
    parseMs: log.parseMs,
    path: log.path,
    proxyAuthMs: log.proxyAuthMs,
    requestId: log.requestId,
    responseMs: log.responseMs,
    role: log.role,
    scope: log.scope,
    serviceMs: log.serviceMs,
    status: log.status,
    totalMs: log.totalMs,
    userId: log.userId,
  };
}
