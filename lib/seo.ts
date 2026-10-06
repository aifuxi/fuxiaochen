import "server-only";
import type { JSONContent } from "@tiptap/core";
import type { Metadata } from "next";

import type { PublicSettings } from "@/lib/settings/schema";

import { readDocument } from "@/lib/posts/document";
import { postExcerpt, textExcerpt } from "@/lib/posts/excerpt";
import { siteOrigin, siteUrl } from "@/lib/site-origin";

export { siteOrigin, siteUrl } from "@/lib/site-origin";

type SeoPost = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string | null;
  updatedAt: string;
  category: { name: string } | null;
  tags: { name: string }[];
};

export function siteDescription(settings: PublicSettings): string {
  return textExcerpt(
    settings.seoDescription ||
      settings.subtitle ||
      settings.aboutMe ||
      `${settings.title} 的个人博客。`,
    300,
  );
}

function absoluteImage(src: string) {
  return src.startsWith("/") ? siteUrl(src) : src;
}

function shareImage(settings: PublicSettings) {
  return absoluteImage(settings.ogImageUrl || "/og-default.png");
}

function firstImage(node: JSONContent, articleUrl: string): string | undefined {
  if (node.type === "image" && typeof node.attrs?.src === "string") {
    try {
      // 与正文浏览器解析一致，兼容相对路径；不把带凭据 URL 放进公开元数据。
      const url = new URL(node.attrs.src, articleUrl);
      if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password)
        return url.href;
    } catch {
      // 无法用于分享的图片不阻止正文阅读，继续寻找下一张。
    }
  }
  for (const child of node.content ?? []) {
    const image = firstImage(child, articleUrl);
    if (image) return image;
  }
  return undefined;
}

function bodyImage(post: SeoPost) {
  return firstImage(readDocument(post.content), siteUrl(`/posts/${encodeURIComponent(post.slug)}`));
}

function articleImage(settings: PublicSettings, post: SeoPost) {
  return bodyImage(post) || shareImage(settings);
}

export function pageMetadata(
  settings: PublicSettings,
  options: { title?: string; description?: string; path: string; robots?: Metadata["robots"] },
): Metadata {
  const description = options.description?.trim()
    ? textExcerpt(options.description, 300)
    : siteDescription(settings);
  const title = options.title ? `${options.title} · ${settings.title}` : settings.title;
  const url = siteUrl(options.path);
  const image = shareImage(settings);
  return {
    metadataBase: new URL(siteOrigin()),
    title: options.title ?? { absolute: settings.title },
    description,
    authors: [{ name: settings.authorName, url: siteUrl("/about") }],
    alternates: { canonical: url },
    robots: options.robots,
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: settings.title,
      title,
      description,
      url,
      images: [{ url: image, alt: settings.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, alt: settings.title }],
    },
  };
}

export function articleMetadata(settings: PublicSettings, post: SeoPost): Metadata {
  const metadata = pageMetadata(settings, {
    title: post.title,
    description: postExcerpt(post.summary, post.content) || post.title,
    path: `/posts/${encodeURIComponent(post.slug)}`,
  });
  const image = articleImage(settings, post);
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [siteUrl("/about")],
      section: post.category?.name,
      tags: post.tags.map((tag) => tag.name),
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      ...metadata.twitter,
      card: "summary_large_image",
      images: [{ url: image, alt: post.title }],
    },
  };
}

function person(settings: PublicSettings) {
  return {
    "@type": "Person",
    "@id": siteUrl("/about#person"),
    name: settings.authorName,
    url: siteUrl("/about"),
    description: settings.aboutMe || undefined,
    jobTitle: settings.authorRole || undefined,
    image: settings.avatarUrl ? absoluteImage(settings.avatarUrl) : undefined,
    sameAs: [
      ...new Set(
        settings.socials
          .filter((social) => social.enabled && social.icon !== "rss")
          .map((social) => social.url),
      ),
    ],
  };
}

export function siteJsonLd(settings: PublicSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": siteUrl("/#website"),
    name: settings.title,
    description: siteDescription(settings),
    url: siteUrl("/"),
    inLanguage: "zh-CN",
    author: person(settings),
  };
}

export function personJsonLd(settings: PublicSettings) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      person(settings),
      {
        "@type": "ProfilePage",
        "@id": siteUrl("/about#profile"),
        url: siteUrl("/about"),
        name: `关于 ${settings.authorName}`,
        mainEntity: { "@id": siteUrl("/about#person") },
      },
    ],
  };
}

export function articleJsonLd(settings: PublicSettings, post: SeoPost) {
  const url = siteUrl(`/posts/${encodeURIComponent(post.slug)}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        url,
        mainEntityOfPage: url,
        headline: post.title,
        description: postExcerpt(post.summary, post.content) || post.title,
        datePublished: post.publishedAt ?? undefined,
        dateModified: post.updatedAt,
        inLanguage: "zh-CN",
        author: person(settings),
        image: bodyImage(post),
        articleSection: post.category?.name,
        keywords: post.tags.map((tag) => tag.name),
        isPartOf: {
          "@type": "WebSite",
          "@id": siteUrl("/#website"),
          name: settings.title,
          url: siteUrl("/"),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首页", item: siteUrl("/") },
          { "@type": "ListItem", position: 2, name: "文章", item: siteUrl("/posts") },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
