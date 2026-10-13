import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "pg";
import { z } from "zod";

import { hashPassword } from "../../lib/auth/password";
import { serializeDocument } from "../../lib/posts/document";

// 固定使用已提交的最后一版 PostgreSQL contract，不生成或改写历史 Prisma 文件。
export const postgresContractHash =
  "2908a7712d8c234e7671488cc7e62c5552ae2f7b838a6e8788aef33ca9e2416e";
export const postgresTransferProject = resolve(import.meta.dirname, "../..");
export const quoted = (value: string) => `"${value.replaceAll('"', '""')}"`;

const sourceTableSchema = z.object({
  columns: z.record(
    z.string(),
    z.object({
      nativeType: z.enum(["text", "int8", "timestamptz"]),
      nullable: z.boolean(),
      default: z.object({ kind: z.string(), value: z.string() }).optional(),
    }),
  ),
  primaryKey: z.object({ columns: z.array(z.string()) }),
  uniques: z.array(z.object({ columns: z.array(z.string()) })),
  indexes: z.array(
    z.object({ columns: z.array(z.string()), name: z.string(), unique: z.boolean() }),
  ),
  foreignKeys: z.array(
    z.object({
      source: z.object({ columns: z.array(z.string()) }),
      target: z.object({ tableName: z.string(), columns: z.array(z.string()) }),
      onDelete: z.enum(["cascade", "restrict", "setNull"]),
    }),
  ),
});
const snapshotSchema = z.object({
  profileHash: z.string(),
  storage: z.object({
    namespaces: z.object({
      public: z.object({
        entries: z.object({ table: z.record(z.string(), sourceTableSchema) }),
      }),
    }),
  }),
});

export async function postgresTransferRows() {
  const at = "2026-10-04T15:59:59.123Z";
  const later = "2026-10-04T16:00:00.456Z";
  const future = "2030-10-04T16:00:00.000Z";
  const ids = {
    category: randomUUID(),
    tag: randomUUID(),
    post: randomUUID(),
    draft: randomUUID(),
    scheduled: randomUUID(),
    media: randomUUID(),
    attachment: randomUUID(),
    // 保证导出按主键排序时子评论在前，实际覆盖导入的延迟外键路径。
    parent: `f${randomUUID().slice(1)}`,
    child: `0${randomUUID().slice(1)}`,
    social: randomUUID(),
    friend: randomUUID(),
    release: randomUUID(),
    visitSession: randomUUID(),
    pageVisit: randomUUID(),
  };
  const notificationId = `friend:${ids.friend}:7`;
  const password = "transfer-test-original-password";
  const passwordHash = await hashPassword(password);
  const originalSessionToken = randomBytes(32).toString("hex");
  const sessionHash = createHash("sha256").update(originalSessionToken).digest("hex");
  const visitorHash = "sensitive-visitor-hash";
  const email = "sensitive-visitor@example.test";
  const ip = "192.0.2.91";
  const content = serializeDocument({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "SQLite 迁移正文 100%_SQL" }] },
      {
        type: "paragraph",
        content: [
          {
            type: "image",
            attrs: { src: "https://media.example.test/retained-image.png", alt: "原有图片" },
          },
        ],
      },
    ],
  });
  const sensitive = [
    passwordHash,
    sessionHash,
    visitorHash,
    email,
    ip,
    "sensitive-invalid-content",
  ];
  type Row = Record<string, string | number | null>;
  const rows: Record<string, Row[]> = {
    admin: [{ id: 1, username: "import_admin", passwordHash, createdAt: at, updatedAt: later }],
    session: [{ id: sessionHash, adminId: 1, createdAt: at, expiresAt: future }],
    login_rate_limit: [{ id: 1, window: 5_000_000_000, count: 20 }],
    category: [
      { id: ids.category, name: "数据库", nameKey: "数据库", color: "#123456", createdAt: at },
    ],
    tag: [{ id: ids.tag, name: "SQLite", nameKey: "sqlite", createdAt: at }],
    post: [
      {
        id: ids.post,
        title: "已发布文章",
        slug: "retained-post",
        slugLockedAt: at,
        content,
        summary: "保留摘要",
        isFeatured: 1,
        featuredOrder: 3,
        categoryId: ids.category,
        status: "published",
        createdAt: at,
        updatedAt: later,
        publishedAt: later,
        scheduledFor: null,
        version: 5,
      },
      {
        id: ids.draft,
        title: "旧版草稿",
        slug: "legacy-draft",
        slugLockedAt: null,
        content,
        summary: "保留摘要",
        isFeatured: 1,
        featuredOrder: 3,
        categoryId: ids.category,
        status: "draft",
        createdAt: at,
        updatedAt: later,
        publishedAt: null,
        scheduledFor: null,
        version: 2,
      },
      {
        id: ids.scheduled,
        title: "旧版排期",
        slug: "legacy-scheduled",
        slugLockedAt: null,
        content,
        summary: "保留摘要",
        isFeatured: 1,
        featuredOrder: 3,
        categoryId: ids.category,
        status: "scheduled",
        createdAt: at,
        updatedAt: later,
        publishedAt: null,
        scheduledFor: future,
        version: 3,
      },
    ],
    post_tag: [{ postId: ids.post, tagId: ids.tag }],
    media: [
      {
        id: ids.media,
        adminId: 1,
        name: "retained-image.png",
        kind: "image",
        expectedBytes: 5_000_000_000,
        sha256: "a".repeat(64),
        stagingKey: `staging/${ids.media}`,
        stagingCleanedAt: later,
        objectKey: `media/${ids.media}`,
        bytes: 5_000_000_000,
        mime: "image/png",
        width: 1920,
        height: 1080,
        status: "ready",
        leaseToken: null,
        leaseUntil: null,
        createdAt: at,
        uploadedAt: later,
        expiresAt: future,
        deletedAt: null,
      },
      {
        id: ids.attachment,
        adminId: 1,
        name: "retained-attachment.pdf",
        kind: "attachment",
        expectedBytes: 2048,
        sha256: "d".repeat(64),
        stagingKey: `staging/${ids.attachment}`,
        stagingCleanedAt: null,
        objectKey: `media/${ids.attachment}`,
        bytes: 2048,
        mime: "application/pdf",
        width: null,
        height: null,
        status: "ready",
        leaseToken: null,
        leaseUntil: null,
        createdAt: at,
        uploadedAt: later,
        expiresAt: future,
        deletedAt: null,
      },
    ],
    media_upload_limit: [{ adminId: 1, window: 5_000_000_000, count: 4 }],
    // 子评论先出现在源结果中，验证导入能处理真实的自引用依赖。
    comment: [
      {
        id: ids.child,
        postId: ids.post,
        parentId: ids.parent,
        adminId: 1,
        author: "import_admin",
        authorKind: "admin",
        submissionId: null,
        submissionHash: null,
        email: null,
        content: "管理员回复保留所属账号",
        status: "approved",
        createdAt: later,
        updatedAt: later,
        version: 2,
      },
      {
        id: ids.parent,
        postId: ids.post,
        parentId: null,
        adminId: null,
        author: "访客",
        authorKind: "reader",
        submissionId: randomUUID(),
        submissionHash: "b".repeat(64),
        email,
        content: "原有访客留言",
        status: "approved",
        createdAt: at,
        updatedAt: later,
        version: 4,
      },
    ],
    comment_rate_limit: [
      { id: "comment-limit-key", window: 5_000_000_000, count: 3, expiresAt: future },
    ],
    site_setting: [
      {
        id: 1,
        title: "原有线上站点",
        subtitle: "站点副标题",
        seoDescription: "SEO 描述",
        ogImageUrl: "https://media.example.test/og.png",
        googleVerification: "google-token",
        bingVerification: null,
        baiduVerification: null,
        authorName: "作者",
        authorRole: "开发者",
        avatarUrl: "https://media.example.test/avatar.png",
        aboutMe: "原有介绍",
        postsPerPage: 8,
        enableComments: 1,
        icpText: "备案文字",
        icpUrl: "https://beian.miit.gov.cn",
        policeText: "公安备案文字",
        policeUrl: "https://beian.mps.gov.cn",
        localAnalyticsEnabled: 1,
        localAnalyticsStartedAt: at,
        googleEnabled: 0,
        googleId: "",
        baiduEnabled: 0,
        baiduId: "",
        version: 9,
        updatedAt: later,
      },
    ],
    social_account: [
      {
        id: ids.social,
        settingId: 1,
        label: "GitHub",
        url: "https://github.com/example",
        icon: "github",
        imageUrl: "",
        enabled: 1,
        position: 2,
      },
    ],
    friend_link: [
      {
        id: ids.friend,
        name: "原有友链",
        url: "https://friend.example.test",
        avatar: "",
        description: "原有友链描述",
        category: "技术博客",
        status: "pending",
        enabled: 0,
        version: 7,
        createdAt: at,
        updatedAt: later,
      },
    ],
    release_log: [
      {
        id: ids.release,
        version: "1.2.3",
        title: "原有更新日志",
        type: "feature",
        changes: JSON.stringify(["保留原有日志", "保留时间"]),
        status: "published",
        revision: 6,
        updatedAt: later,
        createdAt: at,
      },
    ],
    visit_session: [{ id: ids.visitSession, visitorHash, createdAt: at, lastSeenAt: later }],
    page_visit: [
      {
        id: ids.pageVisit,
        visitorHash,
        sessionId: ids.visitSession,
        path: "/posts/retained-post",
        postId: ids.post,
        article: 1,
        source: "direct",
        referrerHost: "",
        device: "desktop",
        browser: "Chrome",
        os: "macOS",
        ip,
        location: "测试地区",
        createdAt: at,
        lastSeenAt: later,
        durationMs: 5_000_000_000,
        progress: 100,
      },
    ],
    analytics_rate_limit: [
      { id: "analytics-limit-key", window: 5_000_000_000, count: 6, expiresAt: future },
    ],
    notification: [
      {
        id: notificationId,
        kind: "friend",
        sourceId: ids.friend,
        title: "原有友链申请",
        href: "/admin/friends-links",
        createdAt: later,
        resolvedAt: null,
      },
    ],
    notification_read: [{ notificationId, adminId: 1, readAt: later }],
    operation_setting: [
      { id: 1, autoBackup: 1, version: 8, schedulerLastRunAt: at, updatedAt: later },
    ],
    backup_run: [
      {
        id: randomUUID(),
        dailyKey: "2026-10-04",
        status: "complete",
        bytes: 1000,
        sha256: "c".repeat(64),
        createdAt: at,
        finishedAt: later,
      },
    ],
  };

  // 未结束的旧备份保留原状态归档，不能成为可恢复的 SQLite 备份。
  rows.backup_run.push({
    id: randomUUID(),
    dailyKey: null,
    status: "running",
    bytes: null,
    sha256: null,
    createdAt: at,
    finishedAt: null,
  });
  for (const row of rows.backup_run) {
    const id = `backup:${row.id}`;
    rows.notification.push({
      id,
      kind: "backup",
      sourceId: row.id,
      title: "旧 PostgreSQL 备份记录",
      href: "/admin",
      createdAt: later,
      resolvedAt: null,
    });
    rows.notification_read.push({ notificationId: id, adminId: 1, readAt: later });
  }
  return {
    originalSessionToken,
    rows,
    ids,
    content,
    password,
    passwordHash,
    sessionHash,
    visitorHash,
    email,
    ip,
    sensitive: [...sensitive, password, originalSessionToken],
    at,
    later,
    future,
  };
}

export async function createPostgresTransferFixture(options: { empty?: boolean } = {}) {
  // 禁止加载 .env 或复用业务 DATABASE_URL；专用测试容器由调用方提供。
  assert.ok(process.env.TEST_POSTGRES_ADMIN_URL, "需要显式提供专用测试 PostgreSQL 管理连接。");
  const base = new URL(process.env.TEST_POSTGRES_ADMIN_URL);
  assert.ok(
    ["127.0.0.1", "localhost", "[::1]"].includes(base.hostname),
    "测试只允许 loopback PostgreSQL。",
  );
  assert.ok(
    base.port && !["5432", "15433"].includes(base.port),
    "拒绝默认端口和项目开发数据库端口。",
  );
  assert.equal(base.pathname, "/postgres", "专用管理连接必须指向 postgres 管理库。");
  const name = `fx_transfer_test_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const role = `${name}_reader`;
  const rolePassword = `independent-reader-${randomUUID()}`;
  const sourceUrl = new URL(base);
  sourceUrl.pathname = `/${name}`;
  const readerUrl = new URL(sourceUrl);
  readerUrl.username = role;
  readerUrl.password = rolePassword;
  const admin = new Client({ connectionString: base.toString(), connectionTimeoutMillis: 5000 });
  const source = new Client({
    connectionString: sourceUrl.toString(),
    connectionTimeoutMillis: 5000,
  });
  const fixture = await postgresTransferRows();
  const snapshotContent: unknown = JSON.parse(
    await readFile(
      resolve(
        postgresTransferProject,
        `prisma/migrations/snapshots/${postgresContractHash}/contract.json`,
      ),
      "utf8",
    ),
  );
  const snapshot = snapshotSchema.parse(snapshotContent);
  const tables = snapshot.storage.namespaces.public.entries.table;
  assert.deepEqual(
    Object.keys(fixture.rows).toSorted(),
    Object.keys(tables).toSorted(),
    "种子显式覆盖全部 22 张业务表。",
  );
  let connected = false;
  let created = false;
  let roleCreated = false;
  let sourceConnected = false;
  async function cleanup() {
    if (sourceConnected) {
      await source.end();
      sourceConnected = false;
    }
    if (created) {
      await admin.query(`DROP DATABASE ${quoted(name)} WITH (FORCE)`);
      created = false;
    }
    if (roleCreated) {
      await admin.query(`DROP ROLE ${quoted(role)}`);
      roleCreated = false;
    }
    if (connected) {
      await admin.end();
      connected = false;
    }
  }
  try {
    await admin.connect();
    connected = true;
    await admin.query(`CREATE DATABASE ${quoted(name)}`);
    created = true;
    await source.connect();
    sourceConnected = true;
    for (const [tableName, table] of Object.entries(tables)) {
      const columns = Object.entries(table.columns).map(([fieldName, column]) => {
        const defaultSql = column.default
          ? ` DEFAULT '${column.default.value.replaceAll("'", "''")}'`
          : "";
        return `${quoted(fieldName)} ${column.nativeType}${column.nullable ? "" : " NOT NULL"}${defaultSql}`;
      });
      columns.push(`PRIMARY KEY (${table.primaryKey.columns.map(quoted).join(", ")})`);
      for (const unique of table.uniques)
        columns.push(`UNIQUE (${unique.columns.map(quoted).join(", ")})`);
      await source.query(`CREATE TABLE public.${quoted(tableName)} (${columns.join(", ")})`);
    }
    for (const [tableName, table] of Object.entries(tables)) {
      for (const [index, foreignKey] of table.foreignKeys.entries()) {
        const action =
          foreignKey.onDelete === "setNull" ? "SET NULL" : foreignKey.onDelete.toUpperCase();
        await source.query(
          `ALTER TABLE public.${quoted(tableName)} ADD CONSTRAINT ${quoted(`${tableName}_transfer_fk_${index}`)} FOREIGN KEY (${foreignKey.source.columns.map(quoted).join(", ")}) REFERENCES public.${quoted(foreignKey.target.tableName)} (${foreignKey.target.columns.map(quoted).join(", ")}) ON DELETE ${action}`,
        );
      }
      for (const index of table.indexes) {
        await source.query(
          `CREATE ${index.unique ? "UNIQUE " : ""}INDEX ${quoted(index.name)} ON public.${quoted(tableName)} (${index.columns.map(quoted).join(", ")})`,
        );
      }
    }
    // 与已安装 Prisma 8 rc14 的 per-space control 表一致，但不调用旧 CLI。
    await source.query(`CREATE SCHEMA prisma_contract;
      CREATE TABLE prisma_contract.marker (
        space text PRIMARY KEY DEFAULT 'app', core_hash text NOT NULL, profile_hash text NOT NULL,
        contract_json jsonb, canonical_version integer, updated_at timestamptz NOT NULL DEFAULT now(),
        app_tag text, meta jsonb NOT NULL DEFAULT '{}', invariants text[] NOT NULL DEFAULT '{}'
      );
      CREATE TABLE prisma_contract.ledger (
        id bigserial PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), space text NOT NULL,
        migration_name text NOT NULL, migration_hash text NOT NULL, origin_core_hash text,
        origin_profile_hash text, destination_core_hash text NOT NULL, destination_profile_hash text,
        operations jsonb NOT NULL
      );
      CREATE TABLE prisma_contract.contract (
        core_hash text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), contract_json jsonb NOT NULL
      )`);
    await source.query(
      "INSERT INTO prisma_contract.marker (space, core_hash, profile_hash, contract_json) VALUES ($1, $2, $3, $4)",
      ["app", postgresContractHash, snapshot.profileHash, snapshotContent],
    );
    await source.query(
      "INSERT INTO prisma_contract.contract (core_hash, contract_json) VALUES ($1, $2)",
      [postgresContractHash, snapshotContent],
    );
    if (!options.empty) {
      await source.query("BEGIN");
      try {
        for (const [table, rows] of Object.entries(fixture.rows)) {
          for (const row of table === "comment"
            ? rows.toSorted(
                (left, right) => Number(left.parentId !== null) - Number(right.parentId !== null),
              )
            : rows) {
            const columns = Object.keys(row);
            await source.query(
              `INSERT INTO public.${quoted(table)} (${columns.map(quoted).join(", ")}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(", ")})`,
              columns.map((column) => row[column]),
            );
          }
        }
        await source.query("COMMIT");
      } catch (error) {
        await source.query("ROLLBACK");
        throw error;
      }
    }
    await admin.query(`CREATE ROLE ${quoted(role)} LOGIN PASSWORD '${rolePassword}'`);
    roleCreated = true;
    await source.query(`GRANT USAGE ON SCHEMA public, prisma_contract TO ${quoted(role)}`);
    await source.query(
      `GRANT SELECT ON ALL TABLES IN SCHEMA public, prisma_contract TO ${quoted(role)}`,
    );
    return {
      ...fixture,
      source,
      sourceUrl: sourceUrl.toString(),
      readerUrl: readerUrl.toString(),
      tables,
      name,
      sensitive: [
        ...fixture.sensitive,
        base.password,
        rolePassword,
        readerUrl.toString(),
        sourceUrl.toString(),
      ],
      cleanup,
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

export async function postgresTransferFingerprint(source: Client) {
  const rows = await source.query<{ table_schema: string; table_name: string }>(
    "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN ('public','prisma_contract') ORDER BY table_schema, table_name",
  );
  const hash = createHash("sha256");
  for (const { table_schema: schema, table_name: table } of rows.rows) {
    const content = await source.query(
      `SELECT to_jsonb(t)::text AS value FROM ${quoted(schema)}.${quoted(table)} AS t ORDER BY to_jsonb(t)::text`,
    );
    hash.update(JSON.stringify([schema, table, content.rows]));
  }
  return hash.digest("hex");
}
