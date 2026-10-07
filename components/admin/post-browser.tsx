"use client";
import { useState } from "react";

import type { OperationSettings } from "@/lib/operations/schema";

import { Button } from "@/components/ui/button";
import { postTime } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { operationRequest } from "./global-operations";
import { usePostQuery } from "./use-posts";

export function ScheduleToolbar() {
  const { operationRevision, postPending, onMessage, runOperation } = useAdminWorkspace();
  const settings = usePostQuery(
    "/operations/settings",
    operationRevision,
    operationRequest<OperationSettings>,
  );
  const [error, setError] = useState("");
  return (
    <div className="admin-schedule-toolbar">
      <p className="admin-muted">
        最近调度：
        {settings.error
          ? "读取失败"
          : settings.loading
            ? "正在加载…"
            : settings.data?.schedulerLastRunAt
              ? postTime(settings.data.schedulerLastRunAt)
              : "暂无执行记录，请配置服务器定时任务"}
        。取消排期后文章转为草稿。
      </p>
      {settings.error && (
        <Button size="compact" variant="ghost" onClick={settings.reload}>
          重新查询调度状态
        </Button>
      )}
      <Button
        size="compact"
        disabled={postPending}
        onClick={async () => {
          setError("");
          try {
            const result = await runOperation(
              () =>
                operationRequest<{ published: number; skipped: number }>(
                  "/operations/publish-due",
                  { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
                ),
              true,
            );
            onMessage(
              `已发布 ${result.published} 篇文章${result.skipped ? `，${result.skipped} 篇需检查正文与版本` : ""}`,
            );
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "执行结果未确认，请刷新列表核对。");
          }
        }}
      >
        {postPending ? "正在执行…" : "执行到期计划"}
      </Button>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
