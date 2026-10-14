import { transform } from "esbuild";
import nft from "next/dist/compiled/@vercel/nft/index.js";
import { cp, mkdir, readFile, readdir, stat, symlink, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const output = resolve(process.argv[2] ?? join(projectRoot, ".next/standalone"));
const require = createRequire(import.meta.url);
const entries = [
  "scripts/startup-database.ts",
  "scripts/sqlite-database.ts",
  "scripts/admin.ts",
  "scripts/operations.ts",
  "scripts/restore-backup.ts",
  "scripts/media-cleanup.ts",
];

// 保持 CLI 原入口和 TypeScript 路径别名，仅把其实际依赖合并到 standalone。
// 转译只用于静态分析；最终仍由固定版本的 tsx 执行原始源码。
const trace = await nft.nodeFileTrace(
  entries.map((entry) => join(projectRoot, entry)),
  {
    base: projectRoot,
    processCwd: projectRoot,
    conditions: ["node", "react-server"],
    paths: { "@/": `${projectRoot}${sep}` },
    readFile: async (path) => {
      let source;
      try {
        source = await readFile(path, "utf8");
      } catch (error) {
        if (error.code === "ENOENT" || error.code === "EISDIR") return null;
        throw error;
      }
      if (!/\.(?:ts|tsx)$/.test(path) || path.endsWith(".d.ts")) return source;
      return (
        await transform(source, {
          loader: path.endsWith(".tsx") ? "tsx" : "ts",
          target: "node24",
          format: "esm",
        })
      ).code;
    },
  },
);

function optionalNativeWarning(message) {
  // 原生加载器会探测未安装的平台、源码开发包和 Debug 产物。
  // 这些分支允许缺失，实际平台的三项原生功能在最终 Docker 层强制运行检查。
  return (
    (message.startsWith("Failed to resolve dependency ") &&
      message.includes("node_modules/better-sqlite3/build/Debug/better_sqlite3.node")) ||
    (message.startsWith('Failed to resolve dependency "@img/sharp-') &&
      /loaded from .*node_modules\/sharp\//.test(message)) ||
    (message.startsWith("Failed to parse ") &&
      message.includes("node_modules/@img/sharp-libvips-") &&
      /\.(?:so|dylib|dll)(?:\.| as )/.test(message))
  );
}

for (const warning of trace.warnings) {
  if (!optionalNativeWarning(warning.message)) throw warning;
}

function allowedFile(path) {
  // 追踪结果不得携带本地库、密钥、离线 PostgreSQL 工具或历史生成物。
  if (
    path.split(sep).some((part) => part.startsWith(".env")) ||
    /^(?:data|generated)(?:\/|$)/.test(path) ||
    /^node_modules\/(?:pg\/|pg-[^/]+\/)/.test(path) ||
    path.startsWith("lib/database-transfer/") ||
    (path.startsWith("scripts/") && !entries.includes(path))
  )
    throw new Error(`运行镜像包含禁止打包的文件：${path}`);
  if (
    path.startsWith("node_modules/@types/") ||
    /\.(?:d\.ts|d\.mts|d\.cts|map)$/.test(path) ||
    /(?:^|\/)(?:tests?|__tests__)(?:\/|$)/.test(path)
  )
    return false;
  if (path.startsWith("node_modules/argon2/prebuilds/"))
    return path.startsWith(`node_modules/argon2/prebuilds/${process.platform}-${process.arch}/`);
  return (
    path.startsWith("node_modules/") ||
    path.startsWith("lib/") ||
    path.startsWith("scripts/") ||
    /^drizzle\/[^/]+\.sql$/.test(path) ||
    path === "drizzle/meta/_journal.json" ||
    path === "package.json" ||
    path === "tsconfig.json"
  );
}

await mkdir(output, { recursive: true });
for (const path of [...trace.fileList].toSorted((a, b) => a.localeCompare(b))) {
  if (!allowedFile(path)) continue;
  const destination = join(output, path);
  await mkdir(dirname(destination), { recursive: true });
  await cp(join(projectRoot, path), destination, { dereference: false });
}

async function copyRuntimePath(path) {
  await mkdir(dirname(join(output, path)), { recursive: true });
  await cp(join(projectRoot, path), join(output, path), {
    recursive: true,
    filter: (source) => allowedFile(relative(projectRoot, source)),
  });
}

// tsx 的 loader 和 esbuild 二进制由运行时选择，显式携带完整的小型包及当前平台。
for (const name of ["tsx", "esbuild", `@esbuild/${process.platform}-${process.arch}`]) {
  const packagePath = dirname(require.resolve(`${name}/package.json`));
  await copyRuntimePath(relative(projectRoot, packagePath));
}
await copyRuntimePath("tsconfig.json");
for (const entry of await readdir(join(projectRoot, "drizzle"))) {
  if (entry.endsWith(".sql")) await copyRuntimePath(join("drizzle", entry));
}
await copyRuntimePath("drizzle/meta/_journal.json");

// Docker 运行镜像只公开可执行的维护命令，不暴露依赖未打包的开发/历史脚本。
const manifest = JSON.parse(await readFile(join(projectRoot, "package.json"), "utf8"));
const supportedScripts = [
  "operations:run",
  "db:backup",
  "db:restore",
  "db:init",
  "db:migrate",
  "db:verify",
  "db:startup",
  "admin:init",
  "admin:reset-password",
  "media:cleanup",
];
await writeFile(
  join(output, "package.json"),
  `${JSON.stringify(
    {
      name: manifest.name,
      version: manifest.version,
      private: true,
      type: "module",
      scripts: Object.fromEntries(supportedScripts.map((name) => [name, manifest.scripts[name]])),
    },
    null,
    2,
  )}\n`,
);

// CLI 用 node --import tsx；npm 调用 tsx 的 db:* 命令依赖本地 bin 链接。
await mkdir(join(output, "node_modules/.bin"), { recursive: true });
const tsxBin = join(output, "node_modules/.bin/tsx");
await unlink(tsxBin).catch((error) => {
  if (error.code !== "ENOENT") throw error;
});
await symlink("../tsx/dist/cli.mjs", tsxBin);
for (const entry of entries) await stat(join(output, entry));
console.log(`单镜像运维依赖打包完成：追踪 ${trace.fileList.size} 个文件。`);
