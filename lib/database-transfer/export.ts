import "server-only";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { chmod, lstat, mkdir, open } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Client } from "pg";

import {
  canonicalRow,
  sourceContractSha256,
  tableSpecs,
  targetSchemaSha256,
  TransferError,
  type TransferManifest,
} from "./format";
import contractJson from "./source-contract.json";

type SourceColumn = { nativeType: string; nullable: boolean };
type SourceForeignKey = {
  onDelete: string;
  source: { columns: string[]; namespaceId: string; tableName: string };
  target: { columns: string[]; namespaceId: string; tableName: string };
};
type SourceTable = {
  columns: Record<string, SourceColumn>;
  primaryKey: { columns: string[] };
  uniques: { columns: string[] }[];
  foreignKeys: SourceForeignKey[];
};
type SourceRow = Record<string, string | null>;
type ExportRow = Record<string, string | number | null>;
type ConstraintRow = {
  table: string;
  kind: string;
  columns: string[];
  targetSchema: string | null;
  targetTable: string | null;
  targetColumns: string[] | null;
  deleteAction: string;
  updateAction: string;
  matchType: string;
  validated: boolean;
  deferrable: boolean;
  enforced: boolean;
  temporal: boolean;
  deleteSubset: string | null;
};

const tables: Record<string, SourceTable> = contractJson.storage.namespaces.public.entries.table;
const tableNames = Object.keys(tables).toSorted();
const metadataTables = new Set(["_prisma_ledger", "_prisma_marker"]);
const deleteActions: Record<string, string> = {
  cascade: "c",
  restrict: "r",
  setNull: "n",
  noAction: "a",
  setDefault: "d",
};

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new TransferError(message);
}

function identifier(value: string): string {
  // 标识符只能来自已提交的 contract；仍按 PostgreSQL 规则转义。
  return `"${value.replaceAll('"', '""')}"`;
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function ordered(values: unknown[]): string[] {
  return values.map((value) => JSON.stringify(value)).toSorted();
}

async function verifySourceSchema(client: Client): Promise<void> {
  const settings = await client.query<{ encoding: string }>(
    "SELECT pg_catalog.current_setting('server_encoding') AS encoding",
  );
  ensure(settings.rows[0]?.encoding === "UTF8", "PostgreSQL 源库必须使用 UTF8 编码。");
  // ACCESS SHARE 不阻止业务写入，但阻止核对后到导出结束之间的结构变更。
  await client.query(
    `LOCK TABLE ${tableNames.map((name) => `public.${identifier(name)}`).join(", ")} IN ACCESS SHARE MODE`,
  );
  const marker = await client.query<{ exists: boolean }>(
    "SELECT pg_catalog.to_regclass('prisma_contract.marker') IS NOT NULL AS exists",
  );
  if (marker.rows[0]?.exists) {
    const current = await client.query<{ core_hash: string }>(
      "SELECT core_hash FROM prisma_contract.marker WHERE space = 'app'",
    );
    ensure(
      current.rows.length === 1 && current.rows[0].core_hash === sourceContractSha256,
      "PostgreSQL 源库的 Prisma 迁移版本不匹配。",
    );
  }
  const relations = await client.query<{
    table: string;
    kind: string;
    rowSecurity: boolean;
    inherited: boolean;
  }>(`
    SELECT c.relname AS "table", c.relkind AS kind,
      c.relrowsecurity AS "rowSecurity",
      EXISTS (SELECT 1 FROM pg_catalog.pg_inherits i WHERE i.inhrelid = c.oid OR i.inhparent = c.oid) AS inherited
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
    ORDER BY c.relname COLLATE "C"
  `);
  const business = relations.rows.filter((row) => !metadataTables.has(row.table));
  ensure(
    same(
      business.map((row) => row.table),
      tableNames,
    ) && business.every((row) => row.kind === "r" && !row.rowSecurity && !row.inherited),
    "PostgreSQL 源库的业务表不匹配，或存在行级安全、分区及继承。",
  );

  const columns = await client.query<{
    table: string;
    column: string;
    nativeType: string;
    typeSchema: string;
    nullable: boolean;
    generated: string;
    identity: string;
    defaultCollation: boolean;
  }>(
    `SELECT c.relname AS "table", a.attname AS "column", t.typname AS "nativeType",
       tn.nspname AS "typeSchema", NOT a.attnotnull AS nullable,
       a.attgenerated AS generated, a.attidentity AS identity,
       a.attcollation = t.typcollation AS "defaultCollation"
     FROM pg_catalog.pg_attribute a
     JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
     JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     JOIN pg_catalog.pg_type t ON t.oid = a.atttypid
     JOIN pg_catalog.pg_namespace tn ON tn.oid = t.typnamespace
     WHERE n.nspname = 'public' AND c.relname = ANY($1::text[])
       AND a.attnum > 0 AND NOT a.attisdropped
     ORDER BY c.relname COLLATE "C", a.attname COLLATE "C"`,
    [tableNames],
  );
  for (const name of tableNames) {
    const actual = columns.rows.filter((row) => row.table === name);
    const expected = Object.entries(tables[name].columns).toSorted(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0,
    );
    ensure(
      same(
        actual.map((row) => row.column),
        expected.map(([column]) => column),
      ) &&
        actual.every(
          (row, index) =>
            row.nativeType === expected[index][1].nativeType &&
            row.nullable === expected[index][1].nullable &&
            row.typeSchema === "pg_catalog" &&
            row.generated === "" &&
            row.identity === "" &&
            row.defaultCollation,
        ),
      "PostgreSQL 源库的字段、类型或 NULL 约束不匹配。",
    );
  }

  const constraints = await client.query<ConstraintRow>(
    `SELECT c.relname AS "table", k.contype AS kind,
       ARRAY(SELECT a.attname::text FROM unnest(k.conkey) WITH ORDINALITY x(attnum, ord)
         JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = x.attnum ORDER BY x.ord) AS columns,
       tn.nspname AS "targetSchema", tc.relname AS "targetTable",
       ARRAY(SELECT a.attname::text FROM unnest(k.confkey) WITH ORDINALITY x(attnum, ord)
         JOIN pg_catalog.pg_attribute a ON a.attrelid = tc.oid AND a.attnum = x.attnum ORDER BY x.ord) AS "targetColumns",
       k.confdeltype AS "deleteAction", k.confupdtype AS "updateAction", k.confmatchtype AS "matchType",
       k.convalidated AS validated, k.condeferrable AS deferrable,
       COALESCE((pg_catalog.to_jsonb(k)->>'conenforced')::boolean, true) AS enforced,
       COALESCE((pg_catalog.to_jsonb(k)->>'conperiod')::boolean, false) AS temporal,
       pg_catalog.to_jsonb(k)->>'confdelsetcols' AS "deleteSubset"
     FROM pg_catalog.pg_constraint k
     JOIN pg_catalog.pg_class c ON c.oid = k.conrelid
     JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     LEFT JOIN pg_catalog.pg_class tc ON tc.oid = k.confrelid
     LEFT JOIN pg_catalog.pg_namespace tn ON tn.oid = tc.relnamespace
     WHERE n.nspname = 'public' AND c.relname = ANY($1::text[])
       AND k.contype <> 'n'`,
    [tableNames],
  );
  for (const name of tableNames) {
    const actual = constraints.rows.filter((row) => row.table === name);
    const expected = tables[name];
    const primaryKeys = actual.filter((row) => row.kind === "p");
    const uniques = actual.filter((row) => row.kind === "u");
    const foreignKeys = actual.filter((row) => row.kind === "f");
    ensure(
      actual.every(
        (row) =>
          ["p", "u", "f"].includes(row.kind) &&
          row.validated &&
          !row.deferrable &&
          row.enforced &&
          !row.temporal &&
          row.deleteSubset === null,
      ) &&
        primaryKeys.length === 1 &&
        same(primaryKeys[0].columns, expected.primaryKey.columns) &&
        same(
          ordered(uniques.map((row) => row.columns)),
          ordered(expected.uniques.map((row) => row.columns)),
        ),
      "PostgreSQL 源库的主键或唯一约束不匹配。",
    );
    const actualForeignKeys = foreignKeys.map((row) => ({
      columns: row.columns,
      targetSchema: row.targetSchema,
      targetTable: row.targetTable,
      targetColumns: row.targetColumns,
      deleteAction: row.deleteAction,
      updateAction: row.updateAction,
      matchType: row.matchType,
    }));
    const expectedForeignKeys = expected.foreignKeys.map((key) => ({
      columns: key.source.columns,
      targetSchema: key.target.namespaceId,
      targetTable: key.target.tableName,
      targetColumns: key.target.columns,
      deleteAction: deleteActions[key.onDelete],
      updateAction: "a",
      matchType: "s",
    }));
    ensure(
      same(ordered(actualForeignKeys), ordered(expectedForeignKeys)),
      "PostgreSQL 源库的外键或引用动作不匹配。",
    );
  }

  const extraUniqueIndexes = await client.query<{ count: string }>(
    `SELECT count(*)::text AS count
     FROM pg_catalog.pg_index i
     JOIN pg_catalog.pg_class c ON c.oid = i.indrelid
     JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = ANY($1::text[]) AND i.indisunique
       AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint k
         WHERE k.conindid = i.indexrelid AND k.conrelid = c.oid AND k.contype IN ('p', 'u'))`,
    [tableNames],
  );
  ensure(extraUniqueIndexes.rows[0]?.count === "0", "PostgreSQL 源库包含未声明的唯一索引。");
  const invalidIndexes = await client.query<{ count: string }>(
    `SELECT count(*)::text AS count
     FROM pg_catalog.pg_index i
     JOIN pg_catalog.pg_class c ON c.oid = i.indrelid
     JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = ANY($1::text[]) AND i.indisunique
       AND (NOT i.indisvalid OR NOT i.indisready OR NOT i.indislive
         OR COALESCE((pg_catalog.to_jsonb(i)->>'indnullsnotdistinct')::boolean, false))`,
    [tableNames],
  );
  ensure(
    invalidIndexes.rows[0]?.count === "0",
    "PostgreSQL 源库的唯一索引状态或 NULL 语义不匹配。",
  );
}

function safeInteger(value: string): number {
  ensure(/^-?\d+(?:\.0+)?$/.test(value), "PostgreSQL 源库包含无法无损转换的整数或时间精度。");
  const integer = BigInt(value.split(".")[0]);
  const number = Number(integer);
  ensure(
    Number.isSafeInteger(number) && BigInt(number) === integer,
    "PostgreSQL 源库存在超出安全整数范围的数据。",
  );
  return number;
}

function convertRow(row: SourceRow, table: SourceTable): ExportRow {
  const result: ExportRow = {};
  for (const name of Object.keys(table.columns).toSorted()) {
    const column = table.columns[name];
    const value = row[name];
    if (value === null) {
      ensure(column.nullable, "PostgreSQL 源库包含违反 NULL 约束的数据。");
      result[name] = null;
      continue;
    }
    ensure(typeof value === "string", "PostgreSQL 源库包含无法转换的字段类型。");
    if (column.nativeType === "text") result[name] = value;
    else {
      const number = safeInteger(value);
      if (column.nativeType === "timestamptz")
        ensure(new Date(number).getTime() === number, "PostgreSQL 源库包含无法转换的时间范围。");
      result[name] = number;
    }
  }
  return result;
}

async function createDirectory(path: string): Promise<string> {
  const directory = resolve(path);
  // 不跟随任何父目录软链接，目标 mkdir 本身以排他方式创建。
  let current = dirname(directory);
  while (true) {
    const info = await lstat(current);
    ensure(info.isDirectory() && !info.isSymbolicLink(), "导出路径不能使用软链接或非目录父路径。");
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  await mkdir(directory, { mode: 0o700 });
  await chmod(directory, 0o700);
  return directory;
}

async function exportTable(client: Client, directory: string, name: string) {
  const table = tables[name];
  const spec = tableSpecs.find((item) => item.name === name);
  ensure(spec, "迁移导出的目标 schema 不匹配。");
  const count = await client.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM public.${identifier(name)}`,
  );
  const sourceCount = safeInteger(count.rows[0].count);
  const cursor = identifier(`transfer_${name}`);
  const projection = Object.entries(table.columns).map(([column, info]) => {
    const quoted = identifier(column);
    const source = `src.${quoted}`;
    return info.nativeType === "timestamptz"
      ? `(EXTRACT(EPOCH FROM ${source}) * 1000)::text AS ${quoted}`
      : `${source}::text AS ${quoted}`;
  });
  const order = table.primaryKey.columns.map((column) => {
    const quoted = `src.${identifier(column)}`;
    return table.columns[column].nativeType === "text" ? `${quoted} COLLATE "C"` : quoted;
  });
  await client.query(
    `DECLARE ${cursor} NO SCROLL CURSOR WITHOUT HOLD FOR SELECT ${projection.join(", ")} FROM public.${identifier(name)} AS src ORDER BY ${order.join(", ")}`,
  );
  const file = `${name}.jsonl`;
  const handle = await open(
    join(directory, file),
    constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
    0o600,
  );
  const hash = createHash("sha256");
  let bytes = 0;
  let rows = 0;
  try {
    while (true) {
      const batch = await client.query<SourceRow>(`FETCH FORWARD 500 FROM ${cursor}`);
      if (batch.rows.length === 0) break;
      for (const row of batch.rows) {
        const data = Buffer.from(`${canonicalRow(spec, convertRow(row, table))}\n`, "utf8");
        await handle.writeFile(data);
        hash.update(data);
        bytes += data.byteLength;
        rows += 1;
        ensure(
          Number.isSafeInteger(bytes) && Number.isSafeInteger(rows),
          "导出文件超出可核对的安全范围。",
        );
      }
    }
    ensure(rows === sourceCount, "PostgreSQL 快照导出记录数量不一致。");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await client.query(`CLOSE ${cursor}`);
  return { name, rowCount: sourceCount, bytes, sha256: hash.digest("hex") };
}

export async function exportPostgres(options: {
  directory: string;
  sourceUrl?: string;
}): Promise<TransferManifest> {
  // 不读取 DATABASE_URL，避免迁移工具误连普通开发库或线上库。
  const sourceUrl = options.sourceUrl ?? process.env.MIGRATION_SOURCE_DATABASE_URL;
  ensure(sourceUrl?.trim(), "必须显式提供 MIGRATION_SOURCE_DATABASE_URL。");
  let client: Client | undefined;
  let transaction = false;
  try {
    const directory = await createDirectory(options.directory);
    client = new Client({
      connectionString: sourceUrl,
      application_name: "fuxiaochen-readonly-export",
      connectionTimeoutMillis: 10_000,
      statement_timeout: 60_000,
      options: "-c default_transaction_read_only=on",
    });
    // 网络断开事件由后续查询统一报错处理，避免未捕获事件输出连接细节。
    client.on("error", () => {});
    await client.connect();
    await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    transaction = true;
    await client.query("SET LOCAL TIME ZONE 'UTC'");
    await client.query("SET LOCAL search_path = pg_catalog");
    await verifySourceSchema(client);
    const administrator = await client.query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM public.admin WHERE id = 1) AS exists",
    );
    // 旧站必须已有管理员，空业务库不能生成可用于正式切换的归档。
    ensure(administrator.rows[0]?.exists, "PostgreSQL 源库没有 id=1 管理员账号，已拒绝导出。");
    const snapshot = await client.query<{ snapshot: string }>(
      "SELECT pg_current_snapshot()::text AS snapshot",
    );
    const exported = [];
    for (const name of tableNames) exported.push(await exportTable(client, directory, name));
    await client.query("COMMIT");
    transaction = false;
    const manifest: TransferManifest = {
      format: "fuxiaochen-postgresql-transfer",
      version: 1,
      createdAt: new Date().toISOString(),
      sourceContractSha256,
      targetSchemaSha256: targetSchemaSha256(),
      snapshot: snapshot.rows[0].snapshot,
      tables: exported,
    };
    // 最后才发布 manifest，失败目录不能被导入工具视为完整归档。
    const handle = await open(
      join(directory, "manifest.json"),
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
      0o600,
    );
    try {
      await handle.writeFile(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    return manifest;
  } catch (error) {
    if (transaction && client) await client.query("ROLLBACK").catch(() => {});
    if (error instanceof TransferError) throw error;
    throw new TransferError("PostgreSQL 导出失败；请检查源连接、只读权限和新的导出目录。");
  } finally {
    await client?.end().catch(() => {});
  }
}
