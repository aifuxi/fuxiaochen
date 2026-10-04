import type { Metadata } from "next";

import Link from "next/link";

import { SocialIcon } from "@/components/frontend/configured-image";
import { LocalAnalytics } from "@/components/frontend/local-analytics";
import { SiteAnalytics } from "@/components/frontend/site-analytics";
import { SiteHeader } from "@/components/frontend/site-header";
import { getPublicSettings } from "@/lib/settings/service";

import "./site.css";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: { default: settings.title, template: `%s · ${settings.title}` },
    description: settings.subtitle || settings.aboutMe,
    authors: [{ name: settings.authorName }],
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
        <div className="site-footer-main" data-has-socials={settings.socials.length > 0}>
          <div className="site-footer-brand">
            <Link href="/" className="site-footer-name">
              {settings.title}
            </Link>
            {settings.subtitle && <p className="site-footer-description">{settings.subtitle}</p>}
          </div>
          <nav aria-labelledby="site-footer-navigation" className="site-footer-group">
            <h2 id="site-footer-navigation" className="site-footer-heading">
              探索
            </h2>
            <ul className="site-footer-links">
              <li>
                <Link href="/posts">文章</Link>
              </li>
              <li>
                <Link href="/friends-links">友链</Link>
              </li>
              <li>
                <Link href="/about">关于</Link>
              </li>
            </ul>
          </nav>
          {settings.socials.length > 0 && (
            <nav aria-labelledby="site-footer-socials" className="site-footer-group">
              <h2 id="site-footer-socials" className="site-footer-heading">
                社交账号
              </h2>
              <ul className="site-footer-links site-socials">
                {settings.socials.map((social) => (
                  <li key={social.id}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                      <SocialIcon account={social} />
                      <span>{social.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        <div className="site-footer-bottom">
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
        </div>
      </footer>
      <LocalAnalytics enabled={settings.localAnalyticsEnabled} />
      <SiteAnalytics googleId={settings.googleId} baiduId={settings.baiduId} />
    </div>
  );
}
