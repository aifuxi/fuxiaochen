import type { Metadata } from "next";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ArticleListItem } from "@/components/frontend/article-list-item";
import { ConfiguredImage } from "@/components/frontend/configured-image";
import { JsonLd } from "@/components/frontend/json-ld";
import { Button } from "@/components/ui/button";
import { getRecentPublicPosts } from "@/lib/public/service";
import { pageMetadata, siteJsonLd } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";
import writingHero from "@/public/images/writing-hero.webp";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return { ...pageMetadata(settings, { path: "/" }), title: { absolute: settings.title } };
}

export default async function HomePage() {
  const [settings, recentPosts] = await Promise.all([getPublicSettings(), getRecentPublicPosts()]);
  // 首页只用首段摘要引导阅读，完整个人介绍继续由关于页展示。
  const introduction =
    settings.aboutMe
      .trim()
      .split(/\r?\n\s*\r?\n/)[0]
      ?.replace(/\s+/g, " ") ?? "";
  const characters = Array.from(introduction);
  const description =
    characters.length > 72 ? characters.slice(0, 72).join("") + "…" : introduction;
  return (
    <main data-page-motion id="main-content" className="site-main site-home">
      <JsonLd data={siteJsonLd(settings)} />
      <section className="site-home-hero" aria-labelledby="home-title">
        <div className="site-home-intro">
          <div className="site-profile">
            <ConfiguredImage src={settings.avatarUrl} size={48} profile />
            <div>
              <p className="site-profile-name">{settings.authorName}</p>
              {settings.authorRole && <p>{settings.authorRole}</p>}
            </div>
          </div>
          <h1 id="home-title" className="ds-display" title={settings.subtitle || settings.title}>
            {settings.subtitle || settings.title}
          </h1>
          {description && <p className="site-home-description">{description}</p>}
          <Button
            render={<Link href="/posts" />}
            nativeButton={false}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实链接，保留链接语义。
            role="link"
            variant="primary"
            className="site-home-cta"
          >
            阅读文章 <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
        <div className="site-home-visual">
          <Image
            src={writingHero}
            alt="冷灰桌面上的笔记本、蓝色铅笔与键盘"
            preload
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1080px) 46vw, 470px"
          />
        </div>
      </section>
      <section className="site-home-recent" aria-labelledby="recent-heading">
        <h2 id="recent-heading">近期文章</h2>
        {recentPosts.length ? (
          <div className="site-post-list">
            {recentPosts.map((post) => (
              <ArticleListItem key={post.id} post={post} compact />
            ))}
          </div>
        ) : (
          <p className="site-empty">还没有发布文章，之后再来看看。</p>
        )}
      </section>
    </main>
  );
}
