import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { stripVTControlCharacters } from "node:util";
import { z } from "zod";

const image = process.env.TEST_SQLITE_IMAGE;
const portainerImage = process.env.TEST_PORTAINER_IMAGE ?? "portainer/portainer-ce:lts";
type DockerResult = { code: number; stdout: string; stderr: string };

// 不接受 shell 字符串、不 pull/build；仅创建和删除本次随机登记的测试资源。
function docker(args: string[], input?: string, timeout = 90_000): Promise<DockerResult> {
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
function success(result: DockerResult, context: string) {
  assert.equal(result.code, 0, `${context}：${result.stderr || result.stdout}`);
  return result.stdout.trim();
}
const stackSchema = z.object({
  Id: z.number().int().positive(),
  Name: z.string(),
  EndpointId: z.number().int().positive(),
});
const stateSchema = z.object({
  Running: z.boolean(),
  Health: z.object({ Status: z.string() }).optional(),
});

void test(
  "本机独立 Portainer CE：SQLite 单服务 Stack 部署、重新部署和清理",
  { skip: !image && "设置 TEST_SQLITE_IMAGE 指向本地构建镜像后运行", timeout: 360_000 },
  async (t) => {
    assert.ok(image);
    success(await docker(["image", "inspect", image]), "确认已有本地 SQLite 镜像");
    success(await docker(["image", "inspect", portainerImage]), "确认已有本地 Portainer 镜像");
    const contextHost = z
      .string()
      .parse(
        JSON.parse(
          success(
            await docker(["context", "inspect", "--format", "{{json .Endpoints.docker.Host}}"]),
            "核对本机 Docker context",
          ),
        ),
      );
    assert.match(
      contextHost,
      /^unix:\/\//,
      "演练仅允许本机 Unix Docker socket，拒绝远程 context。",
    );

    const suffix = randomUUID().slice(0, 8);
    const stackName = `fx-sqlite-portainer-${suffix}`;
    const portainerName = `${stackName}-manager`;
    const appVolume = `${stackName}-app-data`;
    const managerVolume = `${stackName}-manager-data`;
    const network = `${stackName}-edge`;
    const createdVolumes: string[] = [];
    let createdNetwork = false;
    let managerCreated = false;
    let managerOrigin = "";
    let token = "";
    let setupToken = "";
    let endpointId = 0;
    let stackId = 0;
    let appId = "";
    let appOrigin = "";
    let backupCount = 0;
    const origin = "https://sqlite-portainer-test.example";
    const password = randomBytes(32).toString("base64url");
    const label = "codex.task=sqlite-portainer-tests";

    async function request(path: string, method = "GET", body?: unknown) {
      const options: RequestInit = {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(setupToken && path === "/users/admin/init" ? { "X-Setup-Token": setupToken } : {}),
          ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        },
        signal: AbortSignal.timeout(90_000),
      };
      if (body !== undefined) options.body = body instanceof FormData ? body : JSON.stringify(body);
      const response = await fetch(`${managerOrigin}/api${path}`, options);
      // 错误响应可能带认证上下文；只公开操作和 HTTP 状态，不打印 payload 或凭据。
      assert.ok(response.ok, `本地 Portainer ${method} ${path} 返回 ${response.status}`);
      const value = await response.text();
      return value ? (JSON.parse(value) as unknown) : null;
    }

    async function ownAppIds() {
      const found = success(
        await docker([
          "ps",
          "--all",
          "--filter",
          `label=com.docker.compose.project=${stackName}`,
          "--format",
          "{{.ID}}",
        ]),
        "读取本测试 Stack 容器",
      );
      return found ? found.split("\n") : [];
    }

    async function waitApp(previousId?: string) {
      for (let attempt = 0; attempt < 140; attempt++) {
        const ids = await ownAppIds();
        if (ids.length === 1 && ids[0] !== previousId) {
          const current = stateSchema.parse(
            JSON.parse(
              success(
                await docker(["inspect", "--format", "{{json .State}}", ids[0]]),
                "读取专用 Stack 健康状态",
              ),
            ),
          );
          if (current.Running && current.Health?.Status === "healthy") return ids[0];
        }
        await delay(500);
      }
      return assert.fail("专用 Portainer Stack 未在等待时间内完成健康启动。");
    }

    async function node(script: string) {
      return docker(
        [
          "run",
          "--rm",
          "--interactive",
          "--pull",
          "never",
          "--network",
          "none",
          "--mount",
          `type=volume,source=${appVolume},target=/app/data`,
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
    async function startupBackups() {
      const result = await node(`import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = '/app/data/backups/startup';
const complete = existsSync(root) ? readdirSync(root).filter(id => {
  const path = join(root, id, 'manifest.json');
  return existsSync(path) && JSON.parse(readFileSync(path, 'utf8')).purpose === 'before-startup-migration';
}) : [];
console.log(complete.length);`);
      const count = Number(success(result, "读取专用卷启动备份数量"));
      assert.ok(Number.isSafeInteger(count) && count >= 0);
      return count;
    }

    try {
      await t.test("创建全新本机 Portainer、私有数据卷和独立外部网络", async () => {
        for (const name of [managerVolume, appVolume]) {
          success(await docker(["volume", "create", "--label", label, name]), "创建本次独立测试卷");
          createdVolumes.push(name);
        }
        success(
          await docker(["network", "create", "--label", label, network]),
          "创建本次独立测试网络",
        );
        createdNetwork = true;
        success(
          await docker([
            "run",
            "--detach",
            "--pull",
            "never",
            "--name",
            portainerName,
            "--label",
            label,
            "--publish",
            "127.0.0.1::9000",
            "--mount",
            `type=volume,source=${managerVolume},target=/data`,
            "--mount",
            "type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock",
            portainerImage,
            "--http-enabled",
          ]),
          "启动全新本机 Portainer 测试实例",
        );
        managerCreated = true;
        const port = success(
          await docker(["port", portainerName, "9000/tcp"]),
          "读取本机 Portainer 随机端口",
        );
        assert.match(port, /^127\.0\.0\.1:\d+$/);
        managerOrigin = `http://${port}`;
        let available = false;
        for (let attempt = 0; attempt < 80; attempt++) {
          try {
            const response = await fetch(`${managerOrigin}/api/status`, {
              signal: AbortSignal.timeout(2_000),
            });
            if (response.ok) {
              const status = z.object({ Version: z.string() }).parse(await response.json());
              t.diagnostic(`独立 Portainer CE ${status.Version}，仅使用本地镜像。`);
              available = true;
              break;
            }
          } catch {
            /* 首次启动期间仅等待本次实例，不连接任何已有 Portainer。 */
          }
          await delay(250);
        }
        assert.equal(available, true, "新 Portainer 未就绪。");
        // CE 2.39.4 起首次初始化要求一次性 setup token；只读取本次实例日志，绝不打印。
        const managerLogs = await docker(["logs", portainerName]);
        assert.equal(managerLogs.code, 0, "无法读取本次 Portainer 初始化令牌。");
        const startupLogs = stripVTControlCharacters(managerLogs.stdout + managerLogs.stderr);
        setupToken = startupLogs.match(/setup_token(?:=|":\s*")"?([a-f0-9]{64})/i)?.[1] ?? "";
        await request("/users/admin/init", "POST", {
          Username: "independent_test",
          Password: password,
        });
        setupToken = "";
        token = z.object({ jwt: z.string().min(1) }).parse(
          await request("/auth", "POST", {
            Username: "independent_test",
            Password: password,
          }),
        ).jwt;
        const form = new FormData();
        form.set("Name", `${stackName}-local`);
        form.set("EndpointCreationType", "1");
        const endpoint = z
          .object({ Id: z.number().int().positive(), URL: z.string() })
          .parse(await request("/endpoints", "POST", form));
        assert.equal(endpoint.URL, "unix:///var/run/docker.sock");
        endpointId = endpoint.Id;
        assert.deepEqual(await request("/stacks"), [], "全新 Portainer 元数据中不能有已有 Stack。");
      });
      assert.ok(token && endpointId && managerOrigin, "Portainer 初始化失败，停止后续依赖操作。");

      await t.test("同镜像显式初始化独立 SQLite 文件，默认不自动建库", async () => {
        success(
          await docker([
            "run",
            "--rm",
            "--pull",
            "never",
            "--network",
            "none",
            "--mount",
            `type=volume,source=${appVolume},target=/app/data`,
            image,
            "npm",
            "run",
            "db:init",
          ]),
          "同镜像初始化专用新文件",
        );
        assert.equal(await startupBackups(), 0);
      });

      const compose = await readFile(resolve(import.meta.dirname, "../compose.yaml"), "utf8");
      assert.match(compose, /^  app:$/m);
      const stackFile = (iteration: number) =>
        compose.replace(
          /^  app:\n/m,
          `  app:\n    # 演练仅覆盖本机端口和测试标签，禁止拉取镜像。\n    pull_policy: never\n    ports:\n      - "127.0.0.1::3000"\n    labels:\n      codex.task: sqlite-portainer-tests\n      codex.redeploy: "${iteration}"\n`,
        );
      const environment = [
        { name: "APP_IMAGE", value: image },
        { name: "APP_DATA_VOLUME", value: appVolume },
        { name: "CADDY_NETWORK", value: network },
        { name: "APP_ORIGIN", value: origin },
        { name: "SQLITE_INITIALIZE", value: "0" },
      ];

      await t.test("通过真实 Portainer string Stack API 部署仓库单服务 Compose", async () => {
        const stack = stackSchema.parse(
          await request(`/stacks/create/standalone/string?endpointId=${endpointId}`, "POST", {
            Name: stackName,
            StackFileContent: stackFile(1),
            Env: environment,
          }),
        );
        assert.equal(stack.Name, stackName);
        assert.equal(stack.EndpointId, endpointId);
        stackId = stack.Id;
        appId = await waitApp();
        const port = success(await docker(["port", appId, "3000/tcp"]), "读取本机 Stack 应用端口");
        assert.match(port, /^127\.0\.0\.1:\d+$/);
        appOrigin = `http://${port}`;
        assert.equal(
          (await fetch(`${appOrigin}/login`, { signal: AbortSignal.timeout(10_000) })).status,
          200,
        );
        backupCount = await startupBackups();
        assert.equal(backupCount, 1, "首次部署已有库应生成一份启动前备份。");
        const stored = z
          .object({ StackFileContent: z.string() })
          .parse(await request(`/stacks/${stackId}/file`));
        assert.equal(stored.StackFileContent, stackFile(1));
      });
      assert.ok(appId && stackId, "首次 Stack 启动失败，停止重新部署演练。");

      await t.test("Portainer 更新同一 Stack 一次完成重新部署并增加启动备份", async () => {
        const previous = appId;
        const updated = stackSchema.parse(
          await request(`/stacks/${stackId}?endpointId=${endpointId}`, "PUT", {
            StackFileContent: stackFile(2),
            Env: environment,
            PullImage: false,
            Prune: false,
          }),
        );
        assert.equal(updated.Id, stackId);
        appId = await waitApp(previous);
        const port = success(
          await docker(["port", appId, "3000/tcp"]),
          "读取重新部署后的本机应用端口",
        );
        assert.match(port, /^127\.0\.0\.1:\d+$/);
        appOrigin = `http://${port}`;
        assert.equal(
          (await fetch(`${appOrigin}/login`, { signal: AbortSignal.timeout(10_000) })).status,
          200,
        );
        assert.equal(await startupBackups(), backupCount + 1);
        success(
          await docker([
            "exec",
            appId,
            "node",
            "--conditions=react-server",
            "--import",
            "tsx",
            "scripts/sqlite-database.ts",
            "verify",
          ]),
          "重新部署后的 SQLite 通过完整结构校验",
        );
      });

      await t.test("仅删除本次创建的 Stack，外部数据卷仍保留数据库和两份启动备份", async () => {
        await request(`/stacks/${stackId}?endpointId=${endpointId}&removeVolumes=false`, "DELETE");
        stackId = 0;
        assert.deepEqual(await ownAppIds(), []);
        assert.deepEqual(await request("/stacks"), []);
        assert.equal(await startupBackups(), 2);
        success(
          await docker([
            "run",
            "--rm",
            "--pull",
            "never",
            "--network",
            "none",
            "--mount",
            `type=volume,source=${appVolume},target=/app/data`,
            image,
            "npm",
            "run",
            "db:verify",
          ]),
          "删除 Stack 后独立 SQLite 文件保持可用",
        );
      });
    } finally {
      if (stackId && token && endpointId) {
        try {
          await request(
            `/stacks/${stackId}?endpointId=${endpointId}&removeVolumes=false`,
            "DELETE",
          );
        } catch {
          /* 失败后只清理精确匹配本次随机 Stack 标签的容器。 */
        }
      }
      const ownContainers = await ownAppIds();
      for (const id of ownContainers)
        success(await docker(["rm", "--force", id]), "清理本次 Stack 容器");
      if (endpointId && token) {
        try {
          await request(`/endpoints/${endpointId}`, "DELETE");
        } catch {
          /* 删除全新 manager 数据卷后仅本次 endpoint 元数据随之清理。 */
        }
      }
      if (managerCreated)
        success(await docker(["rm", "--force", portainerName]), "清理本次 Portainer 容器");
      if (createdNetwork) success(await docker(["network", "rm", network]), "清理本次外部网络");
      for (const name of createdVolumes)
        success(await docker(["volume", "rm", name]), "清理本次测试卷");
      t.diagnostic(
        `已清理本次 Portainer/Stack 容器、${createdVolumes.length} 个独立卷和 ${createdNetwork ? 1 : 0} 个独立网络。`,
      );
    }
  },
);
