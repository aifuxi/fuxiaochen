import "dotenv/config";
import Sqlite from "better-sqlite3";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { cp, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";

import type { ReleaseLog } from "../lib/changelog/schema";
import type { PostDetail } from "../lib/posts/schema";
import type { SiteSettings } from "../lib/settings/schema";

import { syncAdminAccount } from "../lib/auth/accounts";
import { migrateDatabase } from "../lib/database/migrations";
import { admin as adminTable } from "../lib/database/schema";
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
  "独立 SQLite 与 HTTP：后台保存、文章生命周期和索引策略联动",
  { timeout: 180_000 },
  async () => {
    const name = `fx_seo_test_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const previousDatabasePath = process.env.DATABASE_PATH;
    let workspace: string | undefined;
    let server: ChildProcess | undefined;
    let database: typeof import("../lib/database") | undefined;
    let logs = "";
    try {
      // 文件和 Next 工作区都位于临时目录，不连接 PostgreSQL 或已有 SQLite。
      workspace = await mkdtemp(join(tmpdir(), "fx-seo-http-"));
      process.env.DATABASE_PATH = join(workspace, "independent.sqlite");
      await writeFile(process.env.DATABASE_PATH, "", { flag: "wx", mode: 0o600 });
      const client = new Sqlite(process.env.DATABASE_PATH);
      try {
        client.pragma("foreign_keys = ON");
        migrateDatabase(client);
      } finally {
        client.close();
      }
      database = await import("../lib/database");
      const { hashPassword } = await import("../lib/auth/password");
      const password = "seo-integration-test-password";
      const passwordHash = await hashPassword(password);
      const now = new Date();
      database.writeTransaction((tx) =>
        tx
          .insert(adminTable)
          .values({
            id: 1,
            username: "seo_test_admin",
            passwordHash,
            createdAt: now,
            updatedAt: now,
          })
          .run(),
      );

      database.writeTransaction(syncAdminAccount);

      // 在副本运行 Next，防止自定义 distDir 自动修改项目 tsconfig 与生成文件。
      for (const path of [
        "app",
        "components",
        "lib",
        "drizzle",
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
            BETTER_AUTH_SECRET: "seo-test-only-better-auth-secret-32-chars",
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
      assert.equal(login.headers.get("location"), "/admin/posts");
      const cookie = login.headers.get("set-cookie")?.split(";")[0];
      assert.ok(cookie, "标准登录 API 应返回测试管理员会话 Cookie。");

      // 旧地址和已登录的登录页统一进入文章管理，匿名访问继续受鉴权保护。
      for (const path of ["/admin", "/login"]) {
        const response: Response = await fetch(`${serverOrigin}${path}`, {
          redirect: "manual",
          headers: { Cookie: cookie },
        });
        assert.equal(response.status, 307);
        assert.equal(response.headers.get("location"), "/admin/posts");
      }
      for (const path of ["/admin", "/admin/posts"]) {
        const response: Response = await fetch(`${serverOrigin}${path}`, { redirect: "manual" });
        assert.equal(response.status, 307);
        assert.equal(response.headers.get("location"), "/login");
      }

      async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
        const options: RequestInit = {
          method,
          headers: { Cookie: cookie!, Origin: siteOrigin, "Content-Type": "application/json" },
        };
        if (body !== undefined) options.body = JSON.stringify(body);
        const response: Response = await fetch(`${serverOrigin}/api/admin${path}`, options);
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
      const { updatedAt: _updatedAt, ...settingsInput } = initial;
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

      const { updatedAt: _savedAt, ...savedInput } = settings;
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
      const testTag = await api<{ id: string }>("/tags", "POST", { name: "SEO 标签" });
      const content = serializeDocument({
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "用于 SEO 的正文回退摘要。" }] },
        ],
      });
      const makePost = (slug: string, status: "published" | "draft", summary = "") =>
        api<PostDetail>("/posts", "POST", {
          slug,
          title: `SEO 文章 ${slug}`,
          content,
          summary,
          categoryId: category.id,
          tagIds: [testTag.id],
          status,
        });
      const first = await makePost("seo-first", "published", "后台填写的文章摘要。");
      assert.ok(!Object.hasOwn(first, "scheduledFor"));
      for (const [path, method, body, expected] of [
        ["/posts?status=scheduled", "GET", undefined, 400],
        ["/posts", "POST", { ...first, content, tagIds: [], status: "scheduled" }, 400],
        [`/posts/${first.id}`, "PUT", { ...first, content, tagIds: [], status: "scheduled" }, 400],
        ["/operations/publish-due", "POST", {}, 404],
      ] as const) {
        const response: Response = await fetch(`${serverOrigin}/api/admin${path}`, {
          method,
          headers: { Cookie: cookie, Origin: siteOrigin, "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        assert.equal(response.status, expected, `${method} ${path}`);
      }
      await makePost("seo-second", "published");
      let draft = await makePost("seo-draft", "draft");
      const blankDraft = await api<PostDetail>("/posts", "POST", {
        title: "",
        slug: "",
        categoryId: "",
        tagIds: [],
        content: EMPTY_POST_CONTENT,
        status: "draft",
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
      for (const path of ["/", "/about", "/posts", "/changelog", "/friends-links"]) {
        assert.ok(map.urls.includes(`${siteOrigin}${path}`), `sitemap 缺少 ${path}`);
      }
      for (const path of ["/categories", "/tags"])
        assert.ok(!map.urls.includes(`${siteOrigin}${path}`), `sitemap 不应收录旧栏目 ${path}`);
      assert.ok(map.urls.includes(`${siteOrigin}/posts/seo-first`));
      assert.ok(!map.urls.includes(`${siteOrigin}/posts/seo-draft`));
      assert.match(map.xml, new RegExp(first.updatedAt.replaceAll(".", "\\.")));

      // 验证真实 HTTP 迁移，而非只检查 redirects 配置；旧链接不能丢失筛选和追踪信息。
      for (const path of ["/categories", "/tags"]) {
        for (const query of [
          "",
          "?" +
            new URLSearchParams({
              q: "SEO 测试",
              categoryId: category.id,
              tagId: testTag.id,
              page: "2",
              utm_source: "旧栏目",
            }) +
            "&utm_source=repeat",
        ]) {
          const response = await fetch(`${serverOrigin}${path}${query}`, {
            redirect: "manual",
          });
          assert.equal(response.status, 308, `${path}${query} 应永久重定向`);
          const location = response.headers.get("location");
          assert.ok(location, "永久重定向应提供 Location");
          const destination = new URL(location, serverOrigin);
          assert.equal(destination.origin, serverOrigin);
          assert.equal(destination.pathname, "/posts");
          const original = new URL(`${path}${query}`, serverOrigin);
          assert.deepEqual([...destination.searchParams], [...original.searchParams]);
        }
      }

      const article = await html("/posts/seo-first");
      assert.equal(meta(article, "description"), first.summary);
      assert.equal(og(article, "og:description"), first.summary);
      assert.equal(canonical(article), `${siteOrigin}/posts/seo-first`);
      const articleData = jsonLd(article).find((item) => item["@type"] === "BlogPosting");
      assert.ok(articleData);
      const author = z.object({ name: z.string() }).parse(articleData.author);
      assert.equal(author.name, settings.authorName);
      // 阅读返回上下文只能改变返回入口，不能污染文章的搜索与分享地址。
      const returnPath = `/posts?${new URLSearchParams({
        q: "SEO 测试",
        categoryId: category.id,
        tagId: testTag.id,
        page: "2",
      })}`;
      const fromList = await html(
        `/posts/seo-first?${new URLSearchParams({ returnTo: returnPath })}`,
      );
      assert.equal(canonical(fromList), canonical(article));
      assert.equal(og(fromList, "og:url"), og(article, "og:url"));
      assert.deepEqual(jsonLd(fromList), jsonLd(article));
      assert.ok(fromList.includes(`href="${returnPath.replaceAll("&", "&amp;")}"`));
      assert.equal(
        meta(await html("/posts/seo-second"), "description"),
        "用于 SEO 的正文回退摘要。",
      );

      for (const query of [
        "q=SEO",
        `categoryId=${category.id}`,
        `tagId=${testTag.id}`,
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
      database?.closeDatabase();
      if (workspace) await rm(workspace, { recursive: true, force: true });
      if (previousDatabasePath === undefined) delete process.env.DATABASE_PATH;
      else process.env.DATABASE_PATH = previousDatabasePath;
    }
  },
);
