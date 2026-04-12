"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function SettingsPanel() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className={`
      grid gap-5
      xl:grid-cols-2
    `}>
      <div className="space-y-4 rounded-[1.8rem] border border-white/8 bg-white/3 p-5">
        <div>
          <div className="mb-2 type-label">工作区</div>
          <h2 className="font-serif text-3xl tracking-[-0.05em]">发布默认设置</h2>
        </div>
        <Select
          defaultValue="public"
          options={[
            { label: "默认公开", value: "public" },
            { label: "先私有审核", value: "private" },
          ]}
        />
        <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3">
          <div>
            <div className="text-sm font-medium">自动保存草稿</div>
            <div className="text-xs text-muted">每隔几秒同步编辑器状态。</div>
          </div>
          <Switch checked={autoSave} onCheckedChange={setAutoSave} />
        </div>
        <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3 text-sm">
          <Checkbox defaultChecked />
          发布前需要编辑审核
        </label>
      </div>

      <div className="space-y-4 rounded-[1.8rem] border border-white/8 bg-white/3 p-5">
        <div>
          <div className="mb-2 type-label">通知</div>
          <h2 className="font-serif text-3xl tracking-[-0.05em]">团队与摘要偏好</h2>
        </div>
        <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3">
          <div>
            <div className="text-sm font-medium">每日邮件摘要</div>
            <div className="text-xs text-muted">评论、审批和流量的摘要。</div>
          </div>
          <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
        </div>
        <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3 text-sm">
          <Checkbox defaultChecked />
          评论审核积压时通知
        </label>
        <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3 text-sm">
          <Checkbox />
          周度分析异常时通知
        </label>
      </div>
    </div>
  );
}
