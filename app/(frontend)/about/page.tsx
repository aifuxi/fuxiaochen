import type { Metadata } from "next";

import { ExternalLink } from "lucide-react";

import { ConfiguredImage, SocialIcon } from "@/components/frontend/configured-image";
import { JsonLd } from "@/components/frontend/json-ld";
import { pageMetadata, personJsonLd } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return pageMetadata(settings, {
    title: "关于",
    description: settings.aboutMe || `了解 ${settings.authorName} 和 ${settings.title}。`,
    path: "/about",
  });
}
export default async function AboutPage() {
  const settings = await getPublicSettings();
  // 简介仍为普通文本，只按空行组织段落；段内换行由页面样式保留。
  const paragraphs = settings.aboutMe
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <main data-page-motion id="main-content" className="site-main site-about-page">
      <JsonLd data={personJsonLd(settings)} />
      <header className="site-page-heading">
        <h1>关于</h1>
      </header>
      <section className="site-about" aria-label="作者介绍">
        <div className="site-about-identity">
          <span className="site-about-avatar" aria-hidden="true">
            <ConfiguredImage src={settings.avatarUrl} size={56} profile />
          </span>
          <div>
            <h2>{settings.authorName}</h2>
            {settings.authorRole && <p className="site-about-role">{settings.authorRole}</p>}
          </div>
        </div>
        {paragraphs.length > 0 && (
          <div className="site-about-content">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </section>
      {settings.socials.length > 0 && (
        <nav className="site-socials site-about-socials" aria-label="联系博主">
          {settings.socials.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
              <SocialIcon account={s} />
              <span>{s.label}</span>
              <ExternalLink className="site-social-external" size={14} aria-hidden="true" />
              <span className="sr-only">在新窗口打开</span>
            </a>
          ))}
        </nav>
      )}
    </main>
  );
}
