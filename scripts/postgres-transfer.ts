import { closeSync, constants, fstatSync, fsyncSync, openSync, writeFileSync } from "node:fs";
import { lstat, realpath, rm } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";

import { exportPostgres } from "../lib/database-transfer/export";
import { TransferError } from "../lib/database-transfer/format";
import { importArchive } from "../lib/database-transfer/import";

const usage = `PostgreSQL → SQLite 离线迁移

导出：npm run db:export-postgres -- --directory <新目录> --report <新报告>
导入：npm run db:import-postgres -- --directory <归档目录> --target <独立SQLite文件> --dry-run|--apply|--verify --report <新报告>

导出必须显式设置 MIGRATION_SOURCE_DATABASE_URL；不加载 .env，也不使用 DATABASE_URL。
所有输出父目录须预先创建。apply 仅创建不存在的新目标，verify 只核对停止使用的文件。
归档包含敏感数据，报告只含数量、摘要和迁移策略；两者均拒绝覆盖已有文件。`;

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new TransferError(message);
}

function inside(path: string, directory: string): boolean {
  const child = relative(directory, path);
  return child === "" || (!isAbsolute(child) && child !== ".." && !child.startsWith(`..${sep}`));
}

async function outputPath(value: string): Promise<string> {
  const path = resolve(value);
  return join(await realpath(dirname(path)), basename(path));
}

async function exportWithReport(directoryValue: string, reportValue: string) {
  const directory = await outputPath(directoryValue);
  const reportPath = await outputPath(reportValue);
  ensure(!inside(reportPath, directory), "导出报告必须位于归档目录之外。");
  // 在连接源库前预留报告，避免成功导出后才发现报告会覆盖已有文件。
  const fd = openSync(
    reportPath,
    constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
    0o600,
  );
  const identity = fstatSync(fd);
  let closed = false;
  try {
    const manifest = await exportPostgres({ directory });
    writeFileSync(
      fd,
      `${JSON.stringify({ ...manifest, archiveFormat: manifest.format, format: "fuxiaochen-postgres-export-report", mode: "export", targetChecked: false }, null, 2)}\n`,
      "utf8",
    );
    fsyncSync(fd);
    closeSync(fd);
    closed = true;
    process.stdout.write(
      `PostgreSQL 导出完成：${manifest.tables.length} 张表；归档和报告已生成。\n`,
    );
  } catch (error) {
    if (!closed) {
      closeSync(fd);
      closed = true;
    }
    // 仅清理本次预留的报告；已完成的归档留作检查，未完成归档没有有效 manifest。
    const current = await lstat(reportPath).catch(() => null);
    if (current?.isFile() && current.dev === identity.dev && current.ino === identity.ino)
      await rm(reportPath);
    throw error;
  } finally {
    if (!closed) closeSync(fd);
  }
}

async function main() {
  const { values, tokens } = parseArgs({
    strict: true,
    allowPositionals: false,
    tokens: true,
    options: {
      export: { type: "boolean" },
      import: { type: "boolean" },
      directory: { type: "string" },
      target: { type: "string" },
      report: { type: "string" },
      "dry-run": { type: "boolean" },
      apply: { type: "boolean" },
      verify: { type: "boolean" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    process.stdout.write(`${usage}\n`);
    return;
  }
  const names = tokens.filter((token) => token.kind === "option").map((token) => token.name);
  ensure(new Set(names).size === names.length, "命令参数不得重复。");
  ensure(
    Boolean(values.export) !== Boolean(values.import),
    "必须选择唯一的 --export 或 --import。",
  );
  ensure(
    typeof values.directory === "string" &&
      values.directory.trim().length > 0 &&
      typeof values.report === "string" &&
      values.report.trim().length > 0,
    "必须提供 --directory 和 --report；报告使用新的文件路径。",
  );
  const modes = ["dry-run", "apply", "verify"] as const;
  const selected = modes.filter((mode) => values[mode]);
  if (values.export) {
    ensure(!values.target && selected.length === 0, "导出不接受目标数据库或导入模式。");
    await exportWithReport(values.directory, values.report);
  } else {
    ensure(
      typeof values.target === "string" && values.target.trim().length > 0 && selected.length === 1,
      "导入必须指定 --target 和唯一的 --dry-run、--apply 或 --verify。",
    );
    const report = await importArchive({
      directory: resolve(values.directory),
      targetPath: resolve(values.target),
      reportPath: resolve(values.report),
      mode: selected[0],
    });
    process.stdout.write(
      `${report.mode} 完成：${report.tables.length} 张表；${report.targetChecked ? "目标结构、关系和全部字段已核对" : "归档预检通过，尚未核对目标"}。\n`,
    );
  }
}

// 不输出原始驱动错误、堆栈、命令参数或环境内容，防止凭据和业务数据进入日志。
await main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof TransferError ? error.message : "迁移命令失败，请检查参数、独立路径、权限和显式源连接。"}\n`,
  );
  process.exitCode = 1;
});
