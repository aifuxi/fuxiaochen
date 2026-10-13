import { parseArgs } from "node:util";

import { DatabaseStartupError, prepareDatabase } from "../lib/database/startup";

try {
  // 启动仅读取显式容器环境；不加载项目 .env，也不沿用 PostgreSQL 配置。
  const { values, positionals } = parseArgs({
    options: { "initialize-if-missing": { type: "boolean", default: false } },
    allowPositionals: false,
    strict: true,
  });
  if (positionals.length) throw new DatabaseStartupError("启动数据库参数不受支持。");
  const result = await prepareDatabase({ initializeIfMissing: values["initialize-if-missing"] });
  console.log(
    result.initialized
      ? "SQLite 首次初始化、迁移和完整校验完成。"
      : `SQLite 启动备份 ${result.backupId} 完成，迁移和完整校验通过。`,
  );
} catch (error) {
  // 驱动异常可能包含路径或记录值；启动失败绝不继续启动 Web。
  console.error(
    error instanceof DatabaseStartupError
      ? error.message
      : "SQLite 启动准备失败，请核对独立文件、备份空间、权限和镜像迁移版本。",
  );
  process.exitCode = 1;
}
