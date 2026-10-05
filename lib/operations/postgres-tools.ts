import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { requiredDatabaseUrl } from "../database-url";

const execute = promisify(execFile);

// 凭据只进入子进程环境，不进入命令参数、日志或客户端错误。
export function postgresEnvironment(connection: string) {
  const url = new URL(requiredDatabaseUrl(connection));
  const env = {
    ...process.env,
    PGHOST: url.hostname.replace(/^\[|\]$/g, ""),
    PGPORT: url.port || "5432",
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
    PGCONNECT_TIMEOUT: "10",
  };
  const parameters = {
    sslmode: "PGSSLMODE",
    sslrootcert: "PGSSLROOTCERT",
    sslcert: "PGSSLCERT",
    sslkey: "PGSSLKEY",
    options: "PGOPTIONS",
    channel_binding: "PGCHANNELBINDING",
  };
  for (const [parameter, variable] of Object.entries(parameters)) {
    const value = url.searchParams.get(parameter);
    if (value !== null) Object.assign(env, { [variable]: value });
  }
  return env;
}

export async function runPostgresTool(
  tool: "pg_dump" | "pg_restore" | "psql",
  args: string[],
  connection?: string,
) {
  try {
    const result = await execute(tool, args, {
      env: connection ? postgresEnvironment(connection) : process.env,
      timeout: 10 * 60_000,
      maxBuffer: 8 * 1024 * 1024,
    });
    return result.stdout;
  } catch {
    throw new Error(`PostgreSQL 工具 ${tool} 执行失败，请检查客户端版本、连接与文件权限。`);
  }
}
