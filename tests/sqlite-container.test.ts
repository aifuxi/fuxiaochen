import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";

import { serializeDocument } from "../lib/posts/document";

const image = process.env.TEST_SQLITE_IMAGE;
const project = resolve(import.meta.dirname, "..");
const origin = "https://sqlite-container-test.example";
const password = "sqlite-container-independent-password";
const categoryId = "c548b67d-2e86-4d7c-a1f5-74b51b4249aa";
const postId = "4b612872-7410-4de5-a01c-136d9053c6dd";
const scheduledId = "462e8d1e-b994-4c23-82bc-6a2728b36c22";
const content = serializeDocument({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "容器独立测试正文" }] }],
});

type Result = { code: number; stdout: string; stderr: string };

// 不接受 shell 字符串、不拉取镜像；所有 Docker 对象均由本测试独占创建。
function docker(args: string[], input?: string, timeout = 90_000): Promise<Result> {
  return new Promise((resolveCommand, reject) => {
    const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), timeout);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolveCommand({ code: code ?? 1, stdout, stderr });
    });
    child.stdin.end(input);
  });
}

function successful(result: Result, context: string) {
  assert.equal(result.code, 0, `${context}：${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

const stateSchema = z.object({
  Running: z.boolean(),
  ExitCode: z.number(),
  Health: z.object({ Status: z.string() }).optional(),
});

const backupSchema = z.array(
  z.object({ directory: z.string(), manifest: z.record(z.string(), z.unknown()) }),
);

function baseArguments(volume: string, extra: string[] = []) {
  return [
    "--pull",
    "never",
    "--mount",
    `type=volume,source=${volume},target=/app/data`,
    "--env",
    "DATABASE_PATH=/app/data/database.sqlite",
    "--env",
    "BACKUP_DIRECTORY=/app/data/backups",
    "--env",
    `APP_ORIGIN=${origin}`,
    "--env",
    "BETTER_AUTH_SECRET=container-test-only-better-auth-secret-32-chars",
    ...extra,
  ];
}

async function state(name: string) {
  return stateSchema.parse(
    JSON.parse(
      successful(
        await docker(["inspect", "--format", "{{json .State}}", name]),
        "读取测试容器状态",
      ),
    ),
  );
}

async function containerLogs(name: string) {
  const result = await docker(["logs", name]);
  successful(result, "读取专用测试容器日志");
  return result.stdout + result.stderr;
}

async function waitHealthy(name: string) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const current = await state(name);
    if (!current.Running) assert.fail(`容器提前退出：${await containerLogs(name)}`);
    if (current.Health?.Status === "healthy") return;
    await delay(500);
  }
  assert.fail(`测试容器没有进入 healthy：${await containerLogs(name)}`);
}

async function waitRejected(name: string, expectedCode = 2) {
  const result = await docker(["wait", name], undefined, 30_000);
  assert.equal(Number(successful(result, "等待启动保护退出")), expectedCode);
  assert.equal((await state(name)).Running, false);
  const logs = await containerLogs(name);
  assert.doesNotMatch(logs, /Ready in|Starting\.\.\./, "保护失败时不能启动 Next Web。");
}

void test(
  "SQLite 单镜像：独立卷中的启动保护、Web、运维与信号退出",
  { skip: !image && "设置 TEST_SQLITE_IMAGE 指向本地构建镜像后运行", timeout: 600_000 },
  async (t) => {
    assert.ok(image);
    // 镜像变量不能代替本机限制；先读取 context 元信息，远程 endpoint 下不创建任何资源。
    const dockerEndpoint = z
      .string()
      .parse(
        JSON.parse(
          successful(
            await docker(["context", "inspect", "--format", "{{json .Endpoints.docker.Host}}"]),
            "核对本机 Docker context",
          ),
        ),
      );
    assert.ok(
      dockerEndpoint.startsWith("unix://"),
      "容器演练仅允许本机 Unix Docker socket，拒绝远程 context。",
    );
    const suffix = randomUUID().slice(0, 8);
    const volumes: string[] = [];
    const containers: string[] = [];
    const workspace = await mkdtemp(join(tmpdir(), "fx-sqlite-container-"));

    async function newVolume(label: string) {
      const name = `fx-sqlite-test-${suffix}-${label}`;
      successful(
        await docker(["volume", "create", "--label", "codex.task=sqlite-container-tests", name]),
        "创建专用测试卷",
      );
      volumes.push(name);
      return name;
    }

    async function node(volume: string, script: string, extra: string[] = []) {
      return docker(
        [
          "run",
          "--rm",
          "--interactive",
          "--network",
          "none",
          ...baseArguments(volume, extra),
          image!,
          "node",
          "--conditions=react-server",
          "--import",
          "tsx",
          "--input-type=module",
        ],
        script,
      );
    }

    async function cli(volume: string, script: string, args: string[] = [], extra: string[] = []) {
      return docker([
        "run",
        "--rm",
        "--network",
        "none",
        ...baseArguments(volume, extra),
        image!,
        "node",
        "--conditions=react-server",
        "--import",
        "tsx",
        `scripts/${script}.ts`,
        ...args,
      ]);
    }

    async function seed(volume: string) {
      successful(
        await node(
          volume,
          `import Sqlite from 'better-sqlite3';
import argon2 from 'argon2';
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { migrateDatabase } from './lib/database/migrations.ts';
import { syncAdminAccount } from './lib/auth/accounts.ts';
import { drizzle } from 'drizzle-orm/better-sqlite3';
mkdirSync('/app/data/backups', { recursive: true, mode: 0o700 });
closeSync(openSync(process.env.DATABASE_PATH, 'wx', 0o600));
const db = new Sqlite(process.env.DATABASE_PATH, { fileMustExist: true });
db.pragma('foreign_keys = ON');
migrateDatabase(db);
const now = Date.now();
const hash = await argon2.hash(${JSON.stringify(password)}, { type: argon2.argon2id });
db.prepare('INSERT INTO admin VALUES (1, ?, ?, ?, ?)').run('container_admin', hash, now, now);
syncAdminAccount(drizzle(db));
db.prepare('INSERT INTO category VALUES (?, ?, ?, ?, ?)').run(${JSON.stringify(categoryId)}, '容器分类', '容器分类', '#123456', now);
const insert = db.prepare('INSERT INTO post (id, title, slug, content, categoryId, status, createdAt, updatedAt, publishedAt, scheduledFor, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)');
insert.run(${JSON.stringify(postId)}, '容器独立文章', 'container-test', ${JSON.stringify(content)}, ${JSON.stringify(categoryId)}, 'published', now, now, now, null);
insert.run(${JSON.stringify(scheduledId)}, '容器独立排期', 'container-scheduled', ${JSON.stringify(content)}, ${JSON.stringify(categoryId)}, 'scheduled', now, now, null, now - 1000);
db.close();`,
        ),
        "在镜像内创建独立测试库",
      );
    }

    async function start(volume: string, label: string, extra: string[] = []) {
      const name = `fx-sqlite-test-${suffix}-${label}`;
      containers.push(name);
      successful(
        await docker([
          "run",
          "--detach",
          "--name",
          name,
          "--label",
          "codex.task=sqlite-container-tests",
          "--stop-timeout",
          "10",
          "--publish",
          "127.0.0.1::3000",
          ...baseArguments(volume, extra),
          image!,
        ]),
        "启动独立应用容器",
      );
      return name;
    }

    async function backups(volume: string) {
      const result = await node(
        volume,
        `import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const found = [];
function visit(path) {
  if (!existsSync(path)) return;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) visit(child);
    else if (entry.name === 'manifest.json') found.push({ directory: path, manifest: JSON.parse(readFileSync(child, 'utf8')) });
  }
}
visit('/app/data/backups');
console.log(JSON.stringify(found));`,
      );
      return backupSchema.parse(JSON.parse(successful(result, "读取专用卷备份清单")));
    }

    try {
      await t.test("镜像默认使用 node 用户、单一 Web 入口且运维依赖可调用", async () => {
        const configuration = z
          .object({ User: z.string(), Cmd: z.array(z.string()) })
          .parse(
            JSON.parse(
              successful(
                await docker(["image", "inspect", "--format", "{{json .Config}}", image]),
                "确认本地镜像存在",
              ),
            ),
          );
        assert.ok(["node", "1000", "1000:1000"].includes(configuration.User));
        assert.deepEqual(configuration.Cmd, ["serve"]);
        const volume = await newVolume("native");
        const result = await node(
          volume,
          `import Sqlite from 'better-sqlite3';
import argon2 from 'argon2';
import sharp from 'sharp';
import { existsSync } from 'node:fs';
if (process.getuid() !== 1000) throw new Error('要求非 root UID 1000');
const db = new Sqlite(':memory:');
if (db.prepare('SELECT 40 + 2 AS answer').get().answer !== 42) throw new Error('SQLite 原生驱动不可用');
db.close();
const hash = await argon2.hash('container-native-test');
if (!(await argon2.verify(hash, 'container-native-test'))) throw new Error('Argon2 不可用');
await sharp({ create: { width: 1, height: 1, channels: 3, background: 'white' } }).png().toBuffer();
for (const path of ['scripts/sqlite-database.ts', 'scripts/admin.ts', 'scripts/operations.ts', 'scripts/restore-backup.ts', 'drizzle/meta/_journal.json']) {
  if (!existsSync(path)) throw new Error('缺少同镜像运维文件');
}
for (const path of ['node_modules/prisma', 'node_modules/@prisma/orm-postgres', '/usr/bin/pg_dump']) {
  if (existsSync(path)) throw new Error('运行镜像残留 PostgreSQL/Prisma 工具');
}
console.log('native-runtime-ok');`,
        );
        assert.equal(successful(result, "验证目标平台原生模块及同镜像 CLI"), "native-runtime-ok");
      });

      await t.test("缺失数据库默认拒绝启动，且没有隐式创建空文件", async () => {
        const volume = await newVolume("missing");
        await waitRejected(await start(volume, "missing"));
        const result = await node(
          volume,
          `import { existsSync } from 'node:fs'; console.log(existsSync(process.env.DATABASE_PATH));`,
        );
        assert.equal(successful(result, "核对缺失文件未被创建"), "false");
      });

      await t.test("显式首次初始化能够健康启动并生成已迁移的新库", async () => {
        const volume = await newVolume("initialize");
        const name = await start(volume, "initialize", ["--env", "SQLITE_INITIALIZE=1"]);
        await waitHealthy(name);
        assert.equal((await cli(volume, "sqlite-database", ["verify"])).code, 0);
        successful(await docker(["stop", "--time", "10", name]), "停止首次初始化测试容器");
      });

      const mainVolume = await newVolume("business");
      await seed(mainVolume);
      let mainContainer = "";
      let serverOrigin = "";
      let cookie = "";

      await t.test("已有库启动前产生一致性备份，通过迁移校验与健康检查", async () => {
        mainContainer = await start(mainVolume, "business");
        await waitHealthy(mainContainer);
        const port = successful(
          await docker(["port", mainContainer, "3000/tcp"]),
          "读取随机本机端口",
        );
        assert.match(port, /^127\.0\.0\.1:\d+$/);
        serverOrigin = `http://${port}`;
        const response = await fetch(`${serverOrigin}/login`, {
          signal: AbortSignal.timeout(10_000),
        });
        assert.equal(response.status, 200);
        const saved = (await backups(mainVolume)).find(
          (backup) => backup.manifest.purpose === "before-startup-migration",
        );
        assert.ok(saved, "已有库每次启动必须先生成备份。");
        successful(
          await node(
            mainVolume,
            `import Sqlite from 'better-sqlite3';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const directory = ${JSON.stringify(saved.directory)};
const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'));
const path = join(directory, 'database.sqlite');
const bytes = readFileSync(path);
if (manifest.bytes !== bytes.length || manifest.sha256 !== createHash('sha256').update(bytes).digest('hex')) throw new Error('快照摘要不匹配');
if ((statSync(path).mode & 0o777) !== 0o600) throw new Error('快照权限不私有');
const db = new Sqlite(path, { readonly: true, fileMustExist: true });
if (db.pragma('integrity_check', { simple: true }) !== 'ok' || db.pragma('foreign_key_check').length) throw new Error('快照完整性失败');
if (db.prepare('SELECT COUNT(*) AS count FROM post').get().count !== 2) throw new Error('快照文章遗漏');
if (db.prepare('SELECT COUNT(*) AS count FROM auth_session').get().count !== 0) throw new Error('启动快照应在 HTTP 登录之前');
db.close();`,
          ),
          "核对启动快照摘要、权限、完整性和实际业务记录",
        );
        successful(
          await cli(
            mainVolume,
            "restore-backup",
            [saved.directory],
            ["--env", "RESTORE_DATABASE_PATH=/app/data/restored-startup.sqlite"],
          ),
          "迁移前自动备份可由同镜像 CLI 恢复到独立新文件",
        );
        successful(
          await cli(
            mainVolume,
            "sqlite-database",
            ["verify"],
            ["--env", "DATABASE_PATH=/app/data/restored-startup.sqlite"],
          ),
          "恢复的启动快照通过独立文件完整校验",
        );
        const restoredContainer = await start(mainVolume, "restored-startup", [
          "--env",
          "DATABASE_PATH=/app/data/restored-startup.sqlite",
        ]);
        await waitHealthy(restoredContainer);
        successful(
          await docker(["stop", "--time", "10", restoredContainer]),
          "恢复副本第一次启动验证后停止其独立 Web",
        );
        assert.equal((await cli(mainVolume, "sqlite-database", ["verify"])).code, 0);
        const pid = successful(
          await docker([
            "exec",
            mainContainer,
            "node",
            "-e",
            // Next 会修改进程 title；可执行文件才表明 PID 1 由 Node 直接运行。
            "console.log(require('node:fs').readlinkSync('/proc/1/exe'))",
          ]),
          "确认 PID 1",
        );
        assert.match(pid, /\/node$/);
      });

      await t.test("真实 HTTP 登录与公开/后台业务读取使用独立库", async () => {
        const login = await fetch(`${serverOrigin}/api/login`, {
          method: "POST",
          redirect: "manual",
          headers: { Origin: origin, "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ username: "container_admin", password }),
        });
        assert.equal(login.status, 303);
        const setCookie = login.headers.get("set-cookie");
        assert.match(setCookie ?? "", /HttpOnly/i);
        assert.match(setCookie ?? "", /Secure/i);
        cookie = setCookie?.split(";")[0] ?? "";
        assert.ok(cookie);
        const posts = await fetch(`${serverOrigin}/api/admin/posts`, {
          headers: { Cookie: cookie },
        });
        assert.equal(posts.status, 200);
        const data = z
          .object({ data: z.object({ items: z.array(z.object({ id: z.string() })) }) })
          .parse(await posts.json());
        assert.ok(data.data.items.some((post) => post.id === postId));
        const article = await fetch(`${serverOrigin}/posts/container-test`);
        assert.equal(article.status, 200);
        assert.ok((await article.text()).includes("容器独立测试正文"));
      });

      await t.test("同卷第二个 Web 与在线直接迁移均被拒绝", async () => {
        await waitRejected(await start(mainVolume, "duplicate"), 5);
        const migration = await cli(mainVolume, "sqlite-database", ["migrate"]);
        assert.equal(migration.code, 5, "Web 持有共享维护锁期间不能迁移。");
        for (const args of [
          ["npm", "run", "--silent", "db:migrate"],
          ["npm", "--silent", "run", "db:startup"],
        ]) {
          const result = await docker([
            "run",
            "--rm",
            "--network",
            "none",
            ...baseArguments(mainVolume),
            image,
            ...args,
          ]);
          assert.equal(result.code, 5, `${args.join(" ")} 不能因 npm flags 绕过独占维护锁。`);
        }
        assert.equal((await state(mainContainer)).Running, true);
      });

      await t.test("同镜像排期与在线备份 CLI 可运行，Web 能立即读取结果", async () => {
        const publication = z
          .object({ published: z.number(), skipped: z.number() })
          .parse(
            JSON.parse(
              successful(await cli(mainVolume, "operations", ["publish"]), "运行同镜像排期命令"),
            ),
          );
        assert.equal(publication.published, 1);
        assert.equal(publication.skipped, 0);
        const published = await fetch(`${serverOrigin}/posts/container-scheduled`);
        assert.equal(published.status, 200);
        const backup = z
          .object({ id: z.string(), status: z.literal("complete") })
          .parse(
            JSON.parse(
              successful(await cli(mainVolume, "operations", ["backup"]), "运行同镜像在线备份"),
            ),
          );
        const rows = await backups(mainVolume);
        const archived = rows.find((row) => row.manifest.id === backup.id);
        assert.ok(archived);
        assert.equal(archived.manifest.format, "fuxiaochen-sqlite-backup");
        successful(
          await cli(
            mainVolume,
            "restore-backup",
            [archived.directory],
            ["--env", "RESTORE_DATABASE_PATH=/app/data/restored.sqlite"],
          ),
          "在专用卷恢复到独立新文件",
        );
        const restored = await node(
          mainVolume,
          `import Sqlite from 'better-sqlite3';
const db = new Sqlite('/app/data/restored.sqlite', { readonly: true, fileMustExist: true });
console.log(JSON.stringify({ session: db.prepare('SELECT COUNT(*) AS count FROM auth_session').get().count, posts: db.prepare('SELECT COUNT(*) AS count FROM post').get().count }));
db.close();`,
        );
        assert.deepEqual(JSON.parse(successful(restored, "核对恢复副本会话撤销与文章保留")), {
          session: 0,
          posts: 2,
        });
      });

      await t.test("重启重新自动备份，SIGTERM 由 Node PID 1 接收并正常退出", async () => {
        const before = (await backups(mainVolume)).length;
        successful(await docker(["stop", "--time", "10", mainContainer]), "向专用容器发送 SIGTERM");
        assert.ok(
          [0, 143].includes((await state(mainContainer)).ExitCode),
          "不能依赖 SIGKILL 强制退出。",
        );
        successful(
          await cli(mainVolume, "sqlite-database", ["migrate"]),
          "Web 停止后独占维护锁应释放，允许同镜像迁移",
        );
        successful(await docker(["start", mainContainer]), "重新启动专用容器");
        await waitHealthy(mainContainer);
        // Docker 的自动宿主机端口可能在 restart 后重新分配。
        serverOrigin = `http://${successful(await docker(["port", mainContainer, "3000/tcp"]), "读取重启后的随机端口")}`;
        assert.ok(
          (await backups(mainVolume)).length > before,
          "重新部署/重启必须重新执行启动保护。",
        );
        const response = await fetch(`${serverOrigin}/api/admin/posts`, {
          headers: { Cookie: cookie },
        });
        assert.equal(response.status, 200, "重启应保留数据库与现有会话。");
      });

      await t.test("不可写的备份目录阻断启动并保留已有数据", async () => {
        const volume = await newVolume("readonly-backup");
        await seed(volume);
        const directory = join(workspace, "readonly-backups");
        await mkdir(directory);
        // 真正只读挂载不能被服务账号通过 chmod 修复成可写目录。
        await waitRejected(
          await start(volume, "readonly-backup", [
            "--mount",
            `type=bind,source=${directory},target=/app/data/backups,readonly`,
          ]),
        );
        assert.equal((await cli(volume, "sqlite-database", ["verify"])).code, 0);
      });

      for (const [label, sql] of [
        ["bad-ledger", "UPDATE __drizzle_migrations SET hash = 'tampered'"],
        ["bad-schema", "ALTER TABLE admin ADD COLUMN unexpected TEXT"],
        [
          "bad-foreign-key",
          "INSERT INTO post_tag (postId, tagId) VALUES ('missing-post', 'missing-tag')",
        ],
      ]) {
        await t.test(`${label} 校验失败时拒绝启动 Web`, async () => {
          const volume = await newVolume(label);
          await seed(volume);
          successful(
            await node(
              volume,
              `import Sqlite from 'better-sqlite3'; const db = new Sqlite(process.env.DATABASE_PATH); db.pragma('foreign_keys = OFF'); db.exec(${JSON.stringify(sql)}); db.close();`,
            ),
            "准备专用损坏测试库",
          );
          await waitRejected(await start(volume, label));
        });
      }

      await t.test("待执行迁移失败整体回滚，保留迁移前备份且拒绝启动 Web", async () => {
        const volume = await newVolume("failed-migration");
        await seed(volume);
        const folder = join(workspace, "failed-migrations");
        await cp(join(project, "drizzle"), folder, { recursive: true });
        const journalPath = join(folder, "meta", "_journal.json");
        const journal = z
          .object({
            entries: z.array(z.object({ idx: z.number(), when: z.number() }).passthrough()),
          })
          .passthrough()
          .parse(JSON.parse(await readFile(journalPath, "utf8")));
        const previous = journal.entries.at(-1)!;
        journal.entries.push({
          idx: previous.idx + 1,
          version: "6",
          when: previous.when + 1,
          tag: "9999_container_failure",
          breakpoints: true,
        });
        await writeFile(journalPath, JSON.stringify(journal));
        await writeFile(
          join(folder, "9999_container_failure.sql"),
          "CREATE TABLE startup_probe (value INTEGER);\n--> statement-breakpoint\nINSERT INTO missing_table VALUES (1);\n",
        );
        // 只挂载测试副本，不修改镜像或仓库中已提交的迁移。
        await waitRejected(
          await start(volume, "failed-migration", [
            "--mount",
            `type=bind,source=${folder},target=/app/drizzle,readonly`,
          ]),
        );
        assert.equal(
          (await cli(volume, "sqlite-database", ["verify"])).code,
          0,
          "失败后仍应符合原镜像 schema 与历史。",
        );
        const result = await node(
          volume,
          `import Sqlite from 'better-sqlite3'; const db = new Sqlite(process.env.DATABASE_PATH, { readonly: true }); console.log(db.prepare("SELECT COUNT(*) AS count FROM sqlite_schema WHERE name='startup_probe'").get().count); db.close();`,
        );
        assert.equal(successful(result, "核对迁移 DDL 已回滚"), "0");
        assert.ok((await backups(volume)).length > 0, "迁移 SQL 执行前必须先保存可用备份。");
      });
    } finally {
      // 清理只使用本测试登记的名字，不触碰已有容器、应用卷或宿主机数据库。
      for (const name of containers) await docker(["rm", "--force", name]);
      for (const name of volumes) await docker(["volume", "rm", name]);
      await rm(workspace, { recursive: true, force: true });
    }
  },
);
