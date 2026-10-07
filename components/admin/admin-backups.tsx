"use client";

import { BackupPanel } from "./global-operations";

export function AdminBackups() {
  return (
    <div className="admin-backups admin-data-page">
      <div className="admin-page-heading">
        <div>
          <h1>备份管理</h1>
          <p>查看数据库备份记录、执行备份与配置自动备份。</p>
        </div>
      </div>
      <div className="admin-data-workspace">
        <BackupPanel />
      </div>
    </div>
  );
}
