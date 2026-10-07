import "server-only";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { realpath, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { z } from "zod";

import contractJson from "@/generated/prisma/contract.json";
import { usernameSchema } from "@/lib/auth/schema";
import { releaseSchema, releaseStatusSchema } from "@/lib/changelog/schema";
import { commentStatusSchema } from "@/lib/comments/schema";
import { databaseUrl, requiredDatabaseUrl } from "@/lib/database-url";
import { friendSchema } from "@/lib/friends-links/schema";
import { mediaKindSchema } from "@/lib/media/schema";
import { documentText, readDocument } from "@/lib/posts/document";
import { postSchema } from "@/lib/posts/schema";
import { settingsSchema } from "@/lib/settings/schema";
import { categorySchema, tagSchema, taxonomyNameKey } from "@/lib/taxonomy/schema";
import { writeTransaction, type DatabaseTransaction } from "@/prisma/db";

import { fileDigest } from "./backup-files";

export class SqliteImportError extends Error {}
export type SqliteImportMode = "dry-run" | "apply" | "verify";
type Value = string | number | Date | null;
type Row = Record<string, Value>;
type Column = { nativeType: string; nullable: boolean };
type Table = {
  columns: Record<string, Column>;
  primaryKey: { columns: string[] };
  uniques: { columns: string[] }[];
  foreignKeys: {
    source: { columns: string[] };
    target: { tableName: string; columns: string[] };
  }[];
};

// 顺序满足外键依赖；评论另按父子关系排序。名称只来自此白名单。
const models = {
  admin: "Admin",
  category: "Category",
  tag: "Tag",
  site_setting: "SiteSetting",
  social_account: "SocialAccount",
  post: "Post",
  post_tag: "PostTag",
  media: "Media",
  comment: "Comment",
  friend_link: "FriendLink",
  release_log: "ReleaseLog",
  visit_session: "VisitSession",
  page_visit: "PageVisit",
  notification: "Notification",
  notification_read: "NotificationRead",
  operation_setting: "OperationSetting",
  session: "Session",
  login_rate_limit: "LoginRateLimit",
  media_upload_limit: "MediaUploadLimit",
  comment_rate_limit: "CommentRateLimit",
  analytics_rate_limit: "AnalyticsRateLimit",
  backup_run: "BackupRun",
} as const;
type TableName = keyof typeof models;
type ModelName = (typeof models)[TableName];
function isTableName(name: string): name is TableName {
  return Object.hasOwn(models, name);
}
const tableNames = Object.keys(models).filter(isTableName);
const omitted = new Set<TableName>([
  "session",
  "login_rate_limit",
  "media_upload_limit",
  "comment_rate_limit",
  "analytics_rate_limit",
  "backup_run",
]);
const internalTables = new Set(["_prisma_ledger", "_prisma_marker", "sqlite_sequence"]);
const tables = contractJson.storage.namespaces.public.entries.table as Record<TableName, Table>;
const defaults: Partial<Record<TableName, Row>> = {
  post: { summary: "", isFeatured: 0, featuredOrder: 0 },
  site_setting: {
    seoDescription: null,
    ogImageUrl: null,
    googleVerification: null,
    bingVerification: null,
    baiduVerification: null,
  },
  release_log: { status: "published", revision: 1, updatedAt: null },
};
const uuidTables = new Set<TableName>([
  "category",
  "tag",
  "social_account",
  "post",
  "media",
  "comment",
  "friend_link",
  "release_log",
  "visit_session",
  "page_visit",
]);

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new SqliteImportError(message);
}
function validate<T>(schema: z.ZodType<T>, value: unknown, location: string): T {
  const result = schema.safeParse(value);
  ensure(result.success, `${location} 未通过当前业务校验。`);
  return result.data;
}
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => {
    if (item && typeof item === "object" && !Array.isArray(item))
      return Object.fromEntries(Object.entries(item).toSorted(([a], [b]) => a.localeCompare(b)));
    return item;
  });
}
function digest(rows: Row[]) {
  return createHash("sha256")
    .update(canonical(rows.map(canonical).toSorted()))
    .digest("hex");
}
function key(row: Row, columns: string[]) {
  return canonical(columns.map((column) => row[column]));
}
function boolean(value: Value | undefined) {
  ensure(value === 0 || value === 1, "源库包含无效的布尔整数。");
  return value === 1;
}
function normalize(value: unknown, column: Column, location: string): Value {
  if (value === null) {
    ensure(column.nullable, `${location} 不能为 NULL。`);
    return null;
  }
  if (column.nativeType === "int8") {
    const number = typeof value === "bigint" ? Number(value) : value;
    ensure(
      typeof number === "number" && Number.isSafeInteger(number),
      `${location} 超出安全整数范围。`,
    );
    return number;
  }
  ensure(typeof value === "string", `${location} 类型不匹配。`);
  if (column.nativeType === "timestamptz") {
    ensure(
      /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value),
      `${location} 必须是明确的 UTC ISO 时间。`,
    );
    const date = new Date(value);
    ensure(
      Number.isFinite(date.getTime()) && date.toISOString() === value,
      `${location} 时间无效。`,
    );
    return date;
  }
  ensure(column.nativeType === "text", `${location} 使用尚未适配的类型。`);
  return value;
}

function checkRelations(data: Map<TableName, Row[]>) {
  for (const name of tableNames) {
    const rows = data.get(name)!;
    for (const columns of [
      tables[name].primaryKey.columns,
      ...tables[name].uniques.map((u) => u.columns),
    ]) {
      const used = new Set<string>();
      for (const row of rows) {
        if (columns.some((column) => row[column] === null)) continue;
        const identity = key(row, columns);
        ensure(!used.has(identity), `${name} 包含重复的主键或唯一字段。`);
        used.add(identity);
      }
    }
    for (const relation of tables[name].foreignKeys) {
      ensure(isTableName(relation.target.tableName), `${name} 存在未适配的外键。`);
      const referenced = data.get(relation.target.tableName);
      ensure(referenced, `${name} 存在未适配的外键。`);
      const identities = new Set(referenced.map((row) => key(row, relation.target.columns)));
      for (const row of rows) {
        if (relation.source.columns.some((column) => row[column] === null)) continue;
        ensure(identities.has(key(row, relation.source.columns)), `${name} 包含悬空关系。`);
      }
    }
  }
}

function checkBusinessData(data: Map<TableName, Row[]>) {
  const admins = data.get("admin")!;
  ensure(admins.length === 1 && admins[0].id === 1, "源库必须包含唯一的 id=1 管理员。");
  validate(usernameSchema, admins[0].username, "admin.username");
  ensure(
    typeof admins[0].passwordHash === "string" && admins[0].passwordHash.startsWith("$argon2id$"),
    "源库管理员密码哈希格式不受支持。",
  );
  for (const name of uuidTables)
    for (const row of data.get(name)!) validate(z.uuid(), row.id, `${name}.id`);
  for (const name of ["category", "tag"] as const)
    for (const row of data.get(name)!) {
      const parsed = validate(name === "category" ? categorySchema : tagSchema, row, name);
      ensure(row.nameKey === taxonomyNameKey(parsed.name), `${name} 名称规范化值不一致。`);
    }
  for (const row of data.get("post")!) {
    validate(
      postSchema,
      {
        ...row,
        isFeatured: boolean(row.isFeatured),
        scheduledFor: row.scheduledFor instanceof Date ? row.scheduledFor.toISOString() : null,
        tagIds: data
          .get("post_tag")!
          .filter((link) => link.postId === row.id)
          .map((link) => link.tagId),
      },
      "post",
    );
    ensure(typeof row.content === "string", "post 正文类型无效。");
    ensure(
      JSON.parse(row.content).text === documentText(readDocument(row.content)),
      "post 正文与搜索文本不一致。",
    );
    ensure(typeof row.version === "number" && row.version >= 1, "post 版本无效。");
    if (row.status === "published")
      ensure(row.publishedAt && row.slugLockedAt, "post 已发布文章缺少发布时间或 slug 锁定时间。");
  }
  for (const row of data.get("site_setting")!) {
    const { id, updatedAt: _updatedAt, localAnalyticsStartedAt: _startedAt, ...fields } = row;
    ensure(id === 1, "site_setting id 无效。");
    const seo = Object.fromEntries(
      Object.keys(defaults.site_setting!).map((column) => [column, row[column] ?? ""]),
    );
    validate(
      settingsSchema,
      {
        ...fields,
        ...seo,
        enableComments: boolean(row.enableComments),
        localAnalyticsEnabled:
          row.localAnalyticsEnabled === null ? false : boolean(row.localAnalyticsEnabled),
        googleEnabled: boolean(row.googleEnabled),
        baiduEnabled: boolean(row.baiduEnabled),
        socials: data
          .get("social_account")!
          .filter((social) => social.settingId === id)
          .map(({ settingId: _settingId, position: _position, ...social }) => ({
            ...social,
            enabled: boolean(social.enabled),
          })),
      },
      "site_setting",
    );
  }
  for (const row of data.get("release_log")!) {
    validate(
      releaseSchema,
      {
        version: row.version,
        title: row.title,
        type: row.type,
        changes: JSON.parse(String(row.changes)),
      },
      "release_log",
    );
    validate(releaseStatusSchema, row.status, "release_log.status");
    ensure(typeof row.revision === "number" && row.revision >= 1, "release_log 版本无效。");
  }
  for (const row of data.get("friend_link")!)
    validate(
      friendSchema,
      {
        name: row.name,
        url: row.url,
        avatar: row.avatar,
        description: row.description,
        category: row.category,
        status: row.status,
        enabled: boolean(row.enabled),
      },
      "friend_link",
    );
  for (const row of data.get("comment")!) {
    validate(commentStatusSchema, row.status, "comment.status");
    validate(z.enum(["reader", "admin"]), row.authorKind, "comment.authorKind");
    validate(z.string().min(1).max(2000), row.content, "comment.content");
  }
  for (const row of data.get("media")!) {
    ensure(
      row.status === "ready" && row.leaseToken === null && row.leaseUntil === null,
      "media 必须已完成上传且没有执行中的租约。",
    );
    ensure(
      typeof row.bytes === "number" && row.bytes > 0 && row.mime && row.uploadedAt,
      "media 元数据不完整。",
    );
    validate(mediaKindSchema, row.kind, "media.kind");
    validate(z.string().regex(/^[a-f0-9]{64}$/), row.sha256, "media.sha256");
  }
  for (const row of data.get("page_visit")!) {
    ensure(typeof row.durationMs === "number" && row.durationMs >= 0, "page_visit 时长无效。");
    ensure(
      typeof row.progress === "number" && row.progress >= 0 && row.progress <= 100,
      "page_visit 阅读进度无效。",
    );
    boolean(row.article);
  }
  for (const row of data.get("notification")!) {
    validate(z.string().min(1).max(160), row.id, "notification.id");
    // 通知的复合文字 ID 不能重写为 UUID；它还用于去重和已读关系。
    validate(
      z.enum(["comment", "friend", "schedule-error", "backup"]),
      row.kind,
      "notification.kind",
    );
  }
  for (const row of data.get("operation_setting")!) {
    ensure(row.id === 1, "operation_setting id 无效。");
    boolean(row.autoBackup);
    row.autoBackup = 0;
    row.schedulerLastRunAt = null;
  }
}

function orderComments(rows: Row[]) {
  const pending = new Map(rows.map((row) => [row.id, row]));
  const ordered: Row[] = [];
  const visited = new Set<Value>();
  while (pending.size) {
    const before = pending.size;
    for (const [id, row] of pending)
      if (row.parentId === null || visited.has(row.parentId)) {
        ordered.push(row);
        visited.add(id);
        pending.delete(id);
      }
    ensure(before !== pending.size, "comment 父子关系包含循环或悬空引用。");
  }
  return ordered;
}

async function checkSnapshotFiles(path: string) {
  // 主文件摘要不能覆盖 WAL；只接受 backup API 导出的独立快照。
  for (const suffix of ["-wal", "-journal"])
    ensure(
      !(await stat(`${path}${suffix}`).then(
        (entry) => entry.size > 0,
        () => false,
      )),
      "SQLite 源存在 WAL 或 journal，请先导出一致性快照。",
    );
}
async function checkSnapshotUnchanged(path: string, sha256: string) {
  await checkSnapshotFiles(path);
  ensure(
    (await fileDigest(path)) === sha256,
    "SQLite 快照在处理期间发生变化，未提交的事务已取消。",
  );
}
async function readSource(source: string) {
  const path = await realpath(resolve(source));
  const info = await stat(path);
  ensure(info.isFile(), "SQLite 源必须是文件。");
  await checkSnapshotFiles(path);
  const sha256 = await fileDigest(path);
  const sqlite = new DatabaseSync(path, { readOnly: true });
  try {
    sqlite.exec("BEGIN");
    const integrity = sqlite.prepare("PRAGMA integrity_check").all();
    ensure(
      integrity.length === 1 && integrity[0].integrity_check === "ok",
      "SQLite 完整性检查失败。",
    );
    ensure(sqlite.prepare("PRAGMA foreign_key_check").all().length === 0, "SQLite 存在悬空关系。");
    const found = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row) => String(row.name));
    ensure(
      found.every((name) => internalTables.has(name) || isTableName(name)),
      "SQLite 包含未适配的表。",
    );
    ensure(
      tableNames.every((name) => found.includes(name)),
      "SQLite 缺少已知业务表。",
    );
    const data = new Map<TableName, Row[]>();
    for (const name of tableNames) {
      const columns = sqlite
        .prepare(`PRAGMA table_info("${name}")`)
        .all()
        .map((row) => String(row.name));
      const expected = Object.keys(tables[name].columns);
      ensure(
        columns.every((column) => expected.includes(column)) &&
          expected.every(
            (column) => columns.includes(column) || Object.hasOwn(defaults[name] ?? {}, column),
          ),
        `${name} 字段与已知 schema 不匹配。`,
      );
      const statement = sqlite.prepare(`SELECT * FROM "${name}"`);
      statement.setReadBigInts(true);
      const rows = statement.all().map((raw) => {
        const row: Row = {};
        for (const [column, descriptor] of Object.entries(tables[name].columns)) {
          const value = Object.hasOwn(raw, column) ? raw[column] : defaults[name]![column];
          row[column] = normalize(value, descriptor, `${name}.${column}`);
        }
        return row;
      });
      data.set(name, rows);
    }
    checkRelations(data);
    checkBusinessData(data);
    data.set("comment", orderComments(data.get("comment")!));
    await checkSnapshotUnchanged(path, sha256);
    return { path, sha256, data };
  } finally {
    sqlite.close();
  }
}

// 动态分发表名先经白名单与 contract 校验，行也逐列校验；仅此边界擦除模型差异。
type ModelAccess = { all(): Promise<Row[]>; create(row: Row): Promise<unknown> };
function modelAccess(tx: DatabaseTransaction, name: TableName) {
  return (tx.orm.public as unknown as Record<ModelName, ModelAccess>)[models[name]];
}
async function verifyRows(tx: DatabaseTransaction, data: Map<TableName, Row[]>) {
  const result = [];
  for (const name of tableNames) {
    const expected = omitted.has(name) ? [] : data.get(name)!;
    const actual = await modelAccess(tx, name).all();
    ensure(
      actual.length === expected.length && digest(actual) === digest(expected),
      `${name} 目标数据与源快照映射不一致。`,
    );
    result.push({
      table: name,
      sourceCount: data.get(name)!.length,
      targetCount: actual.length,
      imported: !omitted.has(name),
      sha256: digest(actual),
    });
  }
  return result;
}

export async function runSqliteImport(options: { source: string; mode: SqliteImportMode }) {
  ensure(
    Object.keys(tables).length === tableNames.length && Object.keys(tables).every(isTableName),
    "当前 contract 包含未适配的业务表。",
  );
  const source = await readSource(options.source);
  const connection = options.mode === "dry-run" ? databaseUrl() : requiredDatabaseUrl();
  const url = connection ? new URL(connection) : null;
  const common = {
    format: "fuxiaochen-sqlite-import-report",
    version: 1,
    mode: options.mode,
    source: source.path,
    sourceSha256: source.sha256,
    contractHash: contractJson.storage.storageHash,
    target: url
      ? {
          host: url.hostname,
          port: url.port || "5432",
          database: decodeURIComponent(url.pathname.slice(1)),
        }
      : null,
    autoBackupDisabled: true,
  };
  if (options.mode === "dry-run")
    return {
      ...common,
      targetChecked: false,
      tables: tableNames.map((name) => ({
        table: name,
        sourceCount: source.data.get(name)!.length,
        targetCount: null,
        plannedCount: omitted.has(name) ? 0 : source.data.get(name)!.length,
        imported: !omitted.has(name),
        sha256: digest(omitted.has(name) ? [] : source.data.get(name)!),
      })),
      verified: false,
    };
  const verification = spawnSync(
    process.execPath,
    ["node_modules/prisma/dist/prisma.js", "db", "verify"],
    { encoding: "utf8", timeout: 60_000, maxBuffer: 4 * 1024 * 1024 },
  );
  ensure(
    !verification.error && verification.status === 0,
    "目标数据库未通过当前 Prisma contract 验证，请先执行 db:migrate。",
  );
  const result = await writeTransaction(async (tx) => {
    if (options.mode !== "verify")
      for (const name of tableNames)
        ensure(
          (await modelAccess(tx, name).all()).length === 0,
          "导入目标业务表不是空的，已拒绝覆盖。",
        );
    await checkSnapshotUnchanged(source.path, source.sha256);
    if (options.mode === "apply")
      for (const name of tableNames) {
        if (omitted.has(name)) continue;
        for (const row of source.data.get(name)!) await modelAccess(tx, name).create(row);
      }
    const tableReport = await verifyRows(tx, source.data);
    await checkSnapshotUnchanged(source.path, source.sha256);
    return tableReport;
  });
  return {
    ...common,
    targetChecked: true,
    tables: result,
    verified: true,
  };
}
