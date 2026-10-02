"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  _hmt?: unknown[][];
  siteAnalyticsInitialized?: { google?: string; baidu?: string };
};
export function SiteAnalytics({ googleId, baiduId }: { googleId: string; baiduId: string }) {
  const pathname = usePathname();
  const last = useRef("");
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !pathname ||
      /^(\/admin(?:\/|$)|\/login(?:\/|$)|\/design-spec(?:\/|$))/.test(pathname)
    )
      return;
    const win = window as AnalyticsWindow;
    win.siteAnalyticsInitialized ??= {};
    if (googleId && win.siteAnalyticsInitialized.google !== googleId) {
      win.dataLayer ??= [];
      win.gtag = function (..._args: unknown[]) {
        win.dataLayer!.push(arguments);
      };
      win.gtag("js", new Date());
      win.gtag("config", googleId, { send_page_view: false });
      win.siteAnalyticsInitialized.google = googleId;
    }
    if (baiduId && win.siteAnalyticsInitialized.baidu !== baiduId) {
      win["_hmt"] ??= [];
      win["_hmt"].push(["_setAccount", baiduId], ["_setAutoPageview", false]);
      win.siteAnalyticsInitialized.baidu = baiduId;
    }
    const key = `${pathname}|${googleId}|${baiduId}`;
    if (last.current === key) return;
    last.current = key;
    if (googleId)
      win.gtag?.("event", "page_view", {
        page_location: `${window.location.origin}${pathname}`,
        page_title: document.title,
        page_referrer: document.referrer
          ? new URL(document.referrer).origin + new URL(document.referrer).pathname
          : "",
        send_to: googleId,
      });
    if (baiduId) win["_hmt"]?.push(["_trackPageview", pathname]);
  }, [pathname, googleId, baiduId]);
  if (process.env.NODE_ENV !== "production") return null;
  // 初始化队列在客户端 effect 中完成；onLoad 前不会发送重复 PV。
  return (
    <>
      {googleId && (
        <Script
          id="site-google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleId)}`}
          strategy="afterInteractive"
        />
      )}
      {baiduId && (
        <Script
          id="site-baidu-analytics"
          src={`https://hm.baidu.com/hm.js?${encodeURIComponent(baiduId)}`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
