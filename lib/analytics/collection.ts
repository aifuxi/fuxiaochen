import "server-only";
import Bowser from "bowser";
import { and, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { createHash, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { setImmediate } from "node:timers/promises";

import { writeTransaction } from "@/lib/database";
import {
  analyticsRateLimit,
  pageVisit,
  post as postTable,
  siteSetting,
  visitSession,
} from "@/lib/database/schema";

import { RETENTION_MS, SESSION_IDLE_MS, type AnalyticsEvent } from "./schema";

type Transaction = Parameters<Parameters<typeof writeTransaction>[0]>[0];
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
    const cutoff = Date.now() - RETENTION_MS;
    // 每批释放写事务，避免清理长时间占用共享写锁。
    while (true) {
      const count = writeTransaction((tx) => {
        return tx
          .delete(pageVisit)
          .where(
            inArray(
              pageVisit.id,
              tx
                .select({ id: pageVisit.id })
                .from(pageVisit)
                .where(sql`${pageVisit.createdAt} < ${cutoff}`)
                .limit(500),
            ),
          )
          .run().changes;
      });
      removed += count;
      if (!count) break;
      // 每批之间让出事件循环，避免同步清理长期阻塞 HTTP 请求。
      await setImmediate();
    }
    writeTransaction((tx) => {
      tx.delete(visitSession)
        .where(
          sql`NOT EXISTS (SELECT 1 FROM page_visit v WHERE v."sessionId" = ${visitSession.id})`,
        )
        .run();
      tx.delete(analyticsRateLimit).where(lte(analyticsRateLimit.expiresAt, new Date())).run();
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
  const version = value.includes("%") ? 0 : isIP(value);
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
        : /(^|\.)(google\.(com(?:\.[a-z]{2})?|co\.[a-z]{2}|[a-z]{2})|baidu\.com|bing\.com|sogou\.com|so\.com|duckduckgo\.com)$/.test(
              host,
            )
          ? "搜索引擎"
          : "其他外站";
    return { source, referrerHost: host };
  } catch {
    return { source: "直接访问", referrerHost: "" };
  }
}
function consumeLimit(tx: Transaction, visitorHash: string, now: number) {
  const window = Math.floor(now / 60_000);
  const limits = [
    { id: "global", max: 600 },
    { id: `visitor:${visitorHash}`, max: 30 },
  ];
  const entries = [];
  for (const limit of limits) {
    const previous = tx
      .select()
      .from(analyticsRateLimit)
      .where(eq(analyticsRateLimit.id, limit.id))
      .get();
    const count = previous?.window === window ? previous.count : 0;
    if (count >= limit.max) return Math.max(1, Math.ceil(((window + 1) * 60_000 - now) / 1000));
    entries.push({ id: limit.id, previous, count });
  }
  for (const entry of entries) {
    const data = { window, count: entry.count + 1, expiresAt: new Date((window + 1) * 60_000) };
    if (entry.previous)
      tx.update(analyticsRateLimit).set(data).where(eq(analyticsRateLimit.id, entry.id)).run();
    else
      tx.insert(analyticsRateLimit)
        .values({ id: entry.id, ...data })
        .run();
  }
  return 0;
}
export async function collectEvent(input: AnalyticsEvent, headers: Headers) {
  if (process.env.NODE_ENV !== "production") return;
  const ua = headers.get("user-agent") ?? "";
  if (/bot\b|crawler|spider|headless|slurp/i.test(ua)) return;
  await cleanupAnalytics();
  const result = writeTransaction((tx) => {
    const setting = tx.select().from(siteSetting).where(eq(siteSetting.id, 1)).get();
    if (!setting?.localAnalyticsEnabled) return 0;
    const url = new URL(input.path, process.env.APP_ORIGIN);
    const path = url.pathname;
    if (url.origin !== process.env.APP_ORIGIN)
      throw new AnalyticsError("INVALID_INPUT", "仅采集站内公开页面。");
    const visitorHash = createHash("sha256").update(input.visitorId).digest("hex");
    const previous = tx.select().from(pageVisit).where(eq(pageVisit.id, input.pageViewId)).get();
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
      const post = tx
        .select({ id: postTable.id })
        .from(postTable)
        .where(and(eq(postTable.slug, slug), eq(postTable.status, "published")))
        .get();
      if (!post) {
        // 已创建访问允许删除/下架后的最后一次补报；不会新建文章访问。
        if (!previous) throw new AnalyticsError("INVALID_INPUT", "文章不存在或未发布。");
      } else postId = post.id;
    } else if (!publicPaths.includes(path))
      throw new AnalyticsError("INVALID_INPUT", "页面不在采集范围内。");
    const retryAfter = consumeLimit(tx, visitorHash, now);
    if (retryAfter) return retryAfter;
    if (previous) {
      const durationMs = Math.max(
        previous.durationMs,
        Math.min(input.durationMs, now - previous.createdAt.getTime()),
      );
      const active = input.visible || durationMs > previous.durationMs;
      const lastSeenAt = active ? new Date(now) : previous.lastSeenAt;
      tx.update(pageVisit)
        .set({
          durationMs,
          progress: Math.max(previous.progress, input.progress),
          lastSeenAt,
        })
        .where(eq(pageVisit.id, previous.id))
        .run();
      if (active)
        tx.update(visitSession)
          .set({ lastSeenAt })
          .where(eq(visitSession.id, previous.sessionId))
          .run();
      return 0;
    }
    let session = tx
      .select()
      .from(visitSession)
      .where(eq(visitSession.visitorHash, visitorHash))
      .orderBy(desc(visitSession.lastSeenAt))
      .get();
    if (!session || session.lastSeenAt.getTime() <= now - SESSION_IDLE_MS)
      session = tx
        .insert(visitSession)
        .values({
          id: randomUUID(),
          visitorHash,
          createdAt: new Date(now),
          lastSeenAt: new Date(now),
        })
        .returning()
        .get();
    else
      tx.update(visitSession)
        .set({ lastSeenAt: new Date(now) })
        .where(eq(visitSession.id, session.id))
        .run();
    const parsed = Bowser.parse(ua);
    const device = parsed.platform.type;
    tx.insert(pageVisit)
      .values({
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
      })
      .run();
    return 0;
  });
  if (result) throw new AnalyticsError("RATE_LIMITED", "采集请求过于频繁。", result);
}
