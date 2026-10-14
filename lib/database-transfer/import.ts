import "server-only";
import Sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { link, lstat, mkdtemp, realpath, rm } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

import { syncAdminAccount } from "../auth/accounts";
import { migrateDatabase, verifyDatabase } from "../database/migrations";
import {
  assertArchiveUnchanged,
  canonicalRow,
  digestRows,
  loadArchive,
  tableSpecs,
  targetTableSpec,
  transferMigrationsFolder,
  TransferError,
  type Row,
} from "./format";

export type ImportMode = "dry-run" | "apply" | "verify";
type Spec = (typeof tableSpecs)[number];
type Digest = ReturnType<typeof digestRows>;
export type TransferReport = {
  format: "fuxiaochen-postgres-sqlite-transfer-report";
  version: 1;
  mode: ImportMode;
  archiveManifestSha256: string;
  sourceContractSha256: string;
  targetSchemaSha256: string;
  targetChecked: boolean;
  verified: boolean;
  policies: string[];
  tables: {
    name: string;
    disposition: "omitted" | "mapped";
    source: Digest;
    planned: Digest;
    target: Digest | null;
  }[];
};

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new TransferError(message);
}

function missing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function absent(path: string): Promise<void> {
  try {
    await lstat(path);
  } catch (error) {
    if (missing(error)) return;
    throw error;
  }
  throw new TransferError("目标文件或日志已存在，已拒绝覆盖。");
}

async function canonicalOutputPath(value: string): Promise<string> {
  ensure(value?.trim() && isAbsolute(value), "目标和报告必须使用明确的绝对文件路径。");
  const path = resolve(value);
  // 规范化父目录，让同一目录的符号链接别名不能绕过独立路径检查。
  return join(await realpath(dirname(path)), basename(path));
}

function inDirectory(path: string, directory: string): boolean {
  const child = relative(directory, path);
  return child === "" || (!child.startsWith(`..${sep}`) && child !== ".." && !isAbsolute(child));
}

function digestBytes(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function noSnapshotLogs(path: string): void {
  // 核对只接受停止后的独立文件，不打开正在变化的 WAL/journal 快照。
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    try {
      lstatSync(`${path}${suffix}`);
    } catch (error) {
      if (missing(error)) continue;
      throw error;
    }
    throw new TransferError("核对目标仍存在 WAL、共享内存或 journal，请先停止使用该数据库。");
  }
}

function identifier(value: string): string {
  // 所有表和字段仅来自共享 schema 白名单，不接受归档内自定义 SQL。
  return `"${value.replaceAll('"', '""')}"`;
}

function sqlRows(client: Sqlite.Database, spec: Spec): Iterable<Row> {
  const columns = spec.columns.map((column) => identifier(column.name)).join(", ");
  const order = spec.primaryKey.map((name) => {
    const column = spec.columns.find((candidate) => candidate.name === name)!;
    return `${identifier(name)}${column.type === "text" ? " COLLATE BINARY" : ""}`;
  });
  const statement = client.prepare<[], Record<string, unknown>>(
    `SELECT ${columns} FROM ${identifier(spec.name)} ORDER BY ${order.join(", ")}`,
  );
  statement.safeIntegers(true);
  return {
    *[Symbol.iterator]() {
      for (const raw of statement.iterate()) {
        const row: Row = {};
        for (const column of spec.columns) {
          const value = raw[column.name];
          if (typeof value === "bigint") {
            const number = Number(value);
            ensure(
              Number.isSafeInteger(number) && BigInt(number) === value,
              "目标数据库包含不安全的整数。",
            );
            row[column.name] = number;
          } else {
            ensure(
              value === null || typeof value === "number" || typeof value === "string",
              "目标数据库字段类型无法核对。",
            );
            row[column.name] = value;
          }
        }
        yield row;
      }
    },
  };
}

function verifyTable(client: Sqlite.Database, spec: Spec, expected: Iterable<Row>): Digest {
  const wanted = expected[Symbol.iterator]();
  const actual = sqlRows(client, spec);
  const checked = {
    *[Symbol.iterator]() {
      try {
        for (const row of actual) {
          const next = wanted.next();
          ensure(
            !next.done && canonicalRow(spec, row) === canonicalRow(spec, next.value),
            `${spec.name} 的目标记录字段与迁移归档映射不一致。`,
          );
          yield row;
        }
        ensure(wanted.next().done, `${spec.name} 的目标记录数量与迁移归档映射不一致。`);
      } finally {
        wanted.return?.();
      }
    },
  };
  return digestRows(spec, checked);
}

const policies = [
  "保留现行业务记录、原始 ID、关联、密码哈希和 UTC 毫秒时间。",
  "评论、本地访问统计及对应限流表仅保留源归档，不导入目标库。",
  "site_setting 跳过评论开关与本地统计字段，GA4／百度配置保留。",
  "评论通知及其已读关联仅保留源归档，不导入目标库。",
  "登录会话及登录、媒体临时限流计数清空。",
  "PostgreSQL backup_run、backup 通知及其已读关联仅保留在迁移归档。",
  "operation_setting.autoBackup 设为 0，schedulerLastRunAt 设为 NULL；其余字段保留。",
  "仅创建独立的新 SQLite 文件，不覆盖任何已有数据库或归档。",
];

function verifyAuthMapping(client: Sqlite.Database) {
  // 新认证表是旧管理员的确定映射；独立核对，防止旧表正确但实际登录凭据漂移。
  const matched = client
    .prepare(`
    SELECT 1 FROM admin a
    JOIN auth_user u ON u.id=a.id
    JOIN auth_account c ON c.userId=u.id
    WHERE a.id=1 AND u.name=a.username AND u.username=a.username
      AND u.email='admin@localhost.invalid' AND u.emailVerified=0
      AND u.createdAt=a.createdAt AND u.updatedAt=a.updatedAt
      AND c.id=1 AND c.accountId='1' AND c.providerId='credential'
      AND c.password=a.passwordHash AND c.createdAt=a.createdAt AND c.updatedAt=a.updatedAt
  `)
    .get();
  ensure(matched, "Better Auth 管理员映射与迁移归档不一致。");
  for (const [table, expected] of [
    ["auth_user", 1],
    ["auth_account", 1],
    ["auth_session", 0],
    ["auth_verification", 0],
    ["auth_passkey", 0],
  ] as const) {
    const count = client
      .prepare<[], { total: number }>(`SELECT COUNT(*) AS total FROM ${table}`)
      .get()!.total;
    ensure(count === expected, "Better Auth 认证记录数量与离线导入目标不一致。");
  }
}

export async function importArchive(options: {
  directory: string;
  targetPath: string;
  reportPath: string;
  mode: ImportMode;
}): Promise<TransferReport> {
  ensure(["dry-run", "apply", "verify"].includes(options.mode), "迁移模式无效。");
  // 全部归档数据先完成格式、类型、业务规则和摘要预检；dry-run 不打开目标库。
  const archive = await loadArchive(options.directory);
  const target = await canonicalOutputPath(options.targetPath);
  const reportPath = await canonicalOutputPath(options.reportPath);
  ensure(
    !inDirectory(target, archive.directory) && !inDirectory(reportPath, archive.directory),
    "数据库和报告必须位于迁移归档目录之外。",
  );
  const targetPaths = [target, `${target}-wal`, `${target}-shm`, `${target}-journal`];
  ensure(!targetPaths.includes(reportPath), "报告不能使用目标数据库或日志的路径。");
  const report: TransferReport = {
    format: "fuxiaochen-postgres-sqlite-transfer-report",
    version: 1,
    mode: options.mode,
    archiveManifestSha256: archive.manifestSha256,
    sourceContractSha256: archive.manifest.sourceContractSha256,
    targetSchemaSha256: archive.manifest.targetSchemaSha256,
    targetChecked: options.mode !== "dry-run",
    verified: options.mode !== "dry-run",
    policies,
    tables: tableSpecs.map((spec) => ({
      name: spec.name,
      disposition: targetTableSpec(spec.name) ? "mapped" : "omitted",
      source: digestRows(spec, archive.rows(spec.name)),
      planned: digestRows(targetTableSpec(spec.name) ?? spec, archive.plannedRows(spec.name)),
      target: null,
    })),
  };
  let temporaryDirectory: string | undefined;
  let published = false;
  let client: Sqlite.Database | undefined;
  let snapshot: ReturnType<typeof readOnlySnapshot> | undefined;
  const output = reserveReport(reportPath);
  try {
    if (options.mode === "dry-run") {
      await assertArchiveUnchanged(archive);
      output.write(report);
      output.close();
      return report;
    }
    if (options.mode === "verify") {
      snapshot = readOnlySnapshot(target);
      client = snapshot.client;
      verifyDatabase(client, { migrationsFolder: transferMigrationsFolder });
      for (const [index, source] of tableSpecs.entries()) {
        const spec = targetTableSpec(source.name);
        if (spec)
          report.tables[index].target = verifyTable(client, spec, archive.plannedRows(spec.name));
      }
      verifyAuthMapping(client);
      await assertArchiveUnchanged(archive);
      snapshot.unchanged();
      output.write(report);
      output.close();
      return report;
    }
    for (const path of targetPaths) await absent(path);
    temporaryDirectory = await mkdtemp(join(dirname(target), ".postgres-sqlite-transfer-"));
    const temporaryPath = join(temporaryDirectory, "database.sqlite");
    closeSync(openSync(temporaryPath, "wx", 0o600));
    client = new Sqlite(temporaryPath, { fileMustExist: true, timeout: 5_000 });
    client.pragma("foreign_keys = ON");
    client.pragma("journal_mode = WAL");
    client.pragma("synchronous = FULL");
    migrateDatabase(client, { migrationsFolder: transferMigrationsFolder });
    const database = client;
    database
      .transaction(() => {
        // 源记录顺序未按依赖排列，延迟外键到提交并显式核对全部关联。
        database.pragma("defer_foreign_keys = ON");
        for (const source of tableSpecs) {
          const spec = targetTableSpec(source.name);
          if (!spec) continue;
          const statement = database.prepare(
            `INSERT INTO ${identifier(spec.name)} (${spec.columns.map((column) => identifier(column.name)).join(", ")}) VALUES (${spec.columns.map(() => "?").join(", ")})`,
          );
          for (const row of archive.plannedRows(spec.name))
            statement.run(...spec.columns.map((column) => row[column.name]));
        }
        syncAdminAccount(drizzle(database));
        verifyDatabase(database, { migrationsFolder: transferMigrationsFolder });
        for (const [index, source] of tableSpecs.entries()) {
          const spec = targetTableSpec(source.name);
          if (!spec) continue;
          const checked = verifyTable(database, spec, archive.plannedRows(spec.name));
          ensure(
            checked.rowCount === report.tables[index].planned.rowCount &&
              checked.sha256 === report.tables[index].planned.sha256 &&
              JSON.stringify(checked.fields) ===
                JSON.stringify(report.tables[index].planned.fields),
            `${spec.name} 的目标数量或摘要与预检结果不一致。`,
          );
          report.tables[index].target = checked;
        }
        verifyAuthMapping(database);
      })
      .immediate();
    database.close();
    client = undefined;
    noSnapshotLogs(temporaryPath);
    await assertArchiveUnchanged(archive);
    // 报告先写入并 fsync，失败时丢弃临时库；发布目标之后没有会失败的报告写入。
    output.write(report);
    output.close();
    for (const path of targetPaths) await absent(path);
    // 硬链接发布具有 EXCL 语义，检查后的竞争也不能覆盖用户已有文件。
    await link(temporaryPath, target);
    published = true;
    return report;
  } catch (error) {
    await output.discard();
    if (error instanceof TransferError) throw error;
    throw new TransferError("SQLite 迁移或核对失败，请检查归档、独立文件路径、权限与迁移版本。");
  } finally {
    if (snapshot) snapshot.close();
    else if (client?.open) client.close();
    if (temporaryDirectory) {
      // 发布完成后的清理失败不能把已交付的新库误报为未完成；不删除已发布的文件。
      await rm(temporaryDirectory, { recursive: true, force: true }).catch((error: unknown) => {
        if (!published) throw error;
      });
    }
  }
}

function readOnlySnapshot(path: string) {
  noSnapshotLogs(path);
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = fstatSync(fd);
    ensure(before.isFile(), "核对目标必须是独立的普通 SQLite 文件。");
    const bytes = readFileSync(fd);
    const sha256 = digestBytes(bytes);
    ensure(
      bytes.subarray(0, 16).equals(Buffer.from("SQLite format 3\0")),
      "核对目标不是 SQLite 文件。",
    );
    ensure(
      bytes.length >= 100 && [1, 2].includes(bytes[18]) && [1, 2].includes(bytes[19]),
      "核对目标文件格式版本无效。",
    );
    const after = fstatSync(fd);
    ensure(
      before.size === after.size &&
        before.mtimeMs === after.mtimeMs &&
        before.ctimeMs === after.ctimeMs,
      "核对目标在读取期间发生变化。",
    );
    // SQLite deserialize 不支持 WAL header；只调整内存副本，原文件和日志完全不写入。
    // https://sqlite.org/c3ref/deserialize.html
    const snapshot = Buffer.from(bytes);
    snapshot[18] = 1;
    snapshot[19] = 1;
    const client = new Sqlite(snapshot, { readonly: true });
    return {
      client,
      unchanged() {
        noSnapshotLogs(path);
        const checkFd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
        let checkedSha256: string;
        try {
          const identity = fstatSync(checkFd);
          ensure(
            identity.dev === before.dev && identity.ino === before.ino,
            "核对目标文件已被替换。",
          );
          checkedSha256 = digestBytes(readFileSync(checkFd));
          const afterCheck = fstatSync(checkFd);
          ensure(
            afterCheck.size === before.size &&
              afterCheck.mtimeMs === before.mtimeMs &&
              afterCheck.ctimeMs === before.ctimeMs,
            "核对目标在最终读取期间发生变化。",
          );
        } finally {
          closeSync(checkFd);
        }
        const now = lstatSync(path);
        noSnapshotLogs(path);
        ensure(
          now.isFile() &&
            now.dev === before.dev &&
            now.ino === before.ino &&
            now.size === before.size &&
            now.mtimeMs === before.mtimeMs &&
            now.ctimeMs === before.ctimeMs &&
            checkedSha256 === sha256,
          "核对目标在处理期间发生变化。",
        );
      },
      close() {
        client.close();
        closeSync(fd);
      },
    };
  } catch (error) {
    closeSync(fd);
    throw error;
  }
}

function reserveReport(path: string) {
  // 在数据库写入前独占预留；即使已有报告是符号链接也不会被跟随或覆盖。
  const fd = openSync(
    path,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600,
  );
  const identity = fstatSync(fd);
  let closed = false;
  return {
    write(report: unknown) {
      writeFileSync(fd, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8" });
      fsyncSync(fd);
    },
    close() {
      if (!closed) {
        closeSync(fd);
        closed = true;
      }
    },
    async discard() {
      this.close();
      const current = await lstat(path).catch((error: unknown) => {
        if (missing(error)) return null;
        throw error;
      });
      if (current?.isFile() && current.dev === identity.dev && current.ino === identity.ino)
        await rm(path);
    },
  };
}
