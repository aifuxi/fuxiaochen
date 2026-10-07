import type { Metadata } from "next";

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
  return (
    <main data-page-motion id="main-content" className="site-main">
      <JsonLd data={personJsonLd(settings)} />
      <header className="site-page-heading">
        <h1>关于</h1>
      </header>
      <section className="site-about">
        <ConfiguredImage src={settings.avatarUrl} size={56} profile />
        <h2>{settings.authorName}</h2>
        <p className="site-eyebrow">{settings.authorRole}</p>
        <p className="site-about-content">{settings.aboutMe}</p>
      </section>
      {settings.socials.length > 0 && (
        <nav className="site-socials site-about-socials" aria-label="联系博主">
          {settings.socials.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
              <SocialIcon account={s} />
              <span>{s.label}</span>
            </a>
          ))}
        </nav>
      )}
    </main>
  );
}
