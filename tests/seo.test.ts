import assert from "node:assert/strict";
import { test } from "node:test";

import { serializeDocument } from "../lib/posts/document";
import { postExcerpt } from "../lib/posts/excerpt";
import {
  normalizedQueryPath,
  publicPostParams,
  publicPostQuerySchema,
  queryNeedsRedirect,
  queryPath,
} from "../lib/public/schema";
import {
  articleJsonLd,
  articleMetadata,
  pageMetadata,
  serializeJsonLd,
  siteDescription,
  siteJsonLd,
} from "../lib/seo";
import { defaultSettings } from "../lib/settings/schema";
import { siteOrigin, siteUrl } from "../lib/site-origin";

const content = (text: string) =>
  serializeDocument({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });
const settings = {
  ...defaultSettings,
  title: "测试博客",
  authorName: "测试作者",
  seoDescription: "后台配置的搜索描述。",
  ogImageUrl: "/avatar.avif",
};
const post = {
  slug: "seo-test",
  title: "文章标题",
  summary: "人工文章摘要。",
  content: content("正文的回退描述。"),
  publishedAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-05T00:00:00.000Z",
  category: { name: "开发" },
  tags: [{ name: "SEO" }],
};

function withOrigin<T>(origin: string, work: () => T): T {
  const previous = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = origin;
  try {
    return work();
  } finally {
    if (previous === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = previous;
  }
}

void test("摘要优先采用人工输入，仅正文回退按 Unicode 字符截取", () => {
  assert.equal(postExcerpt("  人工\n\t摘要  ", content("不应被采用的正文")), "人工 摘要");
  const manual = "人工摘要".repeat(40);
  assert.equal(postExcerpt(manual, content("正文"), 5), manual);
  assert.equal(postExcerpt(" \t ", content("  第一段\n\t第二段  ")), "第一段 第二段");
  assert.equal(postExcerpt("", content("甲😀乙😀丙"), 4), "甲😀乙😀…");
  assert.equal(postExcerpt("", content("甲😀乙😀"), 4), "甲😀乙😀");
});

void test("站点描述采用专用设置，并能回退到现有资料", () => {
  assert.equal(siteDescription(settings), settings.seoDescription);
  assert.equal(siteDescription({ ...settings, seoDescription: "" }), settings.subtitle);
  assert.equal(
    siteDescription({ ...settings, seoDescription: "", subtitle: "" }),
    settings.aboutMe,
  );
});

void test("站点 URL 使用运行时 origin，并拒绝跨站和路径型配置", () => {
  withOrigin("https://seo.example", () => {
    assert.equal(siteOrigin(), "https://seo.example");
    assert.equal(siteUrl("/posts?page=2"), "https://seo.example/posts?page=2");
    for (const path of [
      "//foreign.example/posts",
      "https://foreign.example",
      "/\\foreign.example",
      "/\t/other.example.com/img.png",
    ]) {
      assert.throws(() => siteUrl(path));
    }
  });
  withOrigin("https://seo.example/path", () => assert.throws(() => siteOrigin()));
  withOrigin("https://seo.example/", () => assert.throws(() => siteOrigin()));
  withOrigin("https://updated.example", () =>
    assert.equal(siteUrl("/about"), "https://updated.example/about"),
  );
});

void test("页面和文章共享后台作者、分享图与 canonical，文章采用自己的摘要", () => {
  withOrigin("https://seo.example", () => {
    const page = pageMetadata(settings, { path: "/posts", title: "文章" });
    assert.equal(page.description, settings.seoDescription);
    assert.equal(page.alternates?.canonical, "https://seo.example/posts");
    assert.deepEqual(page.authors, [
      { name: settings.authorName, url: "https://seo.example/about" },
    ]);
    assert.deepEqual(page.openGraph?.images, [
      { url: "https://seo.example/avatar.avif", alt: settings.title },
    ]);
    const article = articleMetadata(settings, post);
    assert.equal(article.description, post.summary);
    assert.equal(article.openGraph?.description, post.summary);
    assert.equal(article.alternates?.canonical, "https://seo.example/posts/seo-test");
    assert.deepEqual(article.authors, page.authors);
    assert.equal(
      articleMetadata(settings, { ...post, summary: "" }).description,
      "正文的回退描述。",
    );
    const defaults = pageMetadata({ ...settings, ogImageUrl: "" }, { path: "/" });
    assert.deepEqual(defaults.openGraph?.images, [
      { url: "https://seo.example/og-default.png", alt: settings.title },
    ]);
  });
});

void test("文章分享图优先取正文图片，结构化资料沿用实际作者与时间", () => {
  withOrigin("https://seo.example", () => {
    const illustrated = {
      ...post,
      content: serializeDocument({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "image",
                attrs: { src: "https://images.example/article.png", alt: "文章图片" },
              },
              { type: "text", text: "文章内容" },
            ],
          },
        ],
      }),
    };
    assert.deepEqual(articleMetadata(settings, illustrated).openGraph?.images, [
      { url: "https://images.example/article.png", alt: post.title },
    ]);
    const article = articleJsonLd(settings, illustrated)["@graph"][0];
    assert.equal(article["@type"], "BlogPosting");
    assert.equal(article.datePublished, post.publishedAt);
    assert.equal(article.dateModified, post.updatedAt);
    assert.equal(article.author?.name, settings.authorName);
    assert.equal(article.image, "https://images.example/article.png");
    assert.equal(siteJsonLd(settings).name, settings.title);
  });
});

void test("正文分享图按文章 URL 解析相对地址，并跳过携带凭据的图片", () => {
  withOrigin("https://seo.example", () => {
    const illustrated = (...sources: string[]) => ({
      ...post,
      content: serializeDocument({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: sources.map((src) => ({ type: "image", attrs: { src } })),
          },
        ],
      }),
    });
    for (const [source, expected] of [
      ["//cdn.example/article.png", "https://cdn.example/article.png"],
      ["article.png", "https://seo.example/posts/article.png"],
      ["../article.png", "https://seo.example/article.png"],
    ]) {
      const article = illustrated(source);
      assert.deepEqual(
        articleMetadata(settings, article).openGraph?.images,
        [{ url: expected, alt: post.title }],
        source,
      );
      assert.equal(articleJsonLd(settings, article)["@graph"][0].image, expected, source);
    }
    const safe = illustrated("https://user:secret@cdn.example/private.png", "/public.png");
    assert.deepEqual(articleMetadata(settings, safe).openGraph?.images, [
      { url: "https://seo.example/public.png", alt: post.title },
    ]);
    assert.equal(
      articleJsonLd(settings, safe)["@graph"][0].image,
      "https://seo.example/public.png",
    );
  });
});

void test("无正文图片时分享卡采用站点默认图，BlogPosting 不声明文章图片", () => {
  withOrigin("https://seo.example", () => {
    const image = [{ url: "https://seo.example/og-default.png", alt: post.title }];
    const metadata = articleMetadata({ ...settings, ogImageUrl: "" }, post);
    assert.deepEqual(metadata.openGraph?.images, image);
    assert.deepEqual(metadata.twitter?.images, image);
    assert.equal(articleJsonLd(settings, post)["@graph"][0].image, undefined);
  });
});

void test("JSON-LD 保留原始数据但不能提前关闭 script 元素", () => {
  const data = {
    name: '</script><script>alert("SEO")</script>',
    description: "中文 < 标签 & 文本",
  };
  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<"));
  assert.ok(!serialized.includes("</script>"));
  assert.deepEqual(JSON.parse(serialized), data);
});

void test("查询规范化保留追踪参数，canonical 只采用业务条件和实际页码", () => {
  const query = publicPostQuerySchema.parse({ q: "  SEO  ", page: "2" });
  const normalized = publicPostParams(query);
  assert.equal(queryPath("/posts", normalized), "/posts?q=SEO&page=2");
  assert.equal(
    queryNeedsRedirect({ q: "SEO", page: "2", utm_source: "newsletter" }, normalized),
    false,
  );
  assert.equal(queryNeedsRedirect({ q: "  SEO  ", page: "2" }, normalized), true);
  const firstPage = publicPostParams(publicPostQuerySchema.parse({ page: "1" }));
  assert.equal(queryNeedsRedirect({ page: "1", utm_source: ["a", "b"] }, firstPage), true);
  assert.equal(
    normalizedQueryPath("/posts", { page: "1", utm_source: ["a", "b"] }, firstPage),
    "/posts?utm_source=a&utm_source=b",
  );
  assert.equal(queryPath("/posts", firstPage), "/posts");
  assert.equal(queryPath("/posts", publicPostParams(query, 1)), "/posts?q=SEO");
});
