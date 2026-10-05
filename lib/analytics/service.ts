import "server-only";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin } from "@/lib/admin/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

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

type Transaction = Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0];
const integer = "pg/int8number@1" as const;
const text = "pg/text@1" as const;
function metricChange(current: number | null, previous: number | null | undefined) {
  return current !== null && previous !== null && previous !== undefined && previous !== 0
    ? ((current - previous) / previous) * 100
    : null;
}
export const shanghaiDay = (value: number) =>
  new Date(value + 8 * 3_600_000).toISOString().slice(0, 10);
export const shanghaiMidnight = (value: number) =>
  new Date(`${shanghaiDay(value)}T00:00:00+08:00`).getTime();
async function collectionInfo(tx: Transaction, now: number): Promise<CollectionInfo> {
  const row = await tx.orm.public.SiteSetting.where({ id: 1 })
    .select("localAnalyticsEnabled", "localAnalyticsStartedAt")
    .first();
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
  await authorizeAdmin(actor);
  await cleanupAnalytics();
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const db = getDatabase();
    const now = Date.now();
    const cutoff = new Date(now - RETENTION_MS).toISOString();
    let filtered = tx.orm.public.PageVisit.where((v) =>
      db.raw.sql`${v.createdAt} >= ${cutoff}`.returns("pg/bool@1").buildAst(),
    );
    if (query.q)
      filtered = filtered.where((v) =>
        db.raw
          .sql`(strpos(lower(${v.ip}), lower(${query.q})) > 0 OR strpos(lower(${v.location}), lower(${query.q})) > 0 OR strpos(lower(${v.path}), lower(${query.q})) > 0)`
          .returns("pg/bool@1")
          .buildAst(),
      );
    const { total } = await filtered.aggregate((agg) => ({ total: agg.count() }));
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const direction = query.sortDirection ?? "asc";
    const rows = await filtered
      .orderBy([
        (v) => {
          switch (query.sortBy) {
            case "ip":
              return v.ip[direction]();
            case "location":
              return v.location[direction]();
            case "entryPage":
              return v.path[direction]();
            case "platform":
              return v.browser[direction]();
            case "duration":
              return v.durationMs[direction]();
            case "time":
              return v.createdAt[direction]();
            default:
              return v.createdAt.desc();
          }
        },
        (v) => (query.sortBy === "platform" ? v.os[direction]() : v.id.desc()),
        (v) => v.id.desc(),
      ])
      .offset((page - 1) * query.pageSize)
      .limit(query.pageSize)
      .all();
    const [summary] = await tx.query(
      db.raw
        .sql`SELECT COUNT(DISTINCT CASE WHEN "lastSeenAt" >= ${new Date(now - ONLINE_MS).toISOString()} THEN "visitorHash" END) AS online, COUNT(DISTINCT CASE WHEN "createdAt" >= ${new Date(shanghaiMidnight(now)).toISOString()} THEN "visitorHash" END) AS uv, COALESCE(SUM(CASE WHEN "createdAt" >= ${new Date(shanghaiMidnight(now)).toISOString()} THEN 1 ELSE 0 END), 0) AS pv FROM page_visit WHERE "createdAt" >= ${cutoff}`
        .returnsRow({ online: integer, uv: integer, pv: integer })
        .build(),
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
      collection: await collectionInfo(tx, now),
    };
  });
}
async function metrics(
  tx: Transaction,
  start: number,
  end: number,
  now: number,
): Promise<AnalyticsMetrics> {
  const raw = getDatabase().raw;
  const from = new Date(Math.max(start, now - RETENTION_MS)).toISOString();
  const to = new Date(end).toISOString();
  const [visits] = await tx.query(
    raw.sql`SELECT COUNT(*) AS pv, COUNT(DISTINCT "visitorHash") AS uv, COALESCE(SUM(CASE WHEN article = 1 THEN "durationMs" ELSE 0 END), 0) AS duration, COALESCE(SUM(article), 0) AS "articlePv" FROM page_visit WHERE "createdAt" >= ${from} AND "createdAt" < ${to}`
      .returnsRow({ pv: integer, uv: integer, duration: integer, articlePv: integer })
      .build(),
  );
  const [sessions] = await tx.query(
    raw.sql`SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN pages = 1 AND duration < 10000 THEN 1 ELSE 0 END), 0) AS bounced FROM (SELECT s.id, COUNT(v.id) AS pages, SUM(v."durationMs") AS duration FROM visit_session s JOIN page_visit v ON v."sessionId" = s.id WHERE s."createdAt" >= ${from} AND s."createdAt" < ${to} AND s."lastSeenAt" <= ${new Date(now - SESSION_IDLE_MS).toISOString()} GROUP BY s.id) AS session_metrics`
      .returnsRow({ total: integer, bounced: integer })
      .build(),
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
  await authorizeAdmin(actor);
  await cleanupAnalytics();
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const now = Date.now();
    const day = shanghaiMidnight(now);
    const start =
      range === "quarter"
        ? new Date(
            `${shanghaiDay(now).slice(0, 4)}-${String(Math.floor((Number(shanghaiDay(now).slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, "0")}-01T00:00:00+08:00`,
          ).getTime()
        : day - (range === "7d" ? 6 : 29) * 86_400_000;
    const previousStart = start - (now - start);
    const collection = await collectionInfo(tx, now);
    const current = await metrics(tx, start, now, now);
    const previous =
      previousStart >= new Date(collection.availableFrom).getTime()
        ? await metrics(tx, previousStart, start, now)
        : null;
    const changes = {
      pv: metricChange(current.pv, previous?.pv),
      uv: metricChange(current.uv, previous?.uv),
      durationMs: metricChange(current.durationMs, previous?.durationMs),
      bounce: metricChange(current.bounce, previous?.bounce),
    };
    const raw = getDatabase().raw;
    const from = new Date(Math.max(start, now - RETENTION_MS)).toISOString();
    const to = new Date(now).toISOString();
    const daily = await tx.query(
      raw.sql`SELECT to_char("createdAt" AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS date, COUNT(*) AS pv, COUNT(DISTINCT "visitorHash") AS uv FROM page_visit WHERE "createdAt" >= ${from} AND "createdAt" < ${to} GROUP BY to_char("createdAt" AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') ORDER BY date`
        .returnsRow({ date: text, pv: integer, uv: integer })
        .build(),
    );
    const byDay = new Map(daily.map((row) => [row.date, row]));
    const trend = Array.from({ length: Math.floor((day - start) / 86_400_000) + 1 }, (_, i) => {
      const date = shanghaiDay(start + i * 86_400_000);
      return byDay.get(date) ?? { date, pv: 0, uv: 0 };
    });
    const devices = await tx.query(
      raw.sql`SELECT device AS name, COUNT(*) AS count FROM page_visit WHERE "createdAt" >= ${from} AND "createdAt" < ${to} GROUP BY device`
        .returnsRow({ name: text, count: integer })
        .build(),
    );
    const deviceLabels = {
      desktop: "桌面电脑",
      mobile: "移动手机",
      tablet: "平板设备",
      unknown: "未知设备",
    };
    const sources = await tx.query(
      raw.sql`SELECT source AS name, COUNT(*) AS count FROM page_visit WHERE "createdAt" >= ${from} AND "createdAt" < ${to} GROUP BY source ORDER BY count DESC, source`
        .returnsRow({ name: text, count: integer })
        .build(),
    );
    const articles = await tx.query(
      raw.sql`SELECT COALESCE(v."postId", v.path) AS id, COALESCE(p.title, v.path) AS title, MIN(v.path) AS path, COUNT(*) AS pv, COUNT(DISTINCT v."visitorHash") AS uv, SUM(CASE WHEN v.progress >= 90 AND v."durationMs" >= 10000 THEN 1 ELSE 0 END) AS completed FROM page_visit v LEFT JOIN post p ON p.id = v."postId" WHERE v.article = 1 AND v."createdAt" >= ${from} AND v."createdAt" < ${to} GROUP BY COALESCE(v."postId", v.path), COALESCE(p.title, v.path) ORDER BY pv DESC, id LIMIT 20`
        .returnsRow({
          id: text,
          title: text,
          path: text,
          pv: integer,
          uv: integer,
          completed: integer,
        })
        .build(),
    );
    return {
      range,
      start: new Date(start).toISOString(),
      end: to,
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
