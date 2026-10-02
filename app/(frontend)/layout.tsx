import type { Metadata } from "next";

import Link from "next/link";

import { SocialIcon } from "@/components/frontend/configured-image";
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
        <nav aria-label="社交账号" className="site-socials">
          {settings.socials.map((social) => (
            <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer">
              <SocialIcon account={social} />
              <span>{social.label}</span>
            </a>
          ))}
        </nav>
        <div className="site-filings">
          <span>{settings.authorName}</span>
          <Link href="/login">后台登录</Link>
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
      </footer>
      <SiteAnalytics googleId={settings.googleId} baiduId={settings.baiduId} />
    </div>
  );
}
