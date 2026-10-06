import type { Metadata } from "next";

import { ArrowRight, BookOpen, FolderOpen, History, Tags, UserRound } from "lucide-react";
import Link from "next/link";

import { ConfiguredImage } from "@/components/frontend/configured-image";
import { JsonLd } from "@/components/frontend/json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardStage } from "@/components/ui/card";
import { pageMetadata, siteJsonLd } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";

const portals = [
  { href: "/posts", label: "文章", position: "posts", icon: BookOpen },
  { href: "/tags", label: "标签", position: "tags", icon: Tags },
  { href: "/categories", label: "分类", position: "categories", icon: FolderOpen },
  { href: "/changelog", label: "日志", position: "changelog", icon: History },
  { href: "/about", label: "关于", position: "about", icon: UserRound },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return { ...pageMetadata(settings, { path: "/" }), title: { absolute: settings.title } };
}

export default async function HomePage() {
  const settings = await getPublicSettings();
  return (
    <main id="main-content" className="site-main site-home">
      <JsonLd data={siteJsonLd(settings)} />
      <nav className="site-home-portals" aria-label="探索栏目">
        {portals.map(({ href, label, position, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className="site-home-portal"
            data-position={position}
          >
            <Card className="site-home-portal-card">
              <CardStage className="site-home-portal-stage">
                <Icon
                  className="site-home-portal-icon"
                  size={40}
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </CardStage>
            </Card>
            <span className="site-home-portal-label">
              <span className="site-home-portal-name">{label}</span>
              <ArrowRight className="site-home-portal-arrow" size={14} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </nav>
      <div className="site-home-intro">
        <h1 className="ds-display">{settings.title}</h1>
        {settings.subtitle && <p className="site-home-description">{settings.subtitle}</p>}
        <Button
          render={<Link href="/posts" />}
          nativeButton={false}
          variant="primary"
          size="sm"
          className="site-home-cta"
        >
          阅读文章
        </Button>
        <div className="site-profile">
          <ConfiguredImage src={settings.avatarUrl} size={56} profile />
          <div>
            <p className="site-profile-name">{settings.authorName}</p>
            {settings.authorRole && <p>{settings.authorRole}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
