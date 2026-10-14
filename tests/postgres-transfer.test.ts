import Sqlite from "better-sqlite3";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdtemp,
  readFile,
  realpath,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { z } from "zod";

import { closeDatabase } from "../lib/database";
import { migrationManifest } from "../lib/database/migrations";
import {
  createPostgresTransferFixture,
  postgresContractHash,
  postgresTransferFingerprint,
  postgresTransferProject,
  quoted,
} from "./helpers/postgres-transfer";

const rowSchema = z.record(z.string(), z.union([z.string(), z.number(), z.null()]));
const manifestSchema = z.object({
  format: z.literal("fuxiaochen-postgresql-transfer"),
  version: z.literal(1),
  sourceContractSha256: z.string(),
  targetSchemaSha256: z.string(),
  tables: z.array(
    z.object({ name: z.string(), rowCount: z.number(), bytes: z.number(), sha256: z.string() }),
  ),
});
const removedTables = new Set([
  "comment",
  "comment_rate_limit",
  "page_visit",
  "visit_session",
  "analytics_rate_limit",
]);
const removedFields = new Set([
  "enableComments",
  "localAnalyticsEnabled",
  "localAnalyticsStartedAt",
]);
const resetTables = new Set([
  "session",
  "login_rate_limit",
  "media_upload_limit",
  "comment_rate_limit",
  "analytics_rate_limit",
  "backup_run",
]);
const digest = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");
const orderedRow = (row: Record<string, unknown>) =>
  JSON.stringify(Object.entries(row).toSorted(([a], [b]) => a.localeCompare(b)));

async function absent(path: string) {
  await assert.rejects(lstat(path), { code: "ENOENT" }, "失败路径不能留下目标文件。");
}

async function archiveRows(directory: string, table: string) {
  const content = await readFile(join(directory, `${table}.jsonl`), "utf8");
  return content.trimEnd() === ""
    ? []
    : content
        .trimEnd()
        .split("\n")
        .map((line) => rowSchema.parse(JSON.parse(line)));
}

async function mutateArchive(
  directory: string,
  table: string,
  change: (rows: z.infer<typeof rowSchema>[]) => void,
) {
  const rows = await archiveRows(directory, table);
  change(rows);
  const bytes = rows.map((row) => `${JSON.stringify(row)}\n`).join("");
  await writeArchiveBytes(directory, table, bytes);
}

async function writeArchiveBytes(directory: string, table: string, bytes: string) {
  await writeFile(join(directory, `${table}.jsonl`), bytes);
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(join(directory, "manifest.json"), "utf8")),
  );
  // 保留共享格式中未来新增的元信息，只改写被测试的数据摘要。
  const raw: Record<string, unknown> = JSON.parse(
    await readFile(join(directory, "manifest.json"), "utf8"),
  );
  const entry = manifest.tables.find((item) => item.name === table);
  assert.ok(entry);
  entry.bytes = Buffer.byteLength(bytes);
  entry.rowCount = bytes.split("\n").filter(Boolean).length;
  entry.sha256 = digest(bytes);
  raw.tables = manifest.tables;
  await writeFile(join(directory, "manifest.json"), `${JSON.stringify(raw, null, 2)}\n`);
}

void test(
  "PostgreSQL → SQLite：专用测试库导出、独立导入与逐字段核对",
  { timeout: 300_000 },
  async (t) => {
    // 临时 cwd 没有 .env；所有子进程只能收到本次专用库和临时文件路径。
    const directory = await realpath(await mkdtemp(join(tmpdir(), "fx-postgres-transfer-")));
    // fixture 创建前注册，缺少专用连接或初始化失败时也清理本次临时目录。
    t.after(() => rm(directory, { recursive: true, force: true }));
    const fixture = await createPostgresTransferFixture();
    const archive = join(directory, "snapshot");
    const target = join(directory, "imported.sqlite");
    const before = await postgresTransferFingerprint(fixture.source);
    let invocation = 0;
    const sourceEnvironment = { ...process.env };
    for (const key of [
      "DATABASE_URL",
      "RESTORE_DATABASE_URL",
      "DATABASE_PATH",
      "MIGRATION_SOURCE_DATABASE_URL",
      "POSTGRES_ADMIN_PASSWORD",
      "POSTGRES_APP_PASSWORD",
      "BACKUP_DIRECTORY",
    ])
      delete sourceEnvironment[key];
    // 错误普通配置用于证明 CLI 不会退回业务数据库配置。
    sourceEnvironment.DATABASE_URL = "postgresql://unusable:unusable@127.0.0.1:1/do_not_connect";
    sourceEnvironment.DATABASE_PATH = join(directory, "do-not-open.sqlite");
    function run(args: string[], sourceUrl?: string, reportPath?: string) {
      const report = reportPath ?? join(directory, `report-${++invocation}.json`);
      const env = { ...sourceEnvironment };
      if (sourceUrl) env.MIGRATION_SOURCE_DATABASE_URL = sourceUrl;
      const result = spawnSync(
        process.execPath,
        [
          "--conditions=react-server",
          "--import",
          import.meta.resolve("tsx"),
          join(postgresTransferProject, "scripts/postgres-transfer.ts"),
          ...args,
          "--report",
          report,
        ],
        {
          cwd: directory,
          env: { ...env, TSX_TSCONFIG_PATH: join(postgresTransferProject, "tsconfig.json") },
          encoding: "utf8",
          timeout: 30_000,
        },
      );
      assert.equal(result.error, undefined, "CLI 不应超时或启动失败。");
      return { ...result, report, output: `${result.stdout}${result.stderr}` };
    }
    function runImport(
      mode: "dry-run" | "apply" | "verify",
      source = archive,
      output = target,
      report?: string,
    ) {
      return run(
        ["--import", "--directory", source, "--target", output, `--${mode}`],
        undefined,
        report,
      );
    }
    function safeOutput(output: string) {
      for (const secret of fixture.sensitive.filter(Boolean))
        output = output.replaceAll(secret, "[已隐藏]");
      return output;
    }
    async function sanitized(result: ReturnType<typeof run>) {
      const report = await readFile(result.report, "utf8").catch((error: unknown) => {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") return "";
        throw error;
      });
      if (result.status === 0) assert.ok(report.length > 0, "成功操作必须生成可核对报告。");
      for (const secret of fixture.sensitive.filter(Boolean))
        assert.equal(
          (result.output + report).includes(secret),
          false,
          "CLI 和报告不得包含源字段、连接凭据或密码。",
        );
      if (report) {
        assert.doesNotThrow(() => JSON.parse(report), "报告必须是完整 JSON。");
        assert.equal((await stat(result.report)).mode & 0o777, 0o600);
      }
    }
    async function failed(result: ReturnType<typeof run>, output?: string) {
      assert.notEqual(result.status, 0, "错误输入必须明确失败。");
      await sanitized(result);
      if (output) await absent(output);
    }
    async function copyArchive(label: string) {
      const output = join(directory, label);
      await cp(archive, output, { recursive: true });
      return output;
    }
    async function assertSourceUnchanged() {
      assert.equal(
        await postgresTransferFingerprint(fixture.source),
        before,
        "导出和演练不能改写 PostgreSQL 数据与签名。",
      );
    }

    try {
      await t.test(
        "只读账号导出全部 22 表，文件私有且每个摘要、UTC 毫秒和字段完全匹配",
        async () => {
          const result = run(["--export", "--directory", archive], fixture.readerUrl);
          assert.equal(result.status, 0, safeOutput(result.output));
          await sanitized(result);
          const manifest = manifestSchema.parse(
            JSON.parse(await readFile(join(archive, "manifest.json"), "utf8")),
          );
          assert.equal(manifest.sourceContractSha256, postgresContractHash);
          assert.equal(manifest.targetSchemaSha256, migrationManifest().schemaSha256);
          assert.equal((await stat(archive)).mode & 0o777, 0o700);
          assert.deepEqual(
            (await readdir(archive)).toSorted(),
            [
              ...Object.keys(fixture.rows).map((table) => `${table}.jsonl`),
              "manifest.json",
            ].toSorted(),
          );
          for (const file of await readdir(archive))
            assert.equal((await stat(join(archive, file))).mode & 0o777, 0o600);
          assert.equal(manifest.tables.length, 22);
          for (const [table, rows] of Object.entries(fixture.rows)) {
            const entry = manifest.tables.find((item) => item.name === table);
            assert.ok(entry);
            const bytes = await readFile(join(archive, `${table}.jsonl`));
            assert.equal(entry.bytes, bytes.length);
            assert.equal(entry.sha256, digest(bytes));
            assert.equal(entry.rowCount, rows.length);
            const expected = rows.map((row) =>
              Object.fromEntries(
                Object.entries(row).map(([column, value]) => [
                  column,
                  value !== null &&
                  fixture.tables[table].columns[column].nativeType === "timestamptz"
                    ? new Date(String(value)).getTime()
                    : value,
                ]),
              ),
            );
            assert.deepEqual(
              (await archiveRows(archive, table)).map(orderedRow).toSorted(),
              expected.map(orderedRow).toSorted(),
              `${table} 导出必须逐字段保留。`,
            );
          }
          await assertSourceUnchanged();
          await absent(join(directory, "do-not-open.sqlite"));
        },
      );

      await t.test("dry-run 不创建目标；apply 只发布新文件；verify 不改写目标", async () => {
        const dry = runImport("dry-run");
        assert.equal(dry.status, 0, safeOutput(dry.output));
        await sanitized(dry);
        await absent(target);
        const applied = runImport("apply");
        assert.equal(applied.status, 0, safeOutput(applied.output));
        await sanitized(applied);
        assert.equal((await stat(target)).mode & 0o777, 0o600);
        const originalBytes = await readFile(target);
        const originalStat = await stat(target);
        const verified = runImport("verify");
        assert.equal(verified.status, 0, safeOutput(verified.output));
        await sanitized(verified);
        assert.equal(digest(await readFile(target)), digest(originalBytes));
        assert.equal((await stat(target)).mtimeMs, originalStat.mtimeMs);
        for (const suffix of ["-wal", "-shm", "-journal"]) await absent(`${target}${suffix}`);
        await assertSourceUnchanged();
      });

      await t.test(
        "导入保留现行业务、密码、GA4／百度、OSS 和普通通知，排除评论与本地统计",
        async () => {
          const client = new Sqlite(target, { readonly: true, fileMustExist: true });
          try {
            const archivedIds = new Set(
              fixture.rows.notification
                .filter((row) =>
                  ["backup", "comment", "schedule-error", "published"].includes(String(row.kind)),
                )
                .map((row) => row.id),
            );
            for (const [table, rows] of Object.entries(fixture.rows)) {
              if (removedTables.has(table)) {
                assert.equal(
                  client
                    .prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?")
                    .get(table),
                  undefined,
                );
                continue;
              }
              const actual = client
                .prepare<[], Record<string, unknown>>(`SELECT * FROM ${quoted(table)}`)
                .all();
              let retained = resetTables.has(table) ? [] : rows;
              if (table === "notification")
                retained = rows.filter(
                  (row) =>
                    !["backup", "comment", "schedule-error", "published"].includes(
                      String(row.kind),
                    ),
                );
              if (table === "notification_read")
                retained = rows.filter((row) => !archivedIds.has(row.notificationId));
              const expected = retained.map((row) =>
                Object.fromEntries(
                  Object.entries(row)
                    .filter(
                      ([column]) =>
                        (table !== "site_setting" || !removedFields.has(column)) &&
                        (table !== "post" || column !== "scheduledFor"),
                    )
                    .map(([column, value]) => [
                      column,
                      table === "post" && column === "status" && value === "scheduled"
                        ? "draft"
                        : table === "operation_setting" && column === "autoBackup"
                          ? 0
                          : table === "operation_setting" && column === "schedulerLastRunAt"
                            ? null
                            : value !== null &&
                                fixture.tables[table].columns[column].nativeType === "timestamptz"
                              ? new Date(String(value)).getTime()
                              : value,
                    ]),
                ),
              );
              assert.deepEqual(
                actual.map((row) => orderedRow(row)).toSorted(),
                expected.map(orderedRow).toSorted(),
                `${table} 目标逐字段核对。`,
              );
            }
            assert.equal(client.pragma("integrity_check", { simple: true }), "ok");
            assert.deepEqual(client.pragma("foreign_key_check"), []);
            assert.equal(
              client
                .prepare<[string], { expectedBytes: number }>(
                  "SELECT expectedBytes FROM media WHERE id=?",
                )
                .get(fixture.ids.media)?.expectedBytes,
              5_000_000_000,
            );
          } finally {
            client.close();
          }
          assert.equal(
            (await archiveRows(archive, "backup_run")).length,
            2,
            "旧 PostgreSQL 备份保留完整历史归档。",
          );
          assert.equal(
            (await archiveRows(archive, "backup_run")).filter((row) => row.status === "running")
              .length,
            1,
          );
        },
      );

      await t.test("原密码重新登录成功，原会话已撤销且限流重置", async () => {
        closeDatabase();
        const previousPath = process.env.DATABASE_PATH;
        process.env.DATABASE_PATH = target;
        try {
          const { getSession, logout } = await import("../lib/auth/service");
          const { loginToken: login } = await import("./helpers/sqlite");
          process.env.BETTER_AUTH_SECRET = "sqlite-test-only-better-auth-secret-32-chars";
          process.env.APP_ORIGIN = "https://postgres-transfer-test.example";
          assert.equal(getSession(fixture.originalSessionToken), null);
          const token = await login(
            { username: "import_admin", password: fixture.password },
            undefined,
          );
          assert.ok(token, "数据库切换后原密码必须有效。");
          assert.deepEqual(getSession(token), { adminId: 1, username: "import_admin" });
          await logout(token);
          assert.equal(getSession(token), null);
        } finally {
          closeDatabase();
          if (previousPath === undefined) delete process.env.DATABASE_PATH;
          else process.env.DATABASE_PATH = previousPath;
        }
      });

      await t.test("已有目标及空文件拒绝覆盖，已有报告也保持原样", async () => {
        const beforeTarget = digest(await readFile(target));
        await failed(runImport("apply"));
        assert.equal(digest(await readFile(target)), beforeTarget);
        const empty = join(directory, "empty.sqlite");
        await writeFile(empty, "", { mode: 0o600 });
        await failed(runImport("apply", archive, empty));
        assert.equal((await stat(empty)).size, 0);
        const report = join(directory, "existing-report.json");
        await writeFile(report, '{"kept":true}\n', { mode: 0o600 });
        const output = join(directory, "report-collision.sqlite");
        await failed(runImport("apply", archive, output, report), output);
        assert.equal(await readFile(report, "utf8"), '{"kept":true}\n');
      });

      await t.test("归档内目标、报告路径别名与未停止的 WAL 目标拒绝", async () => {
        const original = digest(await readFile(join(archive, "post.jsonl")));
        await failed(runImport("apply", archive, join(archive, "post.jsonl")));
        assert.equal(digest(await readFile(join(archive, "post.jsonl"))), original);
        const output = join(directory, "report-inside-archive.sqlite");
        await failed(runImport("apply", archive, output, join(archive, "new-report.json")), output);
        await absent(join(archive, "new-report.json"));
        const collision = join(directory, "same-target-report.sqlite");
        await failed(runImport("apply", archive, collision, collision), collision);
        const snapshot = join(directory, "wal-present.sqlite");
        await cp(target, snapshot);
        const bytes = digest(await readFile(snapshot));
        await writeFile(`${snapshot}-wal`, "独立测试用 WAL 标记", { mode: 0o600 });
        await failed(runImport("verify", archive, snapshot));
        assert.equal(digest(await readFile(snapshot)), bytes);
      });

      await t.test("篡改文件、缺文件和软链接档案均拒绝，失败不留下 SQLite 目标", async () => {
        const changed = await copyArchive("bad-digest");
        await writeFile(join(changed, "post.jsonl"), "sensitive-invalid-content\n", { flag: "a" });
        await failed(
          runImport("apply", changed, join(directory, "bad-digest.sqlite")),
          join(directory, "bad-digest.sqlite"),
        );
        const partial = await copyArchive("partial");
        await rm(join(partial, "post.jsonl"));
        await failed(
          runImport("apply", partial, join(directory, "partial.sqlite")),
          join(directory, "partial.sqlite"),
        );
        const linked = await copyArchive("linked");
        await rm(join(linked, "post.jsonl"));
        await symlink(join(archive, "post.jsonl"), join(linked, "post.jsonl"));
        await failed(
          runImport("apply", linked, join(directory, "linked.sqlite")),
          join(directory, "linked.sqlite"),
        );
      });

      await t.test("未知档案格式版本、源 contract 和目标 schema 被拒绝", async () => {
        for (const [field, value] of [
          ["version", 2],
          ["format", "fuxiaochen-sqlite-backup"],
          ["sourceContractSha256", "0".repeat(64)],
          ["targetSchemaSha256", "0".repeat(64)],
        ] as const) {
          const changed = await copyArchive(`bad-${field}`);
          const manifest = JSON.parse(await readFile(join(changed, "manifest.json"), "utf8"));
          manifest[field] = value;
          await writeFile(join(changed, "manifest.json"), JSON.stringify(manifest));
          const output = join(directory, `bad-${field}.sqlite`);
          await failed(runImport("apply", changed, output), output);
        }
      });

      await t.test("摘要合法但整数溢出、非法正文、重复唯一值及孤儿关系仍拒绝或回滚", async () => {
        const cases: {
          label: string;
          table: string;
          change: (rows: z.infer<typeof rowSchema>[]) => void;
        }[] = [
          {
            label: "overflow",
            table: "media",
            change: (rows) => {
              rows[0].expectedBytes = Number.MAX_SAFE_INTEGER + 1;
            },
          },
          {
            label: "bad-content",
            table: "post",
            change: (rows) => {
              rows[0].content = "sensitive-invalid-content";
            },
          },
          {
            label: "duplicate",
            table: "post",
            change: (rows) => {
              rows[1].slug = rows[0].slug;
            },
          },
          {
            label: "orphan",
            table: "comment",
            change: (rows) => {
              rows[0].parentId = "d185f642-e6bb-40c0-8658-3b5b34b55c3b";
            },
          },
          {
            label: "orphan-category",
            table: "post",
            change: (rows) => {
              rows[0].categoryId = "d185f642-e6bb-40c0-8658-3b5b34b55c3b";
            },
          },
          {
            label: "orphan-read",
            table: "notification_read",
            change: (rows) => {
              rows[0].adminId = 99;
            },
          },
        ];
        for (const item of cases) {
          const changed = await copyArchive(item.label);
          await mutateArchive(changed, item.table, item.change);
          const output = join(directory, `${item.label}.sqlite`);
          await failed(runImport("dry-run", changed, output), output);
          await failed(runImport("apply", changed, output), output);
          for (const suffix of ["-wal", "-shm", "-journal"]) await absent(`${output}${suffix}`);
        }
        assert.equal(
          (await readdir(directory)).some((name) => name.startsWith(".postgres-sqlite-transfer-")),
          false,
          "失败临时数据库必须清理。",
        );
      });

      await t.test("原始 JSON 小数整数、亚毫秒日期与重复字段即使摘要正确也拒绝", async () => {
        const cases = [
          {
            label: "raw-integer",
            table: "media",
            change: (text: string) =>
              text.replace(/"expectedBytes":\d+/, '"expectedBytes":1.0000000000000001'),
          },
          {
            label: "raw-date",
            table: "admin",
            change: (text: string) => text.replace(/("createdAt":)(\d+)/, "$1$2.0000001"),
          },
          {
            label: "duplicate-key",
            table: "admin",
            change: (text: string) => text.replace(/("id":1)/, "$1,$1"),
          },
        ];
        for (const item of cases) {
          const changed = await copyArchive(item.label);
          const original = await readFile(join(changed, `${item.table}.jsonl`), "utf8");
          // 必须改原始 token；经过 JSON.parse/stringify 会提前丢失被测试的小数精度或重复 key。
          const bytes = item.change(original);
          assert.notEqual(bytes, original, "用例必须实际改变原始 JSONL 文本。");
          const parsed = bytes
            .trimEnd()
            .split("\n")
            .map((line) => rowSchema.parse(JSON.parse(line)));
          if (item.label === "raw-integer")
            assert.equal(parsed[0].expectedBytes, 1, "重现小数被舍入成安全整数。");
          if (item.label === "raw-date")
            assert.equal(
              parsed[0].createdAt,
              new Date(fixture.at).getTime(),
              "重现日期亚毫秒被舍入。",
            );
          await writeArchiveBytes(changed, item.table, bytes);
          const output = join(directory, `${item.label}.sqlite`);
          await failed(runImport("dry-run", changed, output), output);
          await failed(runImport("apply", changed, output), output);
        }
      });

      await t.test("核对能够发现记录数不变的内容变化，且不会修改错误目标", async () => {
        const changed = join(directory, "modified.sqlite");
        await cp(target, changed);
        const client = new Sqlite(changed);
        try {
          client
            .prepare("UPDATE post SET title=? WHERE id=?")
            .run("sensitive-invalid-content", fixture.ids.post);
        } finally {
          client.close();
        }
        const original = digest(await readFile(changed));
        await failed(runImport("verify", archive, changed));
        assert.equal(digest(await readFile(changed)), original);
      });

      await t.test("导出不隐式使用 DATABASE_URL，连接错误不输出密码", async () => {
        const noSource = run(["--export", "--directory", join(directory, "no-source")]);
        await failed(noSource);
        const invalid = run(
          ["--export", "--directory", join(directory, "invalid-source")],
          "postgresql://private-user:sensitive-invalid-content@127.0.0.1:1/fx_transfer_test_invalid",
        );
        await failed(invalid);
        await absent(join(directory, "do-not-open.sqlite"));
      });

      await t.test("源整数溢出和亚毫秒时间明确失败，完整档案不会发布", async () => {
        await fixture.source.query('UPDATE media SET "expectedBytes"=$1 WHERE id=$2', [
          "9007199254740992",
          fixture.ids.media,
        ]);
        try {
          const changed = join(directory, "source-overflow");
          await failed(run(["--export", "--directory", changed], fixture.readerUrl));
          await absent(join(changed, "manifest.json"));
        } finally {
          await fixture.source.query('UPDATE media SET "expectedBytes"=$1 WHERE id=$2', [
            5_000_000_000,
            fixture.ids.media,
          ]);
        }
        await fixture.source.query('UPDATE admin SET "createdAt"=$1::timestamptz WHERE id=1', [
          "2026-10-04T15:59:59.123456Z",
        ]);
        try {
          const changed = join(directory, "source-precision");
          await failed(run(["--export", "--directory", changed], fixture.readerUrl));
          await absent(join(changed, "manifest.json"));
        } finally {
          await fixture.source.query('UPDATE admin SET "createdAt"=$1::timestamptz WHERE id=1', [
            fixture.at,
          ]);
        }
        await assertSourceUnchanged();
      });

      await t.test("源字段类型和 contract marker 不匹配拒绝导出", async () => {
        await fixture.source.query("ALTER TABLE media ALTER COLUMN name TYPE varchar");
        try {
          await failed(
            run(["--export", "--directory", join(directory, "source-type")], fixture.readerUrl),
          );
        } finally {
          await fixture.source.query("ALTER TABLE media ALTER COLUMN name TYPE text");
        }
        await fixture.source.query(
          "UPDATE prisma_contract.marker SET core_hash=$1 WHERE space='app'",
          ["0".repeat(64)],
        );
        try {
          await failed(
            run(["--export", "--directory", join(directory, "source-contract")], fixture.readerUrl),
          );
        } finally {
          await fixture.source.query(
            "UPDATE prisma_contract.marker SET core_hash=$1 WHERE space='app'",
            [postgresContractHash],
          );
        }
        await assertSourceUnchanged();
      });

      await t.test("空业务源库拒绝，避免把错误源库当作成功迁移", async () => {
        const empty = await createPostgresTransferFixture({ empty: true });
        try {
          await failed(
            run(["--export", "--directory", join(directory, "empty-source")], empty.readerUrl),
          );
        } finally {
          await empty.cleanup();
        }
      });
    } finally {
      closeDatabase();
      await fixture.cleanup();
    }
  },
);
