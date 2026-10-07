import "dotenv/config";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { chmod, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { test } from "node:test";
import { Client } from "pg";

import { serializeDocument } from "../lib/posts/document";

const project = resolve(import.meta.dirname, "..");
const excluded = new Set([
  "session",
  "login_rate_limit",
  "media_upload_limit",
  "comment_rate_limit",
  "analytics_rate_limit",
  "backup_run",
]);
const addedColumns: Record<string, string[]> = {
  post: ["summary", "isFeatured", "featuredOrder"],
  site_setting: [
    "seoDescription",
    "ogImageUrl",
    "googleVerification",
    "bingVerification",
    "baiduVerification",
  ],
  release_log: ["status", "revision", "updatedAt"],
};
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
  parent: randomUUID(),
  child: randomUUID(),
  social: randomUUID(),
  friend: randomUUID(),
  release: randomUUID(),
  visitSession: randomUUID(),
  pageVisit: randomUUID(),
};
const notificationId = `friend:${ids.friend}:7`;
const passwordHash =
  "$argon2id$v=19$m=19456,t=2,p=1$c2Vuc2l0aXZlLXRlc3Qtc2FsdA$bG9uZy1zZW5zaXRpdmUtcGFzc3dvcmQtaGFzaC12YWx1ZQ";
const sessionHash = "sensitive-session-token-hash";
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
const sensitive = [passwordHash, sessionHash, visitorHash, email, ip, "sensitive-invalid-content"];
type Row = Record<string, SQLInputValue>;
type Column = {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: "YES" | "NO";
};
type Constraint = {
  table_name: string;
  type: "p" | "u" | "f";
  columns: string[];
  referenced_table: string | null;
  referenced_columns: string[];
};

const fixtureRows: Record<string, Row[]> = {
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

const quoted = (value: string) => `"${value.replaceAll('"', '""')}"`;
const digest = async (path: string) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
const orderedRow = (row: Record<string, unknown>) =>
  JSON.stringify(Object.entries(row).toSorted(([a], [b]) => a.localeCompare(b)));

function redact(output: string) {
  const secrets = [
    ...sensitive,
    process.env.DATABASE_URL,
    process.env.POSTGRES_ADMIN_PASSWORD,
    process.env.POSTGRES_APP_PASSWORD,
  ].filter((value): value is string => Boolean(value));
  for (const secret of secrets) output = output.replaceAll(secret, "[已隐藏]");
  return output;
}

async function createFixture(
  path: string,
  columns: Column[],
  constraints: Constraint[],
  change?: (source: DatabaseSync) => void,
) {
  const source = new DatabaseSync(path);
  try {
    source.exec("PRAGMA foreign_keys = ON");
    for (const table of Object.keys(fixtureRows)) {
      const legacy = columns.filter(
        (column) =>
          column.table_name === table && !addedColumns[table]?.includes(column.column_name),
      );
      const definitions = legacy.map((column) => {
        const type = column.data_type === "bigint" ? "INTEGER" : "TEXT";
        const required =
          column.is_nullable === "NO" ||
          (table === "post" && ["slug", "categoryId"].includes(column.column_name));
        return `${quoted(column.column_name)} ${type}${required ? " NOT NULL" : ""}`;
      });
      for (const constraint of constraints.filter((item) => item.table_name === table)) {
        const fields = constraint.columns.map(quoted).join(", ");
        if (constraint.type === "p") definitions.push(`PRIMARY KEY (${fields})`);
        else if (constraint.type === "u") definitions.push(`UNIQUE (${fields})`);
        else
          definitions.push(
            `FOREIGN KEY (${fields}) REFERENCES ${quoted(constraint.referenced_table!)} (${constraint.referenced_columns.map(quoted).join(", ")}) DEFERRABLE INITIALLY DEFERRED`,
          );
      }
      source.exec(`CREATE TABLE ${quoted(table)} (${definitions.join(", ")})`);
    }
    source.exec("BEGIN");
    for (const [table, rows] of Object.entries(fixtureRows)) {
      for (const row of rows) {
        const keys = Object.keys(row);
        source
          .prepare(
            `INSERT INTO ${quoted(table)} (${keys.map(quoted).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
          )
          .run(...keys.map((key) => row[key]));
      }
    }
    source.exec("COMMIT");
    source.exec('CREATE TABLE "_prisma_ledger" ("id" TEXT PRIMARY KEY)');
    source.exec('CREATE TABLE "_prisma_marker" ("id" TEXT PRIMARY KEY)');
    source.exec("INSERT INTO \"_prisma_ledger\" VALUES ('legacy-sqlite-only')");
    source.exec("INSERT INTO \"_prisma_marker\" VALUES ('legacy-sqlite-only')");
    change?.(source);
  } finally {
    source.close();
  }
}

function mappedRows(table: string): Row[] {
  if (excluded.has(table)) return [];
  return fixtureRows[table].map((row) => {
    if (table === "post") return { ...row, summary: "", isFeatured: 0, featuredOrder: 0 };
    if (table === "site_setting")
      return { ...row, ...Object.fromEntries(addedColumns.site_setting.map((key) => [key, null])) };
    if (table === "release_log")
      return { ...row, status: "published", revision: 1, updatedAt: null };
    if (table === "operation_setting") return { ...row, autoBackup: 0, schedulerLastRunAt: null };
    return { ...row };
  });
}

void test(
  "旧 SQLite 快照到独立 PostgreSQL：保留数据、严格预检与失败回滚",
  { timeout: 240_000 },
  async (t) => {
    assert.ok(process.env.DATABASE_URL, "需要本地测试数据库连接配置。");
    const base = new URL(process.env.DATABASE_URL);
    assert.ok(
      ["127.0.0.1", "localhost", "[::1]"].includes(base.hostname),
      "导入测试只允许本地 PostgreSQL；不能在远程数据库创建测试库。",
    );
    const name = `fx_import_test_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const testingUrl = new URL(base);
    testingUrl.pathname = `/${name}`;
    const environment = { ...process.env, DATABASE_URL: testingUrl.toString() };
    const admin = new Client({
      host: base.hostname,
      port: Number(base.port || 5432),
      user: "postgres",
      password: process.env.POSTGRES_ADMIN_PASSWORD,
      database: "postgres",
    });
    const target = new Client({ connectionString: testingUrl.toString() });
    let adminConnected = false;
    let targetConnected = false;
    let created = false;
    let temporary: string | undefined;
    try {
      await admin.connect();
      adminConnected = true;
      await admin.query(
        `CREATE DATABASE ${quoted(name)} OWNER ${quoted(decodeURIComponent(base.username))}`,
      );
      created = true;
      const migration = spawnSync(process.execPath, ["--import", "tsx", "scripts/migrate.ts"], {
        cwd: project,
        env: environment,
        encoding: "utf8",
        timeout: 30_000,
      });
      assert.equal(
        migration.status,
        0,
        redact(`独立测试库迁移失败：${migration.stdout}${migration.stderr}`),
      );
      await target.connect();
      targetConnected = true;
      const columns = (
        await target.query<Column>(
          "SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name NOT LIKE '\\_prisma%' ORDER BY table_name, ordinal_position",
        )
      ).rows;
      assert.deepEqual(
        [...new Set(columns.map((column) => column.table_name))].toSorted(),
        Object.keys(fixtureRows).toSorted(),
        "fixture 必须显式覆盖当前全部业务表。",
      );
      const constraints = (
        await target.query<Constraint>(`
        SELECT rel.relname AS table_name, con.contype AS type,
          ARRAY(SELECT attr.attname::text FROM unnest(con.conkey) WITH ORDINALITY AS key(attnum, position)
            JOIN pg_attribute AS attr ON attr.attrelid = con.conrelid AND attr.attnum = key.attnum
            ORDER BY key.position) AS columns,
          ref.relname AS referenced_table,
          ARRAY(SELECT attr.attname::text FROM unnest(con.confkey) WITH ORDINALITY AS key(attnum, position)
            JOIN pg_attribute AS attr ON attr.attrelid = con.confrelid AND attr.attnum = key.attnum
            ORDER BY key.position) AS referenced_columns
        FROM pg_constraint AS con
        JOIN pg_class AS rel ON rel.oid = con.conrelid
        JOIN pg_namespace AS ns ON ns.oid = rel.relnamespace
        LEFT JOIN pg_class AS ref ON ref.oid = con.confrelid
        WHERE ns.nspname = 'public' AND rel.relname NOT LIKE '\\_prisma%'
          AND con.contype IN ('p', 'u', 'f')
      `)
      ).rows;
      temporary = await mkdtemp(join(tmpdir(), "fx-sqlite-import-"));
      const sourcePath = join(temporary, "legacy.sqlite");
      await createFixture(sourcePath, columns, constraints);
      await chmod(sourcePath, 0o444);
      const originalDigest = await digest(sourcePath);
      const originalStat = await stat(sourcePath);
      let reportIndex = 0;

      function run(mode: "dry-run" | "apply" | "verify", source = sourcePath) {
        const report = join(temporary!, `report-${++reportIndex}.json`);
        const childEnvironment: NodeJS.ProcessEnv = { ...environment };
        childEnvironment.TSX_TSCONFIG_PATH = join(project, "tsconfig.json");
        if (mode === "dry-run") delete childEnvironment.DATABASE_URL;
        const result = spawnSync(
          process.execPath,
          [
            "--conditions=react-server",
            "--import",
            import.meta.resolve("tsx"),
            join(project, "scripts/import-sqlite.ts"),
            "--source",
            source,
            `--${mode}`,
            "--report",
            report,
          ],
          {
            // 临时 cwd 没有 .env，确保 dry-run 不会偷偷使用开发库配置。
            cwd: mode === "dry-run" ? temporary : project,
            env: childEnvironment,
            encoding: "utf8",
            timeout: 30_000,
          },
        );
        assert.equal(result.error, undefined, "CLI 不应超时或启动失败。");
        return { ...result, report, output: `${result.stdout}${result.stderr}` };
      }

      async function assertEmpty() {
        for (const table of Object.keys(fixtureRows)) {
          const result = await target.query(
            `SELECT count(*)::int AS total FROM public.${quoted(table)}`,
          );
          assert.equal(result.rows[0].total, 0, `${table} 在失败后必须保持为空。`);
        }
      }

      async function assertSourceUnchanged() {
        assert.equal(await digest(sourcePath), originalDigest, "只读导入不能改写源快照。");
        assert.equal((await stat(sourcePath)).mtimeMs, originalStat.mtimeMs);
      }

      async function assertSanitized(result: ReturnType<typeof run>) {
        let report = "";
        try {
          report = await readFile(result.report, "utf8");
        } catch (error) {
          if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
        }
        const output = result.output + report;
        for (const value of sensitive) {
          assert.equal(output.includes(value), false, "CLI 和报告不得输出源中的敏感字段值。");
        }
        for (const value of [base.password, process.env.POSTGRES_ADMIN_PASSWORD].filter(Boolean)) {
          assert.equal(output.includes(value!), false, "CLI 和报告不得输出数据库凭据。");
        }
      }

      async function resetTarget() {
        await target.query(
          `TRUNCATE ${Object.keys(fixtureRows)
            .map((table) => `public.${quoted(table)}`)
            .join(", ")}`,
        );
      }

      await t.test("dry-run 无数据库配置也可只读校验，不创建业务行", async () => {
        const result = run("dry-run");
        assert.equal(result.status, 0, redact(result.output));
        await assertEmpty();
        await assertSourceUnchanged();
        await assertSanitized(result);
        assert.ok((await stat(result.report)).size > 0, "成功预检必须生成报告。");
        const report = JSON.parse(await readFile(result.report, "utf8"));
        assert.equal(report.targetChecked, false);
        assert.equal(report.target, null);
        assert.equal(report.sourceSha256, originalDigest);
        for (const table of report.tables) {
          assert.equal(table.targetCount, null);
          assert.equal(table.plannedCount, mappedRows(table.table).length);
        }
      });

      await t.test("apply 全字段保留、补齐默认字段，并清空鉴权/限流/旧备份", async () => {
        const result = run("apply");
        assert.equal(result.status, 0, redact(result.output));
        for (const table of Object.keys(fixtureRows)) {
          const actual = (await target.query(`SELECT * FROM public.${quoted(table)}`)).rows.map(
            (row) =>
              Object.fromEntries(
                columns
                  .filter((column) => column.table_name === table)
                  .map((column) => {
                    let value = row[column.column_name];
                    if (value instanceof Date) value = value.toISOString();
                    else if (value !== null && column.data_type === "bigint") value = Number(value);
                    return [column.column_name, value];
                  }),
              ),
          );
          assert.deepEqual(
            actual.map(orderedRow).toSorted(),
            mappedRows(table).map(orderedRow).toSorted(),
            `${table} 应与源映射后的全部字段一致。`,
          );
        }
        await assertSourceUnchanged();
        await assertSanitized(result);
        assert.ok((await stat(result.report)).size > 0, "成功导入必须生成报告。");
      });

      await t.test("verify 成功、第二次 apply 拒绝非空目标且不改写已有数据", async () => {
        const verification = run("verify");
        assert.equal(verification.status, 0, redact(verification.output));
        await assertSanitized(verification);
        const repeated = run("apply");
        assert.notEqual(repeated.status, 0, "不能在非空目标重跑导入。");
        assert.equal(
          (await target.query('SELECT "passwordHash" FROM public.admin WHERE id = 1')).rows[0]
            .passwordHash,
          passwordHash,
        );
        const unchanged = run("verify");
        assert.equal(unchanged.status, 0, redact(unchanged.output));
        await assertSanitized(repeated);
        await assertSourceUnchanged();
      });

      await t.test("verify 检出目标字段漂移且不会修复目标", async () => {
        await target.query(
          'UPDATE public.media SET "expectedBytes" = "expectedBytes" + 1 WHERE id = $1',
          [ids.media],
        );
        const result = run("verify");
        assert.notEqual(result.status, 0, "逐字段核对必须检出行数不变的字段漂移。");
        assert.equal(
          (
            await target.query('SELECT "expectedBytes" FROM public.media WHERE id = $1', [
              ids.media,
            ])
          ).rows[0].expectedBytes,
          "5000000001",
        );
        await assertSanitized(result);
        await assertSourceUnchanged();
        await resetTarget();
      });

      await t.test("只有目标限流行也拒绝 apply，不覆盖初始化后的数据库", async () => {
        await target.query(
          'INSERT INTO public.login_rate_limit (id, "window", count) VALUES (991, 5000000000, 7)',
        );
        try {
          const result = run("apply");
          assert.notEqual(result.status, 0, "被排除的限流表非空也不能导入。");
          assert.equal(
            (await target.query("SELECT count(*)::int AS total FROM public.admin")).rows[0].total,
            0,
          );
          assert.equal(
            (await target.query("SELECT count FROM public.login_rate_limit WHERE id = 991")).rows[0]
              .count,
            "7",
          );
          await assertSanitized(result);
          await assertSourceUnchanged();
        } finally {
          await resetTarget();
        }
        await assertEmpty();
      });

      await t.test("拒绝带未合并 WAL 的活动 SQLite，必须使用独立一致性快照", async () => {
        const activePath = join(temporary!, "active.sqlite");
        await createFixture(activePath, columns, constraints);
        const active = new DatabaseSync(activePath);
        try {
          active.exec("PRAGMA journal_mode = WAL; PRAGMA wal_autocheckpoint = 0");
          active.prepare('UPDATE admin SET "updatedAt" = ?').run(future);
          assert.ok((await stat(`${activePath}-wal`)).size > 0, "测试必须存在真实的未合并 WAL。");
          const result = run("apply", activePath);
          assert.notEqual(result.status, 0, "活动 WAL 源不能用于正式迁移。");
          await assertEmpty();
          await assertSanitized(result);
        } finally {
          active.close();
        }
      });

      await t.test("主文件摘要未变时，非空 WAL/journal 旁车仍必须拒绝", async () => {
        for (const suffix of ["-wal", "-journal"]) {
          const sidecar = `${sourcePath}${suffix}`;
          await writeFile(sidecar, "unmerged-snapshot-sidecar");
          try {
            assert.equal(await digest(sourcePath), originalDigest);
            const result = run("apply");
            assert.notEqual(result.status, 0, "不能只凭 SQLite 主文件摘要接受带旁车的源。");
            await assertEmpty();
            await assertSourceUnchanged();
            await assertSanitized(result);
          } finally {
            await rm(sidecar, { force: true });
          }
        }
      });

      for (const [label, mutate] of [
        [
          "未知源字段",
          (source: DatabaseSync) =>
            source.exec('ALTER TABLE admin ADD COLUMN "unexpectedField" TEXT'),
        ],
        [
          "未知源业务表",
          (source: DatabaseSync) => source.exec("CREATE TABLE unexpected_business (id INTEGER)"),
        ],
        [
          "非法日期",
          (source: DatabaseSync) =>
            source.prepare('UPDATE admin SET "createdAt" = ?').run("2026-02-30T00:00:00.000Z"),
        ],
        [
          "无时区日期",
          (source: DatabaseSync) =>
            source.prepare('UPDATE admin SET "createdAt" = ?').run("2026-10-04 15:59:59"),
        ],
        [
          "不安全整数",
          (source: DatabaseSync) =>
            source.exec('UPDATE media SET "expectedBytes" = 9007199254740992'),
        ],
        [
          "非法正文",
          (source: DatabaseSync) =>
            source
              .prepare("UPDATE post SET content = ? WHERE id = ?")
              .run("sensitive-invalid-content", ids.post),
        ],
        [
          "搜索文本不一致",
          (source: DatabaseSync) => {
            const value = JSON.parse(content);
            value.text = "被改写的搜索正文";
            source
              .prepare("UPDATE post SET content = ? WHERE id = ?")
              .run(JSON.stringify(value), ids.post);
          },
        ],
        [
          "悬空关联",
          (source: DatabaseSync) => {
            source.exec("PRAGMA foreign_keys = OFF");
            source.prepare('UPDATE page_visit SET "sessionId" = ?').run(randomUUID());
          },
        ],
      ] as const) {
        await t.test(`预检拒绝${label}，目标保持为空`, async () => {
          const invalidPath = join(temporary!, `invalid-${reportIndex}.sqlite`);
          await createFixture(invalidPath, columns, constraints, mutate);
          const before = await digest(invalidPath);
          const result = run("apply", invalidPath);
          assert.notEqual(result.status, 0, `${label} 必须被拒绝。`);
          await assertEmpty();
          assert.equal(await digest(invalidPath), before, "失败预检不能修改源。");
          await assertSanitized(result);
        });
      }

      await t.test("后期 notification 写入失败时，前面全部业务行一并回滚", async () => {
        await target.query(`
        CREATE FUNCTION public.fx_import_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$
          BEGIN RAISE EXCEPTION 'sensitive-injected-database-detail'; END;
        $$;
        CREATE TRIGGER fx_import_test_failure BEFORE INSERT ON public.notification
          FOR EACH ROW EXECUTE FUNCTION public.fx_import_test_failure();
      `);
        try {
          const verified = spawnSync(
            process.execPath,
            ["node_modules/prisma/dist/prisma.js", "db", "verify"],
            {
              cwd: project,
              env: environment,
              encoding: "utf8",
              timeout: 30_000,
            },
          );
          assert.equal(
            verified.status,
            0,
            redact(`故障触发器必须不影响正式结构预检：${verified.stdout}${verified.stderr}`),
          );
          const result = run("apply");
          assert.notEqual(result.status, 0, "notification 故障必须触发导入失败。");
          assert.equal(
            result.output.includes("sensitive-injected-database-detail"),
            false,
            "内部数据库异常不得泄漏。",
          );
          await assertEmpty();
          await assertSourceUnchanged();
          await assertSanitized(result);
        } finally {
          await target.query(
            "DROP TRIGGER fx_import_test_failure ON public.notification; DROP FUNCTION public.fx_import_test_failure()",
          );
        }
        const retried = run("apply");
        assert.equal(retried.status, 0, redact(retried.output));
        const verified = run("verify");
        assert.equal(verified.status, 0, redact(verified.output));
      });
    } finally {
      if (targetConnected) await target.end();
      if (created) await admin.query(`DROP DATABASE ${quoted(name)} WITH (FORCE)`);
      if (adminConnected) await admin.end();
      if (temporary) await rm(temporary, { recursive: true, force: true });
    }
  },
);
