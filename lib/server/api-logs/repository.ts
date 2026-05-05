import {
  and,
  desc,
  eq,
  gte,
  ilike,
  lt,
  lte,
  sql,
  type SQL,
  type SQLWrapper,
} from "drizzle-orm";

import { db } from "@/lib/db";
import {
  apiTimingLogs,
  type ApiTimingLog,
  type NewApiTimingLog,
} from "@/lib/db/schema";

import type {
  AdminApiTimingLogListQuery,
  ApiTimingLogStatusClass,
} from "./dto";

export interface ApiTimingLogRepository {
  list(query: AdminApiTimingLogListQuery): Promise<{
    items: ApiTimingLog[];
    total: number;
  }>;
  create(log: NewApiTimingLog): Promise<void>;
  deleteOlderThan(before: Date): Promise<number>;
}

const getStatusClassRange = (statusClass: ApiTimingLogStatusClass) => {
  const base = Number(statusClass[0]) * 100;

  return {
    min: base,
    max: base + 99,
  };
};

const buildWhere = ({
  errorCode,
  event,
  from,
  method,
  minTotalMs,
  operation,
  path,
  requestId,
  scope,
  status,
  statusClass,
  to,
  userId,
}: AdminApiTimingLogListQuery) => {
  const filters: SQLWrapper[] = [];

  if (scope) {
    filters.push(eq(apiTimingLogs.scope, scope));
  }

  if (event) {
    filters.push(eq(apiTimingLogs.event, event));
  }

  if (method) {
    filters.push(eq(apiTimingLogs.method, method));
  }

  if (status) {
    filters.push(eq(apiTimingLogs.status, status));
  } else if (statusClass) {
    const { min, max } = getStatusClassRange(statusClass);
    filters.push(
      and(gte(apiTimingLogs.status, min), lte(apiTimingLogs.status, max))!,
    );
  }

  if (requestId) {
    filters.push(ilike(apiTimingLogs.requestId, `%${requestId}%`));
  }

  if (path) {
    filters.push(ilike(apiTimingLogs.path, `%${path}%`));
  }

  if (operation) {
    filters.push(ilike(apiTimingLogs.operation, `%${operation}%`));
  }

  if (userId) {
    filters.push(ilike(apiTimingLogs.userId, `%${userId}%`));
  }

  if (errorCode) {
    filters.push(ilike(apiTimingLogs.errorCode, `%${errorCode}%`));
  }

  if (minTotalMs !== undefined) {
    filters.push(gte(apiTimingLogs.totalMs, minTotalMs));
  }

  if (from) {
    filters.push(gte(apiTimingLogs.createdAt, from));
  }

  if (to) {
    filters.push(lte(apiTimingLogs.createdAt, to));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};

const countLogs = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(apiTimingLogs)
    .where(where);

  return rows[0]?.total ?? 0;
};

export const apiTimingLogRepository: ApiTimingLogRepository = {
  async list(query) {
    const where = buildWhere(query);
    const offset = (query.page - 1) * query.pageSize;

    const [items, total] = await Promise.all([
      db
        .select()
        .from(apiTimingLogs)
        .where(where)
        .orderBy(desc(apiTimingLogs.createdAt), desc(apiTimingLogs.id))
        .limit(query.pageSize)
        .offset(offset),
      countLogs(where),
    ]);

    return {
      items,
      total,
    };
  },
  async create(log) {
    await db.insert(apiTimingLogs).values(log);
  },
  async deleteOlderThan(before) {
    const deleted = await db
      .delete(apiTimingLogs)
      .where(lt(apiTimingLogs.createdAt, before))
      .returning({ id: apiTimingLogs.id });

    return deleted.length;
  },
};

export type { ApiTimingLog, NewApiTimingLog };
