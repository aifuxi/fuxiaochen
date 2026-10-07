import type { Metadata } from "next";

import Link from "next/link";

import { LocalAnalytics } from "@/components/frontend/local-analytics";
import { SiteAnalytics } from "@/components/frontend/site-analytics";
import { SiteHeader } from "@/components/frontend/site-header";
import { siteDescription } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";

import "./site.css";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: { default: settings.title, template: `%s · ${settings.title}` },
    description: siteDescription(settings),
    authors: [{ name: settings.authorName }],
    verification: {
      google: settings.googleVerification || undefined,
      other: {
        ...(settings.bingVerification ? { "msvalidate.01": settings.bingVerification } : {}),
        ...(settings.baiduVerification
          ? { "baidu-site-verification": settings.baiduVerification }
          : {}),
      },
    },
  };
}
export default async function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSettings();
  return (
    <div className="site-layout">
      <a className="site-skip-link" href="#main-content">
        跳转到正文
      </a>
      <SiteHeader title={settings.title} />
      {children}
      <footer className="site-footer">
        <div className="site-filings">
          <span>{settings.authorName}</span>
          {settings.icpText && (
            <a href={settings.icpUrl} target="_blank" rel="noopener noreferrer">
              {settings.icpText}
            </a>
          )}
          {settings.policeText && (
            <a href={settings.policeUrl} target="_blank" rel="noopener noreferrer">
              {settings.policeText}
            </a>
          )}
        </div>
        <Link href="/login" className="site-footer-login">
          后台登录
        </Link>
      </footer>
      <LocalAnalytics enabled={settings.localAnalyticsEnabled} />
      <SiteAnalytics googleId={settings.googleId} baiduId={settings.baiduId} />
    </div>
  );
}
