import "server-only";
import { and, asc, count as sqlCount, desc, eq, gte, or, sql } from "drizzle-orm";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin } from "@/lib/admin/service";
import { writeTransaction } from "@/lib/database";
import { pageVisit, siteSetting } from "@/lib/database/schema";

import { cleanupAnalytics } from "./collection";
import {
  ONLINE_MS,
  RETENTION_MS,
  SESSION_IDLE_MS,
  type AnalyticsRange,
  type AnalyticsSnapshot,
  type CollectionInfo,
  type VisitorList,
  type VisitorQuery,
  type AnalyticsMetrics,
} from "./schema";

type Transaction = Parameters<Parameters<typeof writeTransaction>[0]>[0];
function metricChange(current: number | null, previous: number | null | undefined) {
  return current !== null && previous !== null && previous !== undefined && previous !== 0
    ? ((current - previous) / previous) * 100
    : null;
}
export const shanghaiDay = (value: number) =>
  new Date(value + 8 * 3_600_000).toISOString().slice(0, 10);
export const shanghaiMidnight = (value: number) =>
  new Date(`${shanghaiDay(value)}T00:00:00+08:00`).getTime();
function collectionInfo(tx: Transaction, now: number): CollectionInfo {
  const row = tx
    .select({
      localAnalyticsEnabled: siteSetting.localAnalyticsEnabled,
      localAnalyticsStartedAt: siteSetting.localAnalyticsStartedAt,
    })
    .from(siteSetting)
    .where(eq(siteSetting.id, 1))
    .get();
  return {
    enabled: Boolean(row?.localAnalyticsEnabled),
    production: process.env.NODE_ENV === "production",
    startedAt: row?.localAnalyticsStartedAt?.toISOString() ?? null,
    availableFrom: new Date(
      Math.max(now - RETENTION_MS, row?.localAnalyticsStartedAt?.getTime() ?? now),
    ).toISOString(),
    generatedAt: new Date(now).toISOString(),
  };
}
export async function listVisitors(
  query: VisitorQuery,
  actor: TaxonomyActor,
): Promise<VisitorList> {
  authorizeAdmin(actor);
  await cleanupAnalytics();
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    const now = Date.now();
    const cutoff = now - RETENTION_MS;
    const filter = and(
      gte(pageVisit.createdAt, new Date(cutoff)),
      query.q
        ? or(
            sql`instr(lower(${pageVisit.ip}), lower(${query.q})) > 0`,
            sql`instr(lower(${pageVisit.location}), lower(${query.q})) > 0`,
            sql`instr(lower(${pageVisit.path}), lower(${query.q})) > 0`,
          )
        : undefined,
    );
    const { total } = tx.select({ total: sqlCount() }).from(pageVisit).where(filter).get()!;
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const order = query.sortDirection === "desc" ? desc : asc;
    const column =
      query.sortBy === "ip"
        ? pageVisit.ip
        : query.sortBy === "location"
          ? pageVisit.location
          : query.sortBy === "entryPage"
            ? pageVisit.path
            : query.sortBy === "platform"
              ? pageVisit.browser
              : query.sortBy === "duration"
                ? pageVisit.durationMs
                : pageVisit.createdAt;
    const primaryOrder = query.sortBy ? order(column) : desc(pageVisit.createdAt);
    const rows = tx
      .select()
      .from(pageVisit)
      .where(filter)
      .orderBy(
        primaryOrder,
        query.sortBy === "platform" ? order(pageVisit.os) : desc(pageVisit.id),
        desc(pageVisit.id),
      )
      .offset((page - 1) * query.pageSize)
      .limit(query.pageSize)
      .all();
    const summary = tx.get<{ online: number; uv: number; pv: number }>(
      sql`SELECT COUNT(DISTINCT CASE WHEN "lastSeenAt" >= ${now - ONLINE_MS} THEN "visitorHash" END) AS online, COUNT(DISTINCT CASE WHEN "createdAt" >= ${shanghaiMidnight(now)} THEN "visitorHash" END) AS uv, COALESCE(SUM(CASE WHEN "createdAt" >= ${shanghaiMidnight(now)} THEN 1 ELSE 0 END), 0) AS pv FROM page_visit WHERE "createdAt" >= ${cutoff}`,
    );
    return {
      items: rows.map((row) => ({
        id: row.id,
        ip: row.ip,
        location: row.location,
        entryPage: row.path,
        browser: row.browser,
        os: row.os,
        durationMs: row.durationMs,
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: query.pageSize,
      pageCount,
      summary,
      collection: collectionInfo(tx, now),
    };
  });
}
function metrics(tx: Transaction, start: number, end: number, now: number): AnalyticsMetrics {
  const from = Math.max(start, now - RETENTION_MS);
  const visits = tx.get<{ pv: number; uv: number; duration: number; articlePv: number }>(
    sql`SELECT COUNT(*) AS pv, COUNT(DISTINCT "visitorHash") AS uv, COALESCE(SUM(CASE WHEN article = 1 THEN "durationMs" ELSE 0 END), 0) AS duration, COALESCE(SUM(article), 0) AS "articlePv" FROM page_visit WHERE "createdAt" >= ${from} AND "createdAt" < ${end}`,
  );
  const sessions = tx.get<{ total: number; bounced: number }>(
    sql`SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN pages = 1 AND duration < 10000 THEN 1 ELSE 0 END), 0) AS bounced FROM (SELECT s.id, COUNT(v.id) AS pages, SUM(v."durationMs") AS duration FROM visit_session s JOIN page_visit v ON v."sessionId" = s.id WHERE s."createdAt" >= ${from} AND s."createdAt" < ${end} AND s."lastSeenAt" <= ${now - SESSION_IDLE_MS} GROUP BY s.id) AS session_metrics`,
  );
  return {
    pv: visits.pv,
    uv: visits.uv,
    durationMs: visits.articlePv ? visits.duration / visits.articlePv : null,
    bounce: sessions.total ? (sessions.bounced / sessions.total) * 100 : null,
  };
}
export async function getAnalytics(
  range: AnalyticsRange,
  actor: TaxonomyActor,
): Promise<AnalyticsSnapshot> {
  authorizeAdmin(actor);
  await cleanupAnalytics();
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    const now = Date.now();
    const day = shanghaiMidnight(now);
    const start =
      range === "quarter"
        ? new Date(
            `${shanghaiDay(now).slice(0, 4)}-${String(Math.floor((Number(shanghaiDay(now).slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, "0")}-01T00:00:00+08:00`,
          ).getTime()
        : day - (range === "7d" ? 6 : 29) * 86_400_000;
    const previousStart = start - (now - start);
    const collection = collectionInfo(tx, now);
    const current = metrics(tx, start, now, now);
    const previous =
      previousStart >= new Date(collection.availableFrom).getTime()
        ? metrics(tx, previousStart, start, now)
        : null;
    const changes = {
      pv: metricChange(current.pv, previous?.pv),
      uv: metricChange(current.uv, previous?.uv),
      durationMs: metricChange(current.durationMs, previous?.durationMs),
      bounce: metricChange(current.bounce, previous?.bounce),
    };
    const from = Math.max(start, now - RETENTION_MS);
    const to = now;
    // UTC 毫秒按固定北京时间分组，避免依赖服务器本地时区。
    const daily = tx.all<{ date: string; pv: number; uv: number }>(
      sql`SELECT date("createdAt" / 1000, 'unixepoch', '+8 hours') AS date, COUNT(*) AS pv, COUNT(DISTINCT "visitorHash") AS uv FROM page_visit WHERE "createdAt" >= ${from} AND "createdAt" < ${to} GROUP BY date("createdAt" / 1000, 'unixepoch', '+8 hours') ORDER BY date`,
    );
    const byDay = new Map(daily.map((row) => [row.date, row]));
    const trend = Array.from({ length: Math.floor((day - start) / 86_400_000) + 1 }, (_, i) => {
      const date = shanghaiDay(start + i * 86_400_000);
      if (!collection.startedAt || date < shanghaiDay(new Date(collection.availableFrom).getTime()))
        return { date, pv: null, uv: null };
      return byDay.get(date) ?? { date, pv: 0, uv: 0 };
    });
    const devices = tx.all<{ name: string; count: number }>(
      sql`SELECT device AS name, COUNT(*) AS count FROM page_visit WHERE "createdAt" >= ${from} AND "createdAt" < ${to} GROUP BY device`,
    );
    const deviceLabels = {
      desktop: "桌面电脑",
      mobile: "移动手机",
      tablet: "平板设备",
      unknown: "未知设备",
    };
    const sources = tx.all<{ name: string; count: number }>(
      sql`SELECT source AS name, COUNT(*) AS count FROM page_visit WHERE "createdAt" >= ${from} AND "createdAt" < ${to} GROUP BY source ORDER BY count DESC, source`,
    );
    const articles = tx.all<{
      id: string;
      title: string;
      path: string;
      pv: number;
      uv: number;
      completed: number;
    }>(
      sql`SELECT COALESCE(v."postId", v.path) AS id, COALESCE(p.title, v.path) AS title, MIN(v.path) AS path, COUNT(*) AS pv, COUNT(DISTINCT v."visitorHash") AS uv, SUM(CASE WHEN v.progress >= 90 AND v."durationMs" >= 10000 THEN 1 ELSE 0 END) AS completed FROM page_visit v LEFT JOIN post p ON p.id = v."postId" WHERE v.article = 1 AND v."createdAt" >= ${from} AND v."createdAt" < ${to} GROUP BY COALESCE(v."postId", v.path), COALESCE(p.title, v.path) ORDER BY pv DESC, id LIMIT 20`,
    );
    return {
      range,
      start: new Date(start).toISOString(),
      end: new Date(to).toISOString(),
      collection,
      incomplete: start < new Date(collection.availableFrom).getTime(),
      metrics: current,
      changes,
      trend,
      devices: Object.entries(deviceLabels).map(([key, name]) => {
        const count = devices.find((d) => d.name === key)?.count ?? 0;
        return { name, count, percent: current.pv ? (count / current.pv) * 100 : 0 };
      }),
      sources: sources.map((row) => ({
        ...row,
        percent: current.pv ? (row.count / current.pv) * 100 : 0,
      })),
      articles: articles.map(({ completed, ...row }) => ({
        ...row,
        rate: (completed / row.pv) * 100,
      })),
    };
  });
}
