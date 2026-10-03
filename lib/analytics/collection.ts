import "server-only";
import Bowser from "bowser";
import { createHash, randomUUID } from "node:crypto";
import { isIP } from "node:net";

import { getDatabase, writeTransaction } from "@/prisma/db";

import { RETENTION_MS, SESSION_IDLE_MS, type AnalyticsEvent } from "./schema";

type Transaction = Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0];
export class AnalyticsError extends Error {
  constructor(
    public code: "INVALID_INPUT" | "EVENT_CONFLICT" | "RATE_LIMITED",
    message: string,
    public retryAfter = 0,
  ) {
    super(message);
  }
}
const cleanupState = globalThis as typeof globalThis & {
  analyticsCleanupAt?: number;
  analyticsCleanup?: Promise<{ removed: number }>;
};
export async function cleanupAnalytics(force = false) {
  if (!force && Date.now() - (cleanupState.analyticsCleanupAt ?? 0) < 86_400_000)
    return { removed: 0 };
  if (cleanupState.analyticsCleanup) return cleanupState.analyticsCleanup;
  const work = async () => {
    let removed = 0;
    const cutoff = new Date(Date.now() - RETENTION_MS).toISOString();
    // 每批释放事务队列，避免清理长时间占用 SQLite 写锁。
    while (true) {
      const count = await writeTransaction(async (tx) => {
        return tx.orm.PageVisit.where((v) =>
          getDatabase().raw
            .sql`${v.id} IN (SELECT id FROM page_visit WHERE createdAt < ${cutoff} LIMIT 500)`
            .returns("sqlite/integer@1")
            .buildAst(),
        ).deleteAndCount();
      });
      removed += count;
      if (!count) break;
    }
    await writeTransaction(async (tx) => {
      await tx.orm.VisitSession.where((s) =>
        getDatabase().raw.sql`NOT EXISTS (SELECT 1 FROM page_visit v WHERE v.sessionId = ${s.id})`
          .returns("sqlite/integer@1")
          .buildAst(),
      ).deleteAndCount();
      await tx.orm.AnalyticsRateLimit.where((r) =>
        getDatabase().raw.sql`${r.expiresAt} <= ${new Date().toISOString()}`
          .returns("sqlite/integer@1")
          .buildAst(),
      ).deleteAndCount();
    });
    cleanupState.analyticsCleanupAt = Date.now();
    return { removed };
  };
  cleanupState.analyticsCleanup = work();
  try {
    return await cleanupState.analyticsCleanup;
  } finally {
    cleanupState.analyticsCleanup = undefined;
  }
}
export function maskedIp(headers: Headers) {
  const header = process.env.ANALYTICS_CLIENT_IP_HEADER?.trim().toLowerCase();
  if (!header || !/^[a-z0-9-]+$/.test(header)) return "未知";
  const value = headers.get(header)?.trim() ?? "";
  const version = isIP(value);
  if (version === 4) return `${value.split(".").slice(0, 3).join(".")}.0/24`;
  if (version === 6) {
    // URL 将压缩、大小写和 IPv4 映射形式统一为 IPv6；再展开补齐网络前缀。
    const canonical = new URL(`http://[${value}]/`).hostname.slice(1, -1);
    const [left, right = ""] = canonical.split("::");
    const head = left ? left.split(":") : [];
    const tail = right ? right.split(":") : [];
    const parts = canonical.includes("::")
      ? [...head, ...Array<string>(8 - head.length - tail.length).fill("0"), ...tail]
      : head;
    return `${parts
      .slice(0, 3)
      .map((p) => parseInt(p, 16).toString(16))
      .join(":")}::/48`;
  }
  return "未知";
}
function sourceOf(referrer: string) {
  try {
    const url = new URL(referrer);
    if (!["http:", "https:"].includes(url.protocol))
      return { source: "直接访问", referrerHost: "" };
    const host = url.hostname.toLowerCase();
    const source =
      host === new URL(process.env.APP_ORIGIN!).hostname
        ? "站内访问"
        : /(^|\.)(google\.[a-z.]+|baidu\.com|bing\.com|sogou\.com|so\.com|duckduckgo\.com)$/.test(
              host,
            )
          ? "搜索引擎"
          : "其他外站";
    return { source, referrerHost: host };
  } catch {
    return { source: "直接访问", referrerHost: "" };
  }
}
async function consumeLimit(tx: Transaction, visitorHash: string, now: number) {
  const window = Math.floor(now / 60_000);
  const limits = [
    { id: "global", max: 600 },
    { id: `visitor:${visitorHash}`, max: 30 },
  ];
  const entries = [];
  for (const limit of limits) {
    const previous = await tx.orm.AnalyticsRateLimit.where({ id: limit.id }).first();
    const count = previous?.window === window ? previous.count : 0;
    if (count >= limit.max) return Math.max(1, Math.ceil(((window + 1) * 60_000 - now) / 1000));
    entries.push({ id: limit.id, previous, count });
  }
  for (const entry of entries) {
    const data = { window, count: entry.count + 1, expiresAt: new Date((window + 1) * 60_000) };
    if (entry.previous)
      await tx.orm.AnalyticsRateLimit.where({ id: entry.id }).updateAndCount(data);
    else await tx.orm.AnalyticsRateLimit.create({ id: entry.id, ...data });
  }
  return 0;
}
export async function collectEvent(input: AnalyticsEvent, headers: Headers) {
  if (process.env.NODE_ENV !== "production") return;
  const ua = headers.get("user-agent") ?? "";
  if (/bot\b|crawler|spider|headless|slurp/i.test(ua)) return;
  await cleanupAnalytics();
  const result = await writeTransaction(async (tx) => {
    const setting = await tx.orm.SiteSetting.where({ id: 1 }).first();
    if (!setting?.localAnalyticsEnabled) return 0;
    const url = new URL(input.path, process.env.APP_ORIGIN);
    const path = url.pathname;
    if (url.origin !== process.env.APP_ORIGIN)
      throw new AnalyticsError("INVALID_INPUT", "仅采集站内公开页面。");
    const visitorHash = createHash("sha256").update(input.visitorId).digest("hex");
    const previous = await tx.orm.PageVisit.where({ id: input.pageViewId }).first();
    if (previous && (previous.visitorHash !== visitorHash || previous.path !== path))
      throw new AnalyticsError("EVENT_CONFLICT", "访问标识已用于其他访问。");
    const now = Date.now();
    if (previous && previous.createdAt.getTime() < now - RETENTION_MS) return 0;
    const publicPaths = [
      "/",
      "/posts",
      "/categories",
      "/tags",
      "/friends-links",
      "/about",
      "/changelog",
    ];
    let postId: string | null = null;
    const slug = /^\/posts\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(path)?.[1];
    if (slug) {
      const post = await tx.orm.Post.where({ slug, status: "published" }).select("id").first();
      if (!post) {
        // 已创建访问允许删除/下架后的最后一次补报；不会新建文章访问。
        if (!previous) throw new AnalyticsError("INVALID_INPUT", "文章不存在或未发布。");
      } else postId = post.id;
    } else if (!publicPaths.includes(path))
      throw new AnalyticsError("INVALID_INPUT", "页面不在采集范围内。");
    const retryAfter = await consumeLimit(tx, visitorHash, now);
    if (retryAfter) return retryAfter;
    if (previous) {
      const durationMs = Math.max(
        previous.durationMs,
        Math.min(input.durationMs, now - previous.createdAt.getTime()),
      );
      const active = input.visible || durationMs > previous.durationMs;
      const lastSeenAt = active ? new Date(now) : previous.lastSeenAt;
      await tx.orm.PageVisit.where({ id: previous.id }).updateAndCount({
        durationMs,
        progress: Math.max(previous.progress, input.progress),
        lastSeenAt,
      });
      if (active)
        await tx.orm.VisitSession.where({ id: previous.sessionId }).updateAndCount({ lastSeenAt });
      return 0;
    }
    let session = await tx.orm.VisitSession.where({ visitorHash })
      .orderBy((s) => s.lastSeenAt.desc())
      .first();
    if (!session || session.lastSeenAt.getTime() <= now - SESSION_IDLE_MS)
      session = await tx.orm.VisitSession.create({
        id: randomUUID(),
        visitorHash,
        createdAt: new Date(now),
        lastSeenAt: new Date(now),
      });
    else
      await tx.orm.VisitSession.where({ id: session.id }).updateAndCount({
        lastSeenAt: new Date(now),
      });
    const parsed = Bowser.parse(ua);
    const device = parsed.platform.type;
    await tx.orm.PageVisit.create({
      id: input.pageViewId,
      visitorHash,
      sessionId: session.id,
      path,
      postId,
      article: Number(!!slug),
      ...sourceOf(input.referrer),
      device: ["desktop", "mobile", "tablet"].includes(device ?? "") ? device! : "unknown",
      browser: parsed.browser.name ?? "未知",
      os: parsed.os.name ?? "未知",
      ip: maskedIp(headers),
      location: "未知",
      createdAt: new Date(now),
      lastSeenAt: new Date(now),
      durationMs: 0,
      progress: input.progress,
    });
    return 0;
  });
  if (result) throw new AnalyticsError("RATE_LIMITED", "采集请求过于频繁。", result);
}
