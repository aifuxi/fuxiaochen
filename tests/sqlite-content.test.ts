// 按 Next 当前版本初始化真实请求上下文；测试只使用临时 SQLite 文件。
import "next/dist/server/node-environment";
import Sqlite from "better-sqlite3";
import { eq } from "drizzle-orm";
import { workAsyncStorage } from "next/dist/server/app-render/work-async-storage.external";
import { workUnitAsyncStorage } from "next/dist/server/app-render/work-unit-async-storage.external";
import { createRequestStore } from "next/dist/server/async-storage/request-store";
import { createWorkStore } from "next/dist/server/async-storage/work-store";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import sitemap from "../app/sitemap";
import { syncAdminAccount } from "../lib/auth/accounts";
import { hashPassword } from "../lib/auth/password";
import { logout } from "../lib/auth/service";
import { releaseQuerySchema } from "../lib/changelog/schema";
import { createRelease, getRelease, listReleases, updateRelease } from "../lib/changelog/service";
import { closeDatabase, getDatabase, writeTransaction } from "../lib/database";
import { migrateDatabase } from "../lib/database/migrations";
import { admin, friendLink } from "../lib/database/schema";
import { serializeDocument, EMPTY_POST_CONTENT } from "../lib/posts/document";
import {
  featuredPostSchema,
  postQuerySchema,
  postSchema,
  updatePostSchema,
} from "../lib/posts/schema";
import {
  createPost,
  deletePost,
  getPost,
  getPostSummary,
  listPosts,
  updatePost,
  updatePostFeatured,
} from "../lib/posts/service";
import {
  getPublicPost,
  getPublicTaxonomies,
  listPublicChangelog,
  listPublicFriends,
  listPublicPosts,
} from "../lib/public/service";
import { getPublicSettings, getSettings, saveSettings } from "../lib/settings/service";
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  listCategories,
  listTags,
  updateCategory,
  type TaxonomyActor,
} from "../lib/taxonomy/service";
import { loginToken as login } from "./helpers/sqlite";

let directory: string;
let actor: TaxonomyActor;
let previousPath: string | undefined;
let previousOrigin: string | undefined;
const password = "sqlite-content-test-password";
const body = (text: string) =>
  serializeDocument({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });

// connection() 在与生产相同的动态请求作用域运行，数据库、鉴权和查询不做 Mock。
function request<T>(work: () => T): T {
  const workStore = createWorkStore({
    page: "/sqlite-content-test/page",
    buildId: "sqlite-content-test",
    deploymentId: "sqlite-content-test",
    previouslyRevalidatedTags: [],
    renderOpts: {
      supportsDynamicResponse: true,
      cacheComponents: false,
      validationLevel: "warning",
      cacheLifeProfiles: { default: { stale: 0, revalidate: 0, expire: 60 } },
      staticPageGenerationTimeout: 60,
      experimental: { isRoutePPREnabled: false, authInterrupts: false, useCacheTimeout: 60 },
      waitUntil: undefined,
      onClose: () => {},
      onAfterTaskError: undefined,
    },
  });
  const requestStore = createRequestStore({
    phase: "render",
    headers: new Headers(),
    onUpdateCookies: undefined,
    url: { pathname: "/sqlite-content-test", search: "" },
    rootParams: {},
    implicitTags: { tags: [], expirationsByCacheKind: new Map() },
    resumeDataCache: null,
    previewProps: undefined,
    isHmrRefresh: false,
    serverComponentsHmrCache: undefined,
    hmrRefreshHash: undefined,
    fallbackParams: null,
  });
  return workAsyncStorage.run(workStore, () => workUnitAsyncStorage.run(requestStore, work));
}

beforeEach(async () => {
  previousPath = process.env.DATABASE_PATH;
  previousOrigin = process.env.APP_ORIGIN;
  process.env.BETTER_AUTH_SECRET = "sqlite-test-only-better-auth-secret-32-chars";
  process.env.APP_ORIGIN = "https://sqlite-content.example";
  directory = await mkdtemp(join(tmpdir(), "fx-sqlite-content-"));
  process.env.DATABASE_PATH = join(directory, "test.sqlite");
  const client = new Sqlite(process.env.DATABASE_PATH);
  try {
    client.pragma("foreign_keys = ON");
    migrateDatabase(client);
  } finally {
    client.close();
  }
  const now = new Date();
  const passwordHash = await hashPassword(password);
  writeTransaction((tx) =>
    tx
      .insert(admin)
      .values({
        id: 1,
        username: "content_test_admin",
        passwordHash,
        createdAt: now,
        updatedAt: now,
      })
      .run(),
  );
  writeTransaction(syncAdminAccount);
  const sessionToken = await login({ username: "content_test_admin", password }, undefined);
  assert.ok(sessionToken);
  actor = { adminId: 1, sessionToken };
});
afterEach(async () => {
  closeDatabase();
  if (previousPath === undefined) delete process.env.DATABASE_PATH;
  else process.env.DATABASE_PATH = previousPath;
  if (previousOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = previousOrigin;
  await rm(directory, { recursive: true, force: true });
});

async function published(title: string, slug: string, content = body(title)) {
  const category = await createCategory({ name: `分类 ${slug}`, color: "#123456" }, actor);
  const tag = await createTag({ name: `标签 ${slug}` }, actor);
  const row = await createPost(
    postSchema.parse({
      title,
      slug,
      content,
      categoryId: category.id,
      tagIds: [tag.id],
      status: "published",
    }),
    actor,
  );
  return { row, category, tag };
}

void test("分类标签：名称去重、过期编辑、关联计数和删除保护", async () => {
  const { row, category, tag } = await published("关联文章", "relations");
  await assert.rejects(createCategory({ name: "分类 RELATIONS", color: "#000000" }, actor), {
    code: "DUPLICATE_NAME",
  });
  const unicode = await createTag({ name: "École" }, actor);
  await assert.rejects(createTag({ name: "E\u0301COLE" }, actor), { code: "DUPLICATE_NAME" });
  assert.equal((await listCategories(actor)).find((item) => item.id === category.id)?.posts, 1);
  assert.equal((await listTags(actor)).find((item) => item.id === tag.id)?.postLinks, 1);
  const changed = await updateCategory(
    category.id,
    {
      name: "修改后的分类",
      color: "#abcdef",
      expected: { name: category.name, color: category.color },
    },
    actor,
  );
  assert.equal(changed.posts, 1);
  await assert.rejects(
    updateCategory(
      category.id,
      {
        name: "过期编辑",
        color: "#000000",
        expected: { name: category.name, color: category.color },
      },
      actor,
    ),
    { code: "VERSION_CONFLICT" },
  );
  await assert.rejects(deleteCategory(category.id, actor), { code: "RESOURCE_IN_USE" });
  await assert.rejects(deleteTag(tag.id, actor), { code: "RESOURCE_IN_USE" });
  await deletePost(row.id, row.version, actor);
  assert.equal((await listTags(actor)).find((item) => item.id === tag.id)?.postLinks, 0);
  await deleteCategory(category.id, actor);
  await deleteTag(tag.id, actor);
  await deleteTag(unicode.id, actor);
  assert.deepEqual(await listCategories(actor), []);
});

void test("文章生命周期：空白草稿、发布锁定 slug、精选与版本冲突", async () => {
  const draft = await createPost(
    postSchema.parse({
      title: "",
      slug: null,
      categoryId: null,
      tagIds: [],
      content: EMPTY_POST_CONTENT,
      status: "draft",
    }),
    actor,
  );
  assert.equal(draft.category, null);
  assert.equal(draft.slugLockedAt, null);
  assert.deepEqual(draft.tags, []);
  const summary = await getPostSummary(actor);
  assert.equal(summary.recentDrafts[0].id, draft.id);
  assert.deepEqual(summary.statusCounts, { all: 1, draft: 1, published: 0 });
  const category = await createCategory({ name: "发布分类", color: "#123456" }, actor);
  const tags = await Promise.all([
    createTag({ name: "Z 标签" }, actor),
    createTag({ name: "A 标签" }, actor),
  ]);
  const changed = await updatePost(
    draft.id,
    updatePostSchema.parse({
      title: "已发布文章",
      slug: "published-lifecycle",
      categoryId: category.id,
      tagIds: tags.map((tag) => tag.id),
      content: body("正文"),
      status: "published",
      version: draft.version,
    }),
    actor,
  );
  assert.ok(changed.publishedAt);
  assert.equal(changed.slugLockedAt, changed.publishedAt);
  assert.deepEqual(
    changed.tags.map((tag) => tag.name),
    ["A 标签", "Z 标签"],
  );
  const featured = await updatePostFeatured(
    changed.id,
    featuredPostSchema.parse({ isFeatured: true, version: changed.version }),
    actor,
  );
  assert.equal(featured.isFeatured, true);
  assert.equal(featured.featuredOrder, 0);
  await assert.rejects(
    updatePostFeatured(changed.id, { isFeatured: false, version: changed.version }, actor),
    { code: "VERSION_CONFLICT" },
  );
  await assert.rejects(
    updatePost(
      changed.id,
      updatePostSchema.parse({
        title: changed.title,
        slug: "different-slug",
        categoryId: category.id,
        tagIds: [],
        content: body("正文"),
        status: "published",
        version: featured.version,
      }),
      actor,
    ),
    { code: "SLUG_LOCKED" },
  );
  await assert.rejects(deletePost(changed.id, changed.version, actor), {
    code: "VERSION_CONFLICT",
  });
  assert.equal((await getPost(changed.id, actor)).version, featured.version);
});

void test("文章搜索：正文纯文本、摘要、分类标签、字面 %_ 和 Unicode 大小写", async () => {
  const linkedBody = serializeDocument({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "100%_SQL ÉCOLE",
            marks: [{ type: "link", attrs: { href: "https://example.com/hidden-url-keyword" } }],
          },
        ],
      },
    ],
  });
  const { row, category, tag } = await published("搜索文章", "literal-search", linkedBody);
  await published("普通文章", "plain-search", body("100ZZSQL"));
  const query = (q: string) => listPosts(postQuerySchema.parse({ q }), actor);
  assert.deepEqual(
    (await query("%_")).items.map((item) => item.id),
    [row.id],
  );
  assert.deepEqual(
    (await query("école")).items.map((item) => item.id),
    [row.id],
  );
  assert.equal((await query("hidden-url-keyword")).total, 0);
  const publicLiteral = await request(() => listPublicPosts({ q: "%_" }));
  assert.equal(publicLiteral.error, null);
  assert.deepEqual(
    publicLiteral.items.map((item) => item.id),
    [row.id],
  );
  const publicUnicode = await request(() => listPublicPosts({ q: "école" }));
  assert.equal(publicUnicode.error, null);
  assert.equal(publicUnicode.total, 1);
  assert.deepEqual(
    (await query(category.name)).items.map((item) => item.id),
    [row.id],
  );
  assert.deepEqual(
    (await query(tag.name)).items.map((item) => item.id),
    [row.id],
  );
  const updated = await updatePost(
    row.id,
    updatePostSchema.parse({
      title: row.title,
      slug: row.slug,
      categoryId: category.id,
      tagIds: [tag.id],
      content: row.content,
      summary: "独立人工摘要",
      status: "published",
      version: row.version,
    }),
    actor,
  );
  assert.deepEqual(
    (await query("人工摘要")).items.map((item) => item.id),
    [updated.id],
  );
});

void test("文章写入边界：旧排期状态拒绝、无效关系拒绝且旧关联保留", async () => {
  const { row, category, tag } = await published("原有文章", "write-boundary");
  const invalidTagId = "90000000-0000-4000-8000-000000000001";
  await assert.rejects(
    updatePost(
      row.id,
      updatePostSchema.parse({
        title: "不应保存的新标题",
        slug: row.slug,
        categoryId: category.id,
        tagIds: [invalidTagId],
        content: body("不应保存的正文"),
        status: "published",
        version: row.version,
      }),
      actor,
    ),
    { code: "INVALID_INPUT" },
  );
  const unchanged = await getPost(row.id, actor);
  assert.equal(unchanged.title, row.title);
  assert.equal(unchanged.version, row.version);
  assert.deepEqual(
    unchanged.tags.map((item) => item.id),
    [tag.id],
  );
  assert.equal(
    postSchema.safeParse({
      title: "旧排期请求",
      slug: "old-status",
      categoryId: category.id,
      tagIds: [],
      content: body("正文"),
      status: "scheduled",
    }).success,
    false,
  );
  await assert.rejects(
    createPost(
      postSchema.parse({
        title: "冲突 slug",
        slug: row.slug,
        categoryId: category.id,
        tagIds: [],
        content: body("正文"),
        status: "published",
      }),
      actor,
    ),
    { code: "SLUG_CONFLICT" },
  );
});

void test("前台：仅已发布、真实关系数量、摘要回退、分页回退与 sitemap", async () => {
  const { row, category, tag } = await published("公开文章", "public-post", body("正文摘要回退"));
  const draftCategory = await createCategory({ name: "仅草稿分类", color: "#abcdef" }, actor);
  const draftTag = await createTag({ name: "仅草稿标签" }, actor);
  await createPost(
    postSchema.parse({
      title: "隐藏草稿",
      slug: "hidden-draft",
      categoryId: draftCategory.id,
      tagIds: [draftTag.id],
      content: body("隐藏正文"),
      status: "draft",
    }),
    actor,
  );
  const result = await request(() => listPublicPosts({ page: "100" }));
  assert.equal(result.error, null);
  assert.equal(result.total, 1);
  assert.equal(result.page, 1);
  assert.equal(result.items[0].id, row.id);
  assert.equal(result.items[0].summary, "正文摘要回退");
  const taxonomies = await request(getPublicTaxonomies);
  assert.deepEqual(
    taxonomies.categories.map((item) => [item.id, item.count]),
    [[category.id, 1]],
  );
  assert.deepEqual(
    taxonomies.tags.map((item) => [item.id, item.count]),
    [[tag.id, 1]],
  );
  assert.equal((await request(() => getPublicPost(row.slug!)))?.id, row.id);
  assert.equal(await request(() => getPublicPost("hidden-draft")), null);
  assert.equal(await request(() => getPublicPost("INVALID SLUG")), null);
  const search = await request(() =>
    listPublicPosts({ q: "摘要回退", tagId: tag.id, categoryId: category.id }),
  );
  assert.equal(search.error, null);
  assert.equal(search.total, 1);
  const urls = await sitemap();
  assert.equal(urls.filter((item) => item.url.endsWith("/posts/public-post")).length, 1);
  assert.equal(
    urls.some((item) => item.url.endsWith("/posts/hidden-draft")),
    false,
  );
  assert.equal(
    urls.find((item) => item.url.endsWith("/posts/public-post"))?.lastModified?.valueOf(),
    new Date(row.updatedAt).valueOf(),
  );
});

void test("设置：空库默认值、SEO字段、社交顺序、版本冲突和第三方统计配置", async () => {
  const initial = await getSettings(actor);
  assert.equal(initial.version, 1);
  const saved = await saveSettings(
    {
      ...initial,
      seoDescription: "SQLite SEO 描述",
      ogImageUrl: "https://images.example/share.png",
      googleVerification: "google_test_token",
      bingVerification: "bing_test_token",
      baiduVerification: "baidu_test_token",
      socials: [
        {
          id: "10000000-0000-4000-8000-000000000001",
          label: "公开账号",
          url: "https://example.com",
          icon: "github",
          imageUrl: "",
          enabled: true,
        },
        {
          id: "10000000-0000-4000-8000-000000000002",
          label: "停用账号",
          url: "https://example.org",
          icon: "globe",
          imageUrl: "",
          enabled: false,
        },
      ],
    },
    actor,
  );
  assert.equal(saved.version, 2);
  const publicSettings = await request(getPublicSettings);
  assert.equal(publicSettings.seoDescription, saved.seoDescription);
  assert.equal(publicSettings.ogImageUrl, saved.ogImageUrl);
  assert.deepEqual(
    publicSettings.socials.map((social) => social.label),
    ["公开账号"],
  );
  await assert.rejects(saveSettings({ ...initial, title: "过期设置" }, actor), {
    code: "VERSION_CONFLICT",
  });
});

void test("更新日志：逐项字面搜索、编辑冲突、撤回和重新发布保留创建时间", async () => {
  const row = await createRelease(
    { version: "自定义版", title: "SQLite 适配", type: "feature", changes: ["100%_SQL ÉCOLE"] },
    actor,
  );
  const search = await listReleases(releaseQuerySchema.parse({ q: "%_" }), actor);
  assert.equal(search.total, 1);
  assert.equal((await listReleases(releaseQuerySchema.parse({ q: "école" }), actor)).total, 1);
  const edited = await updateRelease(
    row.id,
    {
      version: "自定义新版",
      title: "编辑完成",
      type: "fix",
      changes: ["更新详情"],
      revision: row.revision,
    },
    actor,
  );
  assert.equal(edited.createdAt, row.createdAt);
  await assert.rejects(
    updateRelease(row.id, { status: "withdrawn", revision: row.revision }, actor),
    { code: "VERSION_CONFLICT" },
  );
  const withdrawn = await updateRelease(
    row.id,
    { status: "withdrawn", revision: edited.revision },
    actor,
  );
  assert.equal((await request(() => listPublicChangelog(1))).total, 0);
  const republished = await updateRelease(
    row.id,
    { status: "published", revision: withdrawn.revision },
    actor,
  );
  assert.equal(republished.createdAt, row.createdAt);
  assert.equal((await getRelease(row.id, actor)).revision, republished.revision);
  const listing = await request(() => listPublicChangelog(100));
  assert.equal(listing.page, 1);
  assert.deepEqual(listing.items[0].changes, ["更新详情"]);
});

void test("友链公开查询只返回已通过且启用的真实记录", async () => {
  const now = new Date();
  writeTransaction((tx) => {
    for (const [id, status, enabled, category] of [
      ["10000000-0000-4000-8000-000000000001", "approved", 1, "公开"],
      ["10000000-0000-4000-8000-000000000002", "approved", 0, "停用"],
      ["10000000-0000-4000-8000-000000000003", "pending", 1, "待审"],
    ] as const)
      tx.insert(friendLink)
        .values({
          id,
          name: id,
          url: "https://example.com",
          avatar: "",
          description: "",
          category,
          status,
          enabled,
          version: 1,
          createdAt: now,
          updatedAt: now,
        })
        .run();
  });
  const result = await request(() => listPublicFriends(undefined));
  assert.deepEqual(result.categories, ["公开"]);
  assert.equal(result.items.length, 1);
  assert.equal((await request(() => listPublicFriends("待审"))).items.length, 0);
});

void test("撤销登录后内容查询与事务写入拒绝访问", async () => {
  await logout(actor.sessionToken);
  await assert.rejects(listCategories(actor), { code: "UNAUTHORIZED" });
  await assert.rejects(createCategory({ name: "禁止写入", color: "#123456" }, actor), {
    code: "UNAUTHORIZED",
  });
  await assert.rejects(listPosts(postQuerySchema.parse({}), actor), { code: "UNAUTHORIZED" });
  assert.equal(getDatabase().select().from(admin).where(eq(admin.id, 1)).all().length, 1);
});
