import "server-only";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { TextDecoder } from "node:util";
import { z } from "zod";

import { releaseChangesSchema, releaseStatusSchema, releaseTypeSchema } from "../changelog/schema";
import { migrationManifest } from "../database/migrations";
import { postContentSchema } from "../posts/document";
import sourceContract from "./source-contract.json";

export class TransferError extends Error {}
export type Row = Record<string, string | number | null>;
export type ColumnSpec = { name: string; type: "text" | "integer" | "datetime"; nullable: boolean };
export type TableSpec = { name: string; columns: ColumnSpec[]; primaryKey: string[] };
export const sourceContractSha256 = sourceContract.storage.storageHash;
export const transferMigrationsFolder = resolve(import.meta.dirname, "../../drizzle");
export const targetSchemaSha256 = () => migrationManifest(transferMigrationsFolder).schemaSha256;
export const tableSpecs: TableSpec[] = Object.entries(
  sourceContract.storage.namespaces.public.entries.table,
).map(([name, table]) => ({
  name,
  columns: Object.entries(table.columns).map(([columnName, column]) => ({
    name: columnName,
    type:
      column.nativeType === "text" ? "text" : column.nativeType === "int8" ? "integer" : "datetime",
    nullable: column.nullable,
  })),
  primaryKey: table.primaryKey.columns,
}));
// 源 contract 保留旧库基线；目标映射仅包含现行功能，禁止恢复已移除数据。
export const removedTables = new Set([
  "comment",
  "comment_rate_limit",
  "page_visit",
  "visit_session",
  "analytics_rate_limit",
]);
export const removedSettingFields = new Set([
  "enableComments",
  "localAnalyticsEnabled",
  "localAnalyticsStartedAt",
]);
export function targetTableSpec(name: string): TableSpec | undefined {
  const source = tableSpecs.find((spec) => spec.name === name);
  if (!source || removedTables.has(name)) return undefined;
  return name === "site_setting"
    ? {
        ...source,
        columns: source.columns.filter(
          ({ name: columnName }) => !removedSettingFields.has(columnName),
        ),
      }
    : source;
}
export const tableNames = tableSpecs.map(({ name }) => name);
export const resetTables = new Set([
  "session",
  "login_rate_limit",
  "media_upload_limit",
  "comment_rate_limit",
  "analytics_rate_limit",
  "backup_run",
]);

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const tableManifestSchema = z.strictObject({
  name: z.enum(tableNames),
  rowCount: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  bytes: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  sha256: hash,
});
export const transferManifestSchema = z.strictObject({
  format: z.literal("fuxiaochen-postgresql-transfer"),
  version: z.literal(1),
  createdAt: z.iso.datetime({ precision: 3 }),
  sourceContractSha256: hash,
  targetSchemaSha256: hash,
  snapshot: z.string().min(1).max(300),
  tables: z.array(tableManifestSchema).length(tableSpecs.length),
});
export type TransferManifest = z.infer<typeof transferManifestSchema>;
export type Digest = { rowCount: number; sha256: string; fields: Record<string, string> };
export type Archive = {
  directory: string;
  manifestSha256: string;
  manifest: TransferManifest;
  rows(name: string): Iterable<Row>;
  plannedRows(name: string): Iterable<Row>;
};

type SourceConstraints = {
  primaryKey: { columns: string[] };
  uniques: { columns: string[] }[];
  foreignKeys: {
    source: { columns: string[] };
    target: { namespaceId: string; tableName: string; columns: string[] };
  }[];
};
const sourceConstraints = sourceContract.storage.namespaces.public.entries.table as Record<
  string,
  SourceConstraints
>;
type RelationIndexes = Map<string, Map<string, { columns: string[]; keys: Set<string> }>>;

function indexIdentity(columns: string[]): string {
  return JSON.stringify(columns);
}

function relationKey(row: Row, columns: string[]): string {
  // 复合键保留字段顺序和原类型；JSON 转义避免文字中的分隔符造成碰撞。
  return JSON.stringify(columns.map((column) => row[column]));
}

function createRelationIndexes(): RelationIndexes {
  const indexes: RelationIndexes = new Map();
  for (const spec of tableSpecs) {
    const table = sourceConstraints[spec.name];
    const groups = [table.primaryKey.columns, ...table.uniques.map(({ columns }) => columns)];
    indexes.set(
      spec.name,
      new Map(
        groups.map((columns) => [indexIdentity(columns), { columns, keys: new Set<string>() }]),
      ),
    );
  }
  return indexes;
}

function collectRelationKeys(indexes: RelationIndexes, spec: TableSpec, row: Row): void {
  const table = sourceConstraints[spec.name];
  if (table.primaryKey.columns.some((column) => row[column] === null))
    throw new TransferError("归档主键不能为空。");
  for (const { columns, keys: used } of indexes.get(spec.name)!.values()) {
    // PostgreSQL 与 SQLite 的 UNIQUE 都允许多个含 NULL 的键，不能把它们当重复值。
    if (columns.some((column) => row[column] === null)) continue;
    const key = relationKey(row, columns);
    if (used.has(key)) throw new TransferError(`${spec.name} 包含重复的主键或唯一字段。`);
    used.add(key);
  }
}

function verifyRelations(indexes: RelationIndexes, rows: (name: string) => Iterable<Row>): void {
  // 只保留主键/唯一键的关系索引，不收集正文、密码哈希或其他完整业务行。
  // 内存随关系键数量增长；第二次流式读取逐条检查 FK，dry-run 无需打开 SQLite。
  for (const spec of tableSpecs) {
    const relations = sourceConstraints[spec.name].foreignKeys;
    if (!relations.length) continue;
    for (const row of rows(spec.name)) {
      for (const relation of relations) {
        if (relation.source.columns.some((column) => row[column] === null)) continue;
        const target = relation.target;
        const referenced = indexes.get(target.tableName)?.get(indexIdentity(target.columns));
        if (target.namespaceId !== "public" || !referenced)
          throw new TransferError("源 contract 包含未适配的外键目标。");
        if (!referenced.keys.has(relationKey(row, relation.source.columns)))
          throw new TransferError(`${spec.name} 包含悬空的外键关联。`);
      }
    }
  }
}

export function tableSpec(name: string): TableSpec {
  const spec = tableSpecs.find((table) => table.name === name);
  if (!spec) throw new TransferError("归档包含未知数据表。");
  return spec;
}

export function validateRow(spec: TableSpec, input: unknown): Row {
  const object = z.record(z.string(), z.union([z.string(), z.number(), z.null()])).safeParse(input);
  if (
    !object.success ||
    Object.keys(object.data).toSorted().join("\0") !==
      spec.columns
        .map((column) => column.name)
        .toSorted()
        .join("\0")
  )
    throw new TransferError("归档记录字段或类型不匹配。");
  const row = object.data;
  for (const column of spec.columns) {
    const value = row[column.name];
    if (value === null) {
      if (!column.nullable) throw new TransferError("归档必填字段缺失。");
      continue;
    }
    if (column.type === "text") {
      if (typeof value !== "string" || !value.isWellFormed() || value.includes("\0"))
        throw new TransferError("归档文字字段无效。");
    } else if (
      typeof value !== "number" ||
      !Number.isSafeInteger(value) ||
      (column.type === "datetime" && Number.isNaN(new Date(value).getTime()))
    )
      throw new TransferError("归档整数或日期超出安全范围。");
  }
  return row;
}

function valid(condition: boolean): void {
  if (!condition) throw new TransferError("归档业务内容校验失败。");
}

function validateBusinessRow(spec: TableSpec, row: Row) {
  if (spec.name === "post") {
    valid(
      postContentSchema.safeParse(row.content).success &&
        ["draft", "published", "scheduled"].includes(String(row.status)),
    );
    valid(typeof row.version === "number" && row.version >= 1);
    if (row.status !== "draft") valid(Boolean(row.title && row.slug && row.categoryId));
  }
  if (spec.name === "admin") {
    const password =
      typeof row.passwordHash === "string"
        ? /^\$argon2id\$v=19\$([^$]+)\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/.exec(row.passwordHash)
        : null;
    const parameters = password?.[1].split(",") ?? [];
    // PHC 参数没有固定顺序；保留原哈希，同时拒绝缺失、重复或无效的成本参数。
    valid(
      typeof row.username === "string" &&
        row.username.length >= 1 &&
        parameters.length === 3 &&
        parameters
          .map((value) => value.split("=")[0])
          .toSorted()
          .join(",") === "m,p,t" &&
        parameters.every(
          (value) => /^[mpt]=[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value.slice(2))),
        ),
    );
  }
  if (spec.name === "release_log") {
    let changes: unknown;
    try {
      changes = JSON.parse(String(row.changes));
    } catch {
      throw new TransferError("归档业务内容校验失败。");
    }
    valid(
      releaseChangesSchema.safeParse(changes).success &&
        releaseStatusSchema.safeParse(row.status).success &&
        releaseTypeSchema.safeParse(row.type).success,
    );
  }
  if (spec.name === "comment")
    valid(
      ["pending", "approved", "rejected"].includes(String(row.status)) &&
        typeof row.content === "string" &&
        row.content.trim().length > 0 &&
        row.content.length <= 2000 &&
        ["reader", "admin", "visitor"].includes(String(row.authorKind)),
    );
  if (spec.name === "friend_link")
    valid(["pending", "approved", "rejected"].includes(String(row.status)));
  if (spec.name === "media")
    valid(
      ["image", "attachment"].includes(String(row.kind)) &&
        ["pending", "finalizing", "ready", "deleting", "deleted"].includes(String(row.status)),
    );
  for (const key of [
    "autoBackup",
    "enableComments",
    "localAnalyticsEnabled",
    "googleEnabled",
    "baiduEnabled",
    "enabled",
    "isFeatured",
    "article",
  ])
    if (key in row && row[key] !== null) valid(row[key] === 0 || row[key] === 1);
}

export function canonicalRow(spec: TableSpec, input: unknown): string {
  const row = validateRow(spec, input);
  return JSON.stringify(Object.fromEntries(spec.columns.map(({ name }) => [name, row[name]])));
}
export function digestRows(spec: TableSpec, rows: Iterable<Row>): Digest {
  const total = createHash("sha256");
  const fields = Object.fromEntries(spec.columns.map(({ name }) => [name, createHash("sha256")]));
  let rowCount = 0;
  for (const row of rows) {
    total.update(canonicalRow(spec, row) + "\n");
    for (const { name } of spec.columns) fields[name].update(JSON.stringify(row[name]) + "\n");
    rowCount++;
  }
  return {
    rowCount,
    sha256: total.digest("hex"),
    fields: Object.fromEntries(
      Object.entries(fields).map(([name, digest]) => [name, digest.digest("hex")]),
    ),
  };
}

function compareRows(spec: TableSpec, left: Row, right: Row): number {
  for (const name of spec.primaryKey) {
    const a = left[name];
    const b = right[name];
    if (a === null || b === null) throw new TransferError("归档主键不能为空。");
    const comparison =
      typeof a === "number" && typeof b === "number"
        ? Math.sign(a - b)
        : Buffer.compare(Buffer.from(String(a)), Buffer.from(String(b)));
    if (comparison) return comparison;
  }
  return 0;
}

function openRegular(path: string): number {
  if (!lstatSync(path).isFile()) throw new TransferError("归档必须由独立普通文件组成。");
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  if (!fstatSync(descriptor).isFile()) {
    closeSync(descriptor);
    throw new TransferError("归档文件无效。");
  }
  return descriptor;
}

function* readRows(
  directory: string,
  spec: TableSpec,
  expected: TransferManifest["tables"][number],
): Generator<Row> {
  const fd = openRegular(join(directory, `${spec.name}.jsonl`));
  const buffer = Buffer.alloc(1024 * 1024);
  const digest = createHash("sha256");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let pending = Buffer.alloc(0);
  let bytes = 0;
  let count = 0;
  let previous: Row | undefined;
  try {
    let length: number;
    while ((length = readSync(fd, buffer, 0, buffer.length, null)) > 0) {
      const chunk = buffer.subarray(0, length);
      digest.update(chunk);
      bytes += length;
      pending = Buffer.concat([pending, chunk]);
      let newline: number;
      while ((newline = pending.indexOf(10)) >= 0) {
        if (newline > 16 * 1024 * 1024) throw new TransferError("归档单条记录超出大小限制。");
        let input: unknown;
        let text: string;
        try {
          text = decoder.decode(pending.subarray(0, newline));
          input = JSON.parse(text);
        } catch {
          throw new TransferError("归档 JSONL 记录损坏。");
        }
        const row = validateRow(spec, input);
        // 归档只能使用导出器的规范编码，防止 JSON 数值舍入及重复字段被静默接受。
        if (text !== canonicalRow(spec, row))
          throw new TransferError("归档记录编码不规范或存在无法无损解析的数值。");
        validateBusinessRow(spec, row);
        if (previous && compareRows(spec, previous, row) >= 0)
          throw new TransferError("归档记录主键重复或顺序无效。");
        previous = row;
        count++;
        yield row;
        pending = pending.subarray(newline + 1);
      }
      if (pending.length > 16 * 1024 * 1024) throw new TransferError("归档单条记录超出大小限制。");
    }
    if (
      pending.length ||
      bytes !== expected.bytes ||
      count !== expected.rowCount ||
      digest.digest("hex") !== expected.sha256
    )
      throw new TransferError("归档大小、数量或摘要不匹配。");
  } finally {
    closeSync(fd);
  }
}

export async function loadArchive(inputDirectory: string): Promise<Archive> {
  try {
    if (!lstatSync(inputDirectory).isDirectory() || lstatSync(inputDirectory).isSymbolicLink())
      throw new TransferError("归档目录不能是符号链接。");
    const directory = realpathSync(inputDirectory);
    const manifestFd = openRegular(join(directory, "manifest.json"));
    let contents: Buffer;
    try {
      if (fstatSync(manifestFd).size > 1024 * 1024) throw new TransferError("归档清单大小无效。");
      contents = readFileSync(manifestFd);
    } finally {
      closeSync(manifestFd);
    }
    let manifest: TransferManifest;
    try {
      manifest = transferManifestSchema.parse(
        JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(contents)),
      );
    } catch {
      throw new TransferError("归档清单格式无效或尚未完成。");
    }
    if (
      manifest.sourceContractSha256 !== sourceContractSha256 ||
      manifest.targetSchemaSha256 !== targetSchemaSha256() ||
      new Set(manifest.tables.map(({ name }) => name)).size !== tableSpecs.length
    )
      throw new TransferError("归档数据库版本与当前工具不匹配。");
    const allowedFiles = [
      "manifest.json",
      ...tableSpecs.map(({ name }) => `${name}.jsonl`),
    ].toSorted();
    if (readdirSync(directory).toSorted().join("\0") !== allowedFiles.join("\0"))
      throw new TransferError("归档文件不完整或包含未知文件。");
    const rows = (name: string) =>
      readRows(
        directory,
        tableSpec(name),
        manifest.tables.find((table) => table.name === name)!,
      );
    const omittedNotificationIds = new Set<string>();
    const parents = new Map<string, { parent: string | null; post: string }>();
    const relationIndexes = createRelationIndexes();
    for (const spec of tableSpecs) {
      for (const row of rows(spec.name)) {
        collectRelationKeys(relationIndexes, spec, row);
        if (spec.name === "notification" && ["backup", "comment"].includes(String(row.kind)))
          omittedNotificationIds.add(String(row.id));
        if (spec.name === "comment")
          parents.set(String(row.id), {
            parent: row.parentId === null ? null : String(row.parentId),
            post: String(row.postId),
          });
      }
    }
    // 当前登录入口固定使用 id=1；拒绝导入无法登录的空管理员库。
    if (
      !relationIndexes
        .get("admin")!
        .get(indexIdentity(["id"]))!
        .keys.has("[1]")
    )
      throw new TransferError("迁移归档必须保留有效的 id=1 管理员。");
    verifyRelations(relationIndexes, rows);
    // FK 能发现缺失/跨文章父级，但不能发现环；离线预检补充评论祖先检查。
    const checked = new Set<string>();
    for (const id of parents.keys()) {
      let current: string | null = id;
      const path = new Set<string>();
      while (current && !checked.has(current)) {
        if (path.has(current)) throw new TransferError("归档评论父子关系包含循环。");
        path.add(current);
        const node: { parent: string | null; post: string } | undefined = parents.get(current);
        if (!node || (node.parent && parents.get(node.parent)?.post !== node.post))
          throw new TransferError("归档评论父子关系无效。");
        current = node.parent;
      }
      for (const entry of path) checked.add(entry);
    }
    const plannedRows = function* (name: string): Generator<Row> {
      for (const row of rows(name)) {
        if (
          resetTables.has(name) ||
          removedTables.has(name) ||
          (name === "notification" && ["backup", "comment"].includes(String(row.kind))) ||
          (name === "notification_read" && omittedNotificationIds.has(String(row.notificationId)))
        )
          continue;
        yield name === "operation_setting"
          ? { ...row, autoBackup: 0, schedulerLastRunAt: null }
          : name === "site_setting"
            ? Object.fromEntries(
                Object.entries(row).filter(([key]) => !removedSettingFields.has(key)),
              )
            : row;
      }
    };
    return {
      directory,
      manifest,
      manifestSha256: createHash("sha256").update(contents).digest("hex"),
      rows,
      plannedRows,
    };
  } catch (error) {
    if (error instanceof TransferError) throw error;
    throw new TransferError("无法读取或验证迁移归档。");
  }
}

export async function assertArchiveUnchanged(archive: Archive): Promise<void> {
  const current = await loadArchive(archive.directory);
  if (current.manifestSha256 !== archive.manifestSha256)
    throw new TransferError("迁移期间源归档发生变化。");
}
