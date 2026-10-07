import "dotenv/config";
import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { cp, mkdtemp, rm, symlink } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { Client } from "pg";
import { z } from "zod";

import type { ReleaseLog } from "../lib/changelog/schema";
import type { PostDetail } from "../lib/posts/schema";
import type { SiteSettings } from "../lib/settings/schema";

import { serializeDocument, EMPTY_POST_CONTENT } from "../lib/posts/document";

const project = resolve(import.meta.dirname, "..");
const siteOrigin = "https://seo-integration.example";

function attribute(html: string, tagName: string, key: string, value: string, result: string) {
  for (const tag of html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "g"))) {
    const attributes = Object.fromEntries(
      [...tag[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]),
    );
    if (attributes[key] === value) return attributes[result]?.replaceAll("&amp;", "&");
  }
  return undefined;
}

const meta = (html: string, name: string) => attribute(html, "meta", "name", name, "content");
const og = (html: string, name: string) => attribute(html, "meta", "property", name, "content");
const canonical = (html: string) => attribute(html, "link", "rel", "canonical", "href");

function jsonLd(html: string) {
  return [
    ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].flatMap((match) => {
    const item = z.record(z.string(), z.unknown()).parse(JSON.parse(match[1]));
    return Array.isArray(item["@graph"])
      ? item["@graph"].map((node) => z.record(z.string(), z.unknown()).parse(node))
      : [item];
  });
}

async function availablePort() {
  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const address = listener.address();
  assert.ok(address && typeof address !== "string");
  const port = address.port;
  await new Promise<void>((resolveClose, reject) =>
    listener.close((error) => (error ? reject(error) : resolveClose())),
  );
  return port;
}

async function stopServer(server: ChildProcess) {
  if (!server.pid || server.exitCode !== null) return;
  const exited = once(server, "exit");
  // 只终止本测试以 detached 创建的进程组，包括 Next 的编译子进程。
  process.kill(-server.pid, "SIGTERM");
  const timer = setTimeout(() => {
    if (server.pid && server.exitCode === null) process.kill(-server.pid, "SIGKILL");
  }, 10_000);
  try {
    await exited;
  } finally {
    clearTimeout(timer);
  }
}

void test(
  "独立 PostgreSQL 与 HTTP：后台保存、文章生命周期和索引策略联动",
  { timeout: 180_000 },
  async () => {
    const base = new URL(process.env.DATABASE_URL!);
    assert.ok(
      ["127.0.0.1", "localhost", "[::1]"].includes(base.hostname),
      "集成测试只允许本地 PostgreSQL；不能在远程数据库创建测试库。",
    );
    const name = `fx_seo_test_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const testingUrl = new URL(base);
    testingUrl.pathname = `/${name}`;
    const admin = new Client({
      host: base.hostname,
      port: Number(base.port || 5432),
      user: "postgres",
      password: process.env.POSTGRES_ADMIN_PASSWORD,
      database: "postgres",
    });
    const previousDatabaseUrl = process.env.DATABASE_URL;
    let connected = false;
    let created = false;
    let workspace: string | undefined;
    let server: ChildProcess | undefined;
    let database: typeof import("../prisma/db") | undefined;
    let logs = "";
    try {
      await admin.connect();
      connected = true;
      const owner = decodeURIComponent(base.username).replaceAll('"', '""');
      await admin.query(`CREATE DATABASE "${name}" OWNER "${owner}"`);
      created = true;
      process.env.DATABASE_URL = testingUrl.toString();
      const migrated = spawnSync(process.execPath, ["--import", "tsx", "scripts/migrate.ts"], {
        cwd: project,
        env: process.env,
        encoding: "utf8",
        timeout: 30_000,
      });
      assert.equal(migrated.status, 0, `独立测试库迁移失败：${migrated.stdout}${migrated.stderr}`);
      database = await import("../prisma/db");
      const { hashPassword } = await import("../lib/auth/password");
      const password = "seo-integration-test-password";
      const passwordHash = await hashPassword(password);
      const now = new Date();
      await database.writeTransaction((tx) =>
        tx.orm.public.Admin.create({
          id: 1,
          username: "seo_test_admin",
          passwordHash,
          createdAt: now,
          updatedAt: now,
        }),
      );

      // 在副本运行 Next，防止自定义 distDir 自动修改项目 tsconfig 与生成文件。
      workspace = await mkdtemp(join(tmpdir(), "fx-seo-http-"));
      for (const path of [
        "app",
        "components",
        "lib",
        "prisma",
        "generated",
        "public",
        "package.json",
        "package-lock.json",
        "next.config.ts",
        "postcss.config.mjs",
        "tsconfig.json",
      ])
        await cp(join(project, path), join(workspace, path), { recursive: true });
      await symlink(join(project, "node_modules"), join(workspace, "node_modules"), "dir");
      const port = await availablePort();
      const serverOrigin = `http://127.0.0.1:${port}`;
      server = spawn(
        process.execPath,
        [
          join(project, "node_modules/next/dist/bin/next"),
          "dev",
          workspace,
          "--hostname",
          "127.0.0.1",
          "--port",
          String(port),
          "--webpack",
        ],
        {
          cwd: workspace,
          detached: true,
          stdio: ["ignore", "pipe", "pipe"],
          env: {
            ...process.env,
            NODE_ENV: "development",
            APP_ORIGIN: siteOrigin,
            NEXT_BUILD_DIR: `.next-seo-test-${name}`,
            NEXT_TELEMETRY_DISABLED: "1",
          },
        },
      );
      for (const output of [server.stdout, server.stderr])
        output?.on("data", (chunk: Buffer) => {
          logs = (logs + chunk.toString()).slice(-12_000);
        });
      let ready = false;
      for (let attempt = 0; attempt < 60; attempt++) {
        assert.equal(server.exitCode, null, `独立 Next 实例提前退出：${logs}`);
        try {
          const response = await fetch(`${serverOrigin}/login`, {
            redirect: "manual",
            signal: AbortSignal.timeout(5_000),
          });
          await response.text();
          if (response.status === 200) {
            ready = true;
            break;
          }
        } catch {
          /* 编译期间等待服务就绪。 */
        }
        await delay(500);
      }
      assert.ok(ready, `独立 Next 实例未就绪：${logs}`);
      const login = await fetch(`${serverOrigin}/api/login`, {
        method: "POST",
        redirect: "manual",
        headers: { Origin: siteOrigin, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: "seo_test_admin", password }),
      });
      assert.equal(login.status, 303);
      const cookie = login.headers.get("set-cookie")?.split(";")[0];
      assert.ok(cookie, "标准登录 API 应返回测试管理员会话 Cookie。");

      async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
        const options: RequestInit = {
          method,
          headers: { Cookie: cookie!, Origin: siteOrigin, "Content-Type": "application/json" },
        };
        if (body !== undefined) options.body = JSON.stringify(body);
        const response = await fetch(`${serverOrigin}/api/admin${path}`, options);
        const result: { data: T; error?: unknown } = await response.json();
        assert.ok(response.ok, `${method} ${path} 失败：${JSON.stringify(result.error)}`);
        return result.data;
      }
      async function html(path: string) {
        const response = await fetch(`${serverOrigin}${path}`, { redirect: "manual" });
        assert.equal(response.status, 200, `${path} 应成功响应：${logs}`);
        return response.text();
      }
      async function sitemap() {
        const response = await fetch(`${serverOrigin}/sitemap.xml`);
        assert.equal(response.status, 200);
        const xml = await response.text();
        return { xml, urls: [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]) };
      }

      const initial = await api<SiteSettings>("/settings");
      const {
        updatedAt: _updatedAt,
        localAnalyticsStartedAt: _analytics,
        ...settingsInput
      } = initial;
      let settings = await api<SiteSettings>("/settings", "PUT", {
        ...settingsInput,
        title: "SEO 独立测试站",
        authorName: "SEO 独立作者",
        seoDescription: "后台设置保存后显示的搜索描述。",
        ogImageUrl: "/avatar.avif",
        googleVerification: "google_test_token",
        bingVerification: "bing_test_token",
        baiduVerification: "baidu_test_token",
        postsPerPage: 1,
      });
      let homepage = await html("/");
      assert.match(homepage, /<title>SEO 独立测试站<\/title>/);
      assert.equal(meta(homepage, "description"), settings.seoDescription);
      assert.equal(og(homepage, "og:description"), settings.seoDescription);
      assert.equal(og(homepage, "og:image"), `${siteOrigin}/avatar.avif`);
      assert.equal(meta(homepage, "google-site-verification"), settings.googleVerification);
      assert.equal(meta(homepage, "msvalidate.01"), settings.bingVerification);
      assert.equal(meta(homepage, "baidu-site-verification"), settings.baiduVerification);
      assert.equal(new URL(canonical(homepage)!).href, `${siteOrigin}/`);
      assert.ok(jsonLd(homepage).some((item) => item["@type"] === "WebSite"));
      assert.ok(
        jsonLd(await html("/about")).some(
          (item) => item["@type"] === "Person" && item.name === settings.authorName,
        ),
      );

      const {
        updatedAt: _savedAt,
        localAnalyticsStartedAt: _savedAnalytics,
        ...savedInput
      } = settings;
      settings = await api<SiteSettings>("/settings", "PUT", {
        ...savedInput,
        title: "SEO 更新后的站名",
        authorName: "SEO 更新后的作者",
        seoDescription: "再次保存立即更新的搜索描述。",
        googleVerification: "",
      });
      homepage = await html("/");
      assert.match(homepage, /<title>SEO 更新后的站名<\/title>/);
      assert.equal(meta(homepage, "description"), settings.seoDescription);
      assert.equal(meta(homepage, "google-site-verification"), undefined);

      const category = await api<{ id: string }>("/categories", "POST", {
        name: "SEO 测试",
        color: "#123456",
      });
      const content = serializeDocument({
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "用于 SEO 的正文回退摘要。" }] },
        ],
      });
      const makePost = (slug: string, status: "published" | "draft" | "scheduled", summary = "") =>
        api<PostDetail>("/posts", "POST", {
          slug,
          title: `SEO 文章 ${slug}`,
          content,
          summary,
          categoryId: category.id,
          tagIds: [],
          status,
          scheduledFor:
            status === "scheduled" ? new Date(Date.now() + 86_400_000).toISOString() : null,
        });
      const first = await makePost("seo-first", "published", "后台填写的文章摘要。");
      await makePost("seo-second", "published");
      let draft = await makePost("seo-draft", "draft");
      await makePost("seo-scheduled", "scheduled");
      const blankDraft = await api<PostDetail>("/posts", "POST", {
        title: "",
        slug: "",
        categoryId: "",
        tagIds: [],
        content: EMPTY_POST_CONTENT,
        status: "draft",
        scheduledFor: null,
      });
      assert.equal(blankDraft.slug, null);
      assert.equal(blankDraft.category, null);
      assert.ok(!(await html("/posts")).includes("未命名草稿"));
      let release = await api<ReleaseLog>("/changelog", "POST", {
        version: "v-http-test",
        title: "HTTP日志公开验证",
        type: "feature",
        changes: ["原条目"],
      });
      assert.ok((await html("/changelog")).includes("HTTP日志公开验证"));
      const createdAt = release.createdAt;
      release = await api<ReleaseLog>(`/changelog/${release.id}`, "PUT", {
        version: release.version,
        title: "HTTP日志修改验证",
        type: "fix",
        changes: ["新条目"],
        revision: release.revision,
      });
      assert.equal(release.createdAt, createdAt);
      assert.ok((await html("/changelog")).includes("HTTP日志修改验证"));
      release = await api<ReleaseLog>(`/changelog/${release.id}/status`, "PUT", {
        status: "withdrawn",
        revision: release.revision,
      });
      assert.ok(!(await html("/changelog")).includes("HTTP日志修改验证"));
      release = await api<ReleaseLog>(`/changelog/${release.id}/status`, "PUT", {
        status: "published",
        revision: release.revision,
      });
      assert.equal(release.createdAt, createdAt);
      assert.ok((await html("/changelog")).includes("HTTP日志修改验证"));
      let map = await sitemap();
      for (const path of [
        "/",
        "/about",
        "/posts",
        "/categories",
        "/tags",
        "/changelog",
        "/friends-links",
      ]) {
        assert.ok(map.urls.includes(`${siteOrigin}${path}`), `sitemap 缺少 ${path}`);
      }
      assert.ok(map.urls.includes(`${siteOrigin}/posts/seo-first`));
      assert.ok(!map.urls.includes(`${siteOrigin}/posts/seo-draft`));
      assert.ok(!map.urls.includes(`${siteOrigin}/posts/seo-scheduled`));
      assert.match(map.xml, new RegExp(first.updatedAt.replaceAll(".", "\\.")));

      const article = await html("/posts/seo-first");
      assert.equal(meta(article, "description"), first.summary);
      assert.equal(og(article, "og:description"), first.summary);
      assert.equal(canonical(article), `${siteOrigin}/posts/seo-first`);
      const articleData = jsonLd(article).find((item) => item["@type"] === "BlogPosting");
      assert.ok(articleData);
      const author = z.object({ name: z.string() }).parse(articleData.author);
      assert.equal(author.name, settings.authorName);
      assert.equal(
        meta(await html("/posts/seo-second"), "description"),
        "用于 SEO 的正文回退摘要。",
      );

      for (const query of [
        "q=SEO",
        `categoryId=${category.id}`,
        `q=SEO&categoryId=${category.id}`,
      ]) {
        const filtered = await html(`/posts?${query}`);
        assert.match(meta(filtered, "robots") ?? "", /\bnoindex\b/);
        assert.match(meta(filtered, "robots") ?? "", /\bfollow\b/);
      }
      const paginated = await html("/posts?page=2&utm_source=seo-test");
      assert.equal(canonical(paginated), `${siteOrigin}/posts?page=2`);
      assert.doesNotMatch(meta(paginated, "robots") ?? "", /\bnoindex\b/);
      const attributed = await html("/posts?utm_source=seo-test");
      assert.equal(canonical(attributed), `${siteOrigin}/posts`);
      const firstPage = await fetch(`${serverOrigin}/posts?page=1&utm_source=seo-test`, {
        redirect: "manual",
      });
      assert.ok([307, 308].includes(firstPage.status));
      const normalized = new URL(firstPage.headers.get("location")!, serverOrigin);
      assert.equal(normalized.searchParams.get("page"), null);
      assert.equal(normalized.searchParams.get("utm_source"), "seo-test");

      const updatePost = (post: PostDetail, status: "published" | "draft") =>
        api<PostDetail>(`/posts/${post.id}`, "PUT", {
          title: post.title,
          slug: post.slug,
          content: post.content,
          summary: post.summary,
          categoryId: post.categoryId,
          tagIds: post.tags.map((tag) => tag.id),
          status,
          scheduledFor: null,
          version: post.version,
        });
      draft = await updatePost(draft, "published");
      map = await sitemap();
      assert.ok(
        map.urls.includes(`${siteOrigin}/posts/${draft.slug}`),
        "发布后 sitemap 应立即收录文章。",
      );
      await updatePost(first, "draft");
      map = await sitemap();
      assert.ok(
        !map.urls.includes(`${siteOrigin}/posts/${first.slug}`),
        "撤回后 sitemap 应立即移除文章。",
      );
      const withdrawn = await fetch(`${serverOrigin}/posts/${first.slug}`, { redirect: "manual" });
      assert.equal(withdrawn.status, 404, "撤回文章不应继续公开。");

      const robots = await fetch(`${serverOrigin}/robots.txt`);
      assert.equal(robots.status, 200);
      const rules = await robots.text();
      assert.match(rules, /Disallow: \/admin/);
      assert.match(rules, /Disallow: \/api/);
      assert.ok(rules.includes(`Sitemap: ${siteOrigin}/sitemap.xml`));
      assert.doesNotMatch(rules, /Disallow: \/login/);
      assert.match(meta(await html("/login"), "robots") ?? "", /\bnoindex\b/);
    } finally {
      if (server) await stopServer(server);
      if (database) await database.getDatabase().close();
      if (created) await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
      if (connected) await admin.end();
      if (workspace) await rm(workspace, { recursive: true, force: true });
      if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previousDatabaseUrl;
    }
  },
);
