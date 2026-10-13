import Sqlite from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { promisify } from "node:util";

import {
  closeDatabase,
  getActiveTransaction,
  getDatabase,
  writeTransaction,
} from "../lib/database";
import sourceContract from "../lib/database-transfer/source-contract.json";
import { migrateDatabase, migrationManifest, verifyDatabase } from "../lib/database/migrations";
import { requiredDatabasePath } from "../lib/database/path";
import {
  admin,
  category,
  comment,
  loginRateLimit,
  pageVisit,
  post,
  postTag,
  tag,
  visitSession,
} from "../lib/database/schema";

let directory: string;
const date = new Date("2026-10-13T01:02:03.456Z");
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "fx-sqlite-foundation-"));
  process.env.DATABASE_PATH = join(directory, "independent.sqlite");
  await writeFile(process.env.DATABASE_PATH, "", { flag: "wx", mode: 0o600 });
  const client = new Sqlite(process.env.DATABASE_PATH);
  try {
    client.pragma("foreign_keys = ON");
    migrateDatabase(client);
  } finally {
    client.close();
  }
});
after(async () => {
  closeDatabase();
  await rm(directory, { recursive: true, force: true });
});

void test("只有显式 SQLite 文件路径可用；缺失文件不会被自动创建", () => {
  for (const value of [
    "",
    ":memory:",
    "postgresql://dummy:dummy@localhost/db",
    "file:old.sqlite",
  ]) {
    assert.throws(() => requiredDatabasePath(value));
  }
  closeDatabase();
  const original = process.env.DATABASE_PATH;
  process.env.DATABASE_PATH = join(directory, "missing.sqlite");
  assert.throws(() => getDatabase());
  process.env.DATABASE_PATH = original;
});

void test("22 张业务表的字段、主键、非空、唯一约束与源库基线对应", async () => {
  const tables = sourceContract.storage.namespaces.public.entries.table;
  const db = getDatabase().$client;
  assert.equal(Object.keys(tables).length, 22);
  for (const [table, definition] of Object.entries(tables)) {
    const actual = db
      .prepare<[], { name: string; type: string; notnull: number; pk: number }>(
        `PRAGMA table_info("${table}")`,
      )
      .all();
    assert.deepEqual(
      actual.map((column) => column.name).toSorted(),
      Object.keys(definition.columns).toSorted(),
      table,
    );
    for (const [name, expected] of Object.entries(definition.columns)) {
      const column = actual.find((item) => item.name === name)!;
      assert.equal(
        column.type.toLowerCase(),
        expected.nativeType === "text" ? "text" : "integer",
        `${table}.${name}`,
      );
      assert.equal(column.notnull, expected.nullable ? 0 : 1, `${table}.${name} 非空`);
    }
    assert.deepEqual(
      actual
        .filter((column) => column.pk)
        .toSorted((a, b) => a.pk - b.pk)
        .map((column) => column.name),
      definition.primaryKey.columns,
      `${table} 主键`,
    );
    const indexes = db
      .prepare<[], { name: string; unique: number }>(`PRAGMA index_list("${table}")`)
      .all();
    for (const constraint of definition.uniques) {
      assert.ok(
        indexes.some(
          (index) =>
            index.unique &&
            JSON.stringify(
              db
                .prepare<[], { name: string }>(`PRAGMA index_info("${index.name}")`)
                .all()
                .map((column) => column.name),
            ) === JSON.stringify(constraint.columns),
        ),
        `${table} 唯一约束`,
      );
    }
  }
});

void test("迁移重复执行保留数据，校验拒绝结构漂移和未知版本", () => {
  const db = getDatabase();
  writeTransaction((tx) =>
    tx
      .insert(category)
      .values({
        id: "foundation-category",
        name: "分类",
        nameKey: "分类",
        color: "#123456",
        createdAt: date,
      })
      .run(),
  );
  migrateDatabase(db.$client);
  assert.equal(
    db.select().from(category).where(eq(category.id, "foundation-category")).get()?.name,
    "分类",
  );
  assert.equal(migrationManifest().migrations.length, 3);
  db.$client.exec("DROP INDEX post_createdAt_id_idx");
  assert.throws(() => verifyDatabase(db.$client), /结构/);
  db.$client.exec("CREATE INDEX `post_createdAt_id_idx` ON `post` (`createdAt`,`id`)");
  verifyDatabase(db.$client);
  db.$client.prepare("UPDATE __drizzle_migrations SET hash=? WHERE id=1").run("0".repeat(64));
  assert.throws(() => migrateDatabase(db.$client), /记录/);
  db.$client
    .prepare("UPDATE __drizzle_migrations SET hash=? WHERE id=1")
    .run(migrationManifest().migrations[0].hash);
});

void test("同步 IMMEDIATE 事务与嵌套事务回滚，不接受异步回调或 Promise", () => {
  const db = getDatabase();
  assert.throws(() =>
    writeTransaction((tx) => {
      tx.insert(tag)
        .values({ id: "rolled-back", name: "回滚", nameKey: "回滚", createdAt: date })
        .run();
      throw new Error("rollback");
    }),
  );
  assert.equal(db.select().from(tag).where(eq(tag.id, "rolled-back")).get(), undefined);
  // @ts-expect-error 验证运行时也拒绝来自 JavaScript 的异步回调。
  assert.throws(() => writeTransaction(async () => {}), /同步/);
  assert.throws(
    () =>
      // @ts-expect-error 验证运行时也拒绝返回 Promise 的普通回调。
      writeTransaction((tx) => {
        tx.insert(tag)
          .values({ id: "promise", name: "Promise", nameKey: "promise", createdAt: date })
          .run();
        return Promise.resolve();
      }),
    /Promise/,
  );
  assert.equal(db.select().from(tag).where(eq(tag.id, "promise")).get(), undefined);
  writeTransaction(() => {
    assert.ok(getActiveTransaction());
    assert.throws(() =>
      writeTransaction((tx) => {
        tx.insert(tag)
          .values({ id: "nested", name: "嵌套", nameKey: "nested", createdAt: date })
          .run();
        throw new Error("nested");
      }),
    );
  });
  assert.equal(getActiveTransaction(), undefined);
  assert.equal(db.select().from(tag).where(eq(tag.id, "nested")).get(), undefined);
});

void test("UTC 日期毫秒、安全整数、Unicode lower 和约束运行通过", () => {
  const db = getDatabase();
  writeTransaction((tx) =>
    tx
      .insert(admin)
      .values({
        id: 1,
        username: "foundation",
        passwordHash: "dummy",
        createdAt: date,
        updatedAt: date,
      })
      .run(),
  );
  assert.equal(db.select().from(admin).get()?.createdAt.toISOString(), date.toISOString());
  assert.throws(() =>
    writeTransaction((tx) =>
      tx
        .insert(admin)
        .values({
          id: Number.MAX_SAFE_INTEGER + 1,
          username: "unsafe",
          passwordHash: "dummy",
          createdAt: date,
          updatedAt: date,
        })
        .run(),
    ),
  );
  db.$client
    .prepare("INSERT INTO login_rate_limit (id,window,count) VALUES (1,0,9007199254740993)")
    .run();
  assert.throws(() => db.select().from(loginRateLimit).get(), /安全范围/);
  assert.deepEqual(db.$client.prepare("SELECT lower(?) AS lower").get("ÄÉ中文"), {
    lower: "äé中文",
  });
  assert.throws(() =>
    writeTransaction((tx) =>
      tx
        .insert(admin)
        .values({
          id: 2,
          username: "foundation",
          passwordHash: "dummy",
          createdAt: date,
          updatedAt: date,
        })
        .run(),
    ),
  );
});

void test("外键禁止跨文章回复，删除文章级联删除评论", () => {
  const db = getDatabase();
  const values = {
    title: "测试",
    content: "{}",
    summary: "",
    status: "draft",
    createdAt: date,
    updatedAt: date,
    version: 1,
  };
  writeTransaction((tx) => {
    tx.insert(post)
      .values([
        { ...values, id: "p1" },
        { ...values, id: "p2" },
      ])
      .run();
  });
  const reply = {
    author: "读者",
    authorKind: "visitor",
    content: "评论",
    status: "approved",
    createdAt: date,
    updatedAt: date,
    version: 1,
  };
  writeTransaction((tx) =>
    tx
      .insert(comment)
      .values({ ...reply, id: "parent", postId: "p1" })
      .run(),
  );
  assert.throws(() =>
    writeTransaction((tx) =>
      tx
        .insert(comment)
        .values({ ...reply, id: "invalid-reply", parentId: "parent", postId: "p2" })
        .run(),
    ),
  );
  writeTransaction((tx) => tx.delete(post).where(eq(post.id, "p1")).run());
  assert.equal(db.select().from(comment).where(eq(comment.id, "parent")).get(), undefined);
});

void test("两个独立进程共享 IMMEDIATE 写锁，不丢失并发更新", async () => {
  writeTransaction((tx) =>
    tx.insert(loginRateLimit).values({ id: 991, window: 0, count: 0 }).run(),
  );
  const execute = promisify(execFile);
  const run = () =>
    execute(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        "tests/fixtures/sqlite-writer.ts",
        process.env.DATABASE_PATH!,
      ],
      { timeout: 15_000 },
    );
  await Promise.all([run(), run()]);
  assert.equal(
    getDatabase().select().from(loginRateLimit).where(eq(loginRateLimit.id, 991)).get()?.count,
    80,
  );
});

void test("CLI 显式初始化新文件，重复初始化和错误路径拒绝写入", async () => {
  const execute = promisify(execFile);
  const path = join(directory, "cli.sqlite");
  const run = (command: string, databasePath = path) =>
    execute(process.execPath, ["--import", "tsx", "scripts/sqlite-database.ts", command], {
      env: { ...process.env, DATABASE_PATH: databasePath },
      timeout: 15_000,
    });
  await run("init");
  await run("verify");
  await run("migrate");
  const originalContents = await readFile(path);
  await assert.rejects(run("init"));
  assert.deepEqual(await readFile(path), originalContents);
  const missing = join(directory, "cli-missing.sqlite");
  await assert.rejects(run("migrate", missing));
  await assert.rejects(readFile(missing));
});

void test("完整校验拒绝 quick_check 无法发现的索引内容损坏", async () => {
  const path = join(directory, "corrupt-index.sqlite");
  const client = new Sqlite(path);
  let page: number;
  let pageSize: number;
  try {
    migrateDatabase(client);
    client
      .prepare(
        "INSERT INTO category (id,name,nameKey,color,createdAt) VALUES ('row1','Audit','audit','#000000',0)",
      )
      .run();
    page = client
      .prepare<[], { rootpage: number }>(
        "SELECT rootpage FROM sqlite_schema WHERE name='category_nameKey_unique'",
      )
      .get()!.rootpage;
    pageSize = Number(client.pragma("page_size", { simple: true }));
  } finally {
    client.close();
  }
  // 只损坏临时库的一个索引键，表记录不变，用于验证索引完整性检查确实生效。
  const contents = await readFile(path);
  const start = (page - 1) * pageSize;
  const offset = contents.subarray(start, start + pageSize).indexOf("audit");
  assert.ok(offset >= 0);
  Buffer.from("zudit").copy(contents, start + offset);
  await writeFile(path, contents);
  const damaged = new Sqlite(path, { readonly: true });
  try {
    assert.equal(damaged.pragma("quick_check", { simple: true }), "ok");
    assert.throws(() => verifyDatabase(damaged), /完整性/);
  } finally {
    damaged.close();
  }
});

void test("Drizzle 重建父表保留全部关联，迁移失败回滚并恢复外键开关", async () => {
  const folder = join(directory, "upgrade-migrations");
  await mkdir(join(folder, "meta"), { recursive: true });
  const initial = await readFile("drizzle/0000_initial_sqlite.sql", "utf8");
  const entries = [{ idx: 0, version: "6", when: 1, tag: "0000_initial", breakpoints: true }];
  const writeJournal = () =>
    writeFile(
      join(folder, "meta/_journal.json"),
      JSON.stringify({ version: "7", dialect: "sqlite", entries }),
    );
  await writeFile(join(folder, "0000_initial.sql"), initial);
  await writeJournal();
  const client = new Sqlite(join(directory, "upgrade.sqlite"));
  try {
    client.pragma("foreign_keys = ON");
    migrateDatabase(client, { migrationsFolder: folder });
    const db = drizzle(client);
    db.insert(category)
      .values({ id: "c", name: "分类", nameKey: "分类", color: "#000000", createdAt: date })
      .run();
    db.insert(tag).values({ id: "t", name: "标签", nameKey: "标签", createdAt: date }).run();
    db.insert(post)
      .values({
        id: "p",
        title: "文章",
        content: "{}",
        categoryId: "c",
        status: "draft",
        createdAt: date,
        updatedAt: date,
        version: 1,
      })
      .run();
    db.insert(comment)
      .values({
        id: "reply",
        postId: "p",
        author: "读者",
        authorKind: "visitor",
        content: "评论",
        status: "approved",
        createdAt: date,
        updatedAt: date,
        version: 1,
      })
      .run();
    db.insert(postTag).values({ postId: "p", tagId: "t" }).run();
    db.insert(visitSession)
      .values({ id: "v", visitorHash: "hash", createdAt: date, lastSeenAt: date })
      .run();
    db.insert(pageVisit)
      .values({
        id: "pv",
        visitorHash: "hash",
        sessionId: "v",
        postId: "p",
        path: "/posts/p",
        article: 1,
        source: "直接访问",
        referrerHost: "",
        device: "desktop",
        browser: "test",
        os: "test",
        ip: "未知",
        location: "未知",
        createdAt: date,
        lastSeenAt: date,
        durationMs: 0,
        progress: 0,
      })
      .run();
    const definition = initial.match(/CREATE TABLE `post` \([\s\S]+?\n\);/)![0];
    const replacement = definition
      .replace("CREATE TABLE `post`", "CREATE TABLE `__new_post`")
      .replace(
        "`version` integer NOT NULL",
        "`version` integer NOT NULL,\n\t`auditFlag` integer DEFAULT 0 NOT NULL",
      );
    const indexes = [...initial.matchAll(/CREATE (?:UNIQUE )?INDEX `[^`]+` ON `post`[^;]+;/g)].map(
      (match) => match[0],
    );
    const columns = client
      .prepare<[], { name: string }>("PRAGMA table_info(post)")
      .all()
      .map(({ name }) => `"${name}"`)
      .join(",");
    // 模拟 drizzle-kit 对 SQLite 字段变更生成的重建表 SQL。
    await writeFile(
      join(folder, "0001_rebuild.sql"),
      [
        "PRAGMA foreign_keys=OFF;",
        replacement,
        `INSERT INTO __new_post (${columns}) SELECT ${columns} FROM post;`,
        "DROP TABLE post;",
        "ALTER TABLE __new_post RENAME TO post;",
        ...indexes,
        "PRAGMA foreign_keys=ON;",
      ].join("\n--> statement-breakpoint\n"),
    );
    entries.push({ idx: 1, version: "6", when: 2, tag: "0001_rebuild", breakpoints: true });
    await writeJournal();
    migrateDatabase(client, { migrationsFolder: folder });
    assert.equal(db.select().from(comment).get()?.postId, "p");
    assert.equal(db.select().from(postTag).get()?.postId, "p");
    assert.equal(db.select().from(pageVisit).get()?.postId, "p");
    assert.equal(client.pragma("foreign_keys", { simple: true }), 1);
    client
      .transaction(() => {
        assert.throws(() => migrateDatabase(client, { migrationsFolder: folder }), /已有事务/);
      })
      .immediate();
    await writeFile(join(folder, "0002_invalid.sql"), "DELETE FROM category;");
    entries.push({ idx: 2, version: "6", when: 3, tag: "0002_invalid", breakpoints: true });
    await writeJournal();
    assert.throws(() => migrateDatabase(client, { migrationsFolder: folder }), /外键/);
    assert.equal(db.select().from(category).get()?.id, "c");
    assert.equal(
      client
        .prepare<[], { count: number }>("SELECT count(*) AS count FROM __drizzle_migrations")
        .get()?.count,
      2,
    );
    assert.equal(client.pragma("foreign_keys", { simple: true }), 1);
  } finally {
    client.close();
  }
});
