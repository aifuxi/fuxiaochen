"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { RETENTION_MS, SESSION_IDLE_MS, type AnalyticsEvent } from "@/lib/analytics/schema";

type Visit = {
  id: string;
  path: string;
  referrer: string;
  durationMs: number;
  progress: number;
  visibleSince: number | null;
  lastActivity: number;
};
// 文档内保留访问标识，React 重挂载不会多计 PV；刷新产生新文档。
let current: Visit | null = null;
let documentVisitor = "";
function visitorId() {
  if (documentVisitor) return documentVisitor;
  try {
    const value: unknown = JSON.parse(localStorage.getItem("fx_local_visitor") ?? "null");
    if (
      value &&
      typeof value === "object" &&
      "id" in value &&
      "expiresAt" in value &&
      typeof value.id === "string" &&
      /^[0-9a-f-]{36}$/i.test(value.id) &&
      typeof value.expiresAt === "number" &&
      value.expiresAt > Date.now() &&
      value.expiresAt <= Date.now() + RETENTION_MS
    )
      documentVisitor = value.id;
    else {
      documentVisitor = crypto.randomUUID();
      localStorage.setItem(
        "fx_local_visitor",
        JSON.stringify({ id: documentVisitor, expiresAt: Date.now() + RETENTION_MS }),
      );
    }
  } catch {
    documentVisitor = crypto.randomUUID();
  }
  return documentVisitor;
}
function accumulate(visit: Visit) {
  if (visit.visibleSince !== null) {
    const now = performance.now();
    visit.durationMs += Math.max(0, now - visit.visibleSince);
    visit.visibleSince = now;
  }
  const content = document.querySelector(".site-markdown");
  if (content && document.visibilityState === "visible") {
    const rect = content.getBoundingClientRect();
    if (rect.height > 0)
      visit.progress = Math.max(
        visit.progress,
        Math.min(
          100,
          Math.max(0, Math.floor(((window.innerHeight - rect.top) / rect.height) * 100)),
        ),
      );
  }
}
function snapshot(visit: Visit): AnalyticsEvent {
  accumulate(visit);
  return {
    pageViewId: visit.id,
    visitorId: visitorId(),
    path: visit.path,
    referrer: visit.referrer,
    durationMs: Math.floor(visit.durationMs),
    progress: visit.progress,
    visible: document.visibilityState === "visible",
  };
}
export function LocalAnalytics({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== "production" || !pathname) return undefined;
    const retries = new Set<number>();
    let stopped = false;
    async function send(input: AnalyticsEvent, attempt = 0): Promise<void> {
      const body = JSON.stringify(input);
      let delay = 1000 * 2 ** attempt;
      try {
        const response = await fetch("/api/public/analytics/events", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body,
          signal: AbortSignal.timeout(10_000),
        });
        if (response.status === 429)
          delay = Math.max(delay, (Number(response.headers.get("Retry-After")) || 60) * 1000);
        else if (response.status < 500) return;
      } catch {
        /* 下次快照或有限重试继续使用同一访问 ID。 */
      }
      if (attempt >= 2 || stopped) return;
      const timer = window.setTimeout(() => {
        retries.delete(timer);
        void send(input, attempt + 1);
      }, delay);
      retries.add(timer);
    }
    function flush() {
      if (!current) return;
      const body = JSON.stringify(snapshot(current));
      if (
        !navigator.sendBeacon(
          "/api/public/analytics/events",
          new Blob([body], { type: "application/json" }),
        )
      )
        void fetch("/api/public/analytics/events", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => undefined);
      current.visibleSince = null;
    }
    function start(force = false) {
      if (document.visibilityState !== "visible") return;
      if (
        !current ||
        current.path !== pathname ||
        force ||
        Date.now() - current.lastActivity >= SESSION_IDLE_MS
      ) {
        const referrer = current ? window.location.origin + current.path : document.referrer;
        if (current?.visibleSince !== null) flush();
        current = {
          id: crypto.randomUUID(),
          path: pathname,
          referrer,
          durationMs: 0,
          progress: 0,
          visibleSince: null,
          lastActivity: Date.now(),
        };
      }
      current.visibleSince ??= performance.now();
      current.lastActivity = Date.now();
      void send(snapshot(current));
    }
    function visibility() {
      if (document.visibilityState === "hidden") flush();
      else start();
    }
    function restore(event: PageTransitionEvent) {
      if (event.persisted) start(true);
    }
    function scroll() {
      if (current) accumulate(current);
    }
    start();
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!current || Date.now() - current.lastActivity >= SESSION_IDLE_MS) start();
      else {
        current.lastActivity = Date.now();
        void send(snapshot(current));
      }
    }, 30_000);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", flush);
    window.addEventListener("pageshow", restore);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      stopped = true;
      flush();
      window.clearInterval(interval);
      for (const timer of retries) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("pageshow", restore);
      window.removeEventListener("scroll", scroll);
    };
  }, [enabled, pathname]);
  return null;
}
