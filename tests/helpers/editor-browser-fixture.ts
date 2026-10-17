// 手工浏览器回归专用：只创建临时 SQLite 和项目副本，绝不加载业务 .env。
import Sqlite from "better-sqlite3";
import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { cp, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { syncAdminAccount } from "../../lib/auth/accounts";
import { hashPassword } from "../../lib/auth/password";
import { closeDatabase, writeTransaction } from "../../lib/database";
import { migrateDatabase } from "../../lib/database/migrations";
import { admin, category, post } from "../../lib/database/schema";
import { serializeDocument } from "../../lib/posts/document";
import { legacyEditorDocument } from "../fixtures/editor-document";

const project = resolve(import.meta.dirname, "../..");
const directory = await mkdtemp(join(tmpdir(), "fx-editor-browser-"));
const username = "editor_browser_test";
const categoryId = randomUUID();
const postId = randomUUID();
const password = "editor-browser-test-password";
const listener = createServer();
listener.listen(0, "127.0.0.1");
await once(listener, "listening");
const address = listener.address();
if (!address || typeof address === "string") throw new Error("无法分配测试端口。");
const port = address.port;
await new Promise<void>((resolveClose) => listener.close(() => resolveClose()));
const origin = `http://127.0.0.1:${port}`;
process.env.DATABASE_PATH = join(directory, "editor.sqlite");
process.env.APP_ORIGIN = origin;
process.env.BETTER_AUTH_SECRET = "editor-browser-fixture-only-secret-32-chars";
let server: ChildProcess | undefined;
let logs = "";

async function stop() {
  if (server?.pid && server.exitCode === null) {
    const exited = once(server, "exit");
    process.kill(-server.pid, "SIGTERM");
    const force = setTimeout(() => {
      if (server?.pid && server.exitCode === null) process.kill(-server.pid, "SIGKILL");
    }, 5000);
    await exited;
    clearTimeout(force);
  }
  closeDatabase();
  await rm(directory, { recursive: true, force: true });
}

try {
  await writeFile(process.env.DATABASE_PATH, "", { flag: "wx", mode: 0o600 });
  const client = new Sqlite(process.env.DATABASE_PATH);
  try {
    client.pragma("foreign_keys = ON");
    migrateDatabase(client);
  } finally {
    client.close();
  }
  const passwordHash = await hashPassword(password);
  const now = new Date();
  writeTransaction((tx) => {
    tx.insert(admin)
      .values({ id: 1, username, passwordHash, createdAt: now, updatedAt: now })
      .run();
    syncAdminAccount(tx);
    tx.insert(category)
      .values({
        id: categoryId,
        name: "编辑器回归",
        nameKey: "编辑器回归",
        color: "#0064fa",
        createdAt: now,
      })
      .run();
    tx.insert(post)
      .values({
        id: postId,
        title: "旧文章兼容回归",
        slug: "editor-fixture-legacy",
        content: serializeDocument(legacyEditorDocument),
        categoryId,
        status: "draft",
        version: 1,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  });
  closeDatabase();
  for (const path of [
    "app",
    "components",
    "lib",
    "drizzle",
    "public",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
  ]) {
    await cp(join(project, path), join(directory, path), { recursive: true });
  }
  await symlink(join(project, "node_modules"), join(directory, "node_modules"), "dir");
  // 副本没有 IDE 运行配置；与现有 :3000 服务、构建目录及数据库完全隔离。
  const childEnv: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "development",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  for (const key of Object.keys(childEnv))
    if (/^(OSS_|ALIBABA_CLOUD_|AWS_)/.test(key)) delete childEnv[key];
  const child = spawn(
    process.execPath,
    [
      join(project, "node_modules/next/dist/bin/next"),
      "dev",
      directory,
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
      "--webpack",
    ],
    {
      cwd: directory,
      env: childEnv,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server = child;
  for (const stream of [child.stdout, child.stderr])
    stream?.on("data", (chunk: Buffer) => {
      logs = (logs + chunk.toString()).slice(-12000);
    });
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (child.exitCode !== null) throw new Error(logs);
    try {
      const response = await fetch(`${origin}/login`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* 首次编译期间等待独立服务。 */
    }
    await delay(500);
  }
  if (!ready) throw new Error(`测试服务未就绪：${logs}`);
  console.log(
    JSON.stringify({
      origin,
      directory,
      username,
      categoryId,
      postId,
      password,
      stop: "向 stdin 写入 stop 或发送 SIGTERM 后自动清理",
    }),
  );
  await new Promise<void>((resolveStop) => {
    const finish = () => {
      // TTY 的输入流会保持进程存活，清理后必须恢复暂停状态。
      process.stdin.off("data", finish);
      process.stdin.pause();
      process.off("SIGTERM", finish);
      process.off("SIGINT", finish);
      resolveStop();
    };
    process.stdin.once("data", finish);
    process.once("SIGTERM", finish);
    process.once("SIGINT", finish);
  });
} finally {
  await stop();
}
