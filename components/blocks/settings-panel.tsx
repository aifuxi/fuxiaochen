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
          <div className="mb-2 type-label">Workspace</div>
          <h2 className="font-serif text-3xl tracking-[-0.05em]">Publishing defaults</h2>
        </div>
        <Select
          defaultValue="public"
          options={[
            { label: "Public by default", value: "public" },
            { label: "Private review first", value: "private" },
          ]}
        />
        <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3">
          <div>
            <div className="text-sm font-medium">Autosave drafts</div>
            <div className="text-xs text-muted">Keep editor state synced every few seconds.</div>
          </div>
          <Switch checked={autoSave} onCheckedChange={setAutoSave} />
        </div>
        <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3 text-sm">
          <Checkbox defaultChecked />
          Require editorial review before publishing
        </label>
      </div>

      <div className="space-y-4 rounded-[1.8rem] border border-white/8 bg-white/3 p-5">
        <div>
          <div className="mb-2 type-label">Notifications</div>
          <h2 className="font-serif text-3xl tracking-[-0.05em]">Team and digest preferences</h2>
        </div>
        <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3">
          <div>
            <div className="text-sm font-medium">Daily email digest</div>
            <div className="text-xs text-muted">Summaries for comments, approvals, and traffic.</div>
          </div>
          <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
        </div>
        <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3 text-sm">
          <Checkbox defaultChecked />
          Notify on comment moderation backlog
        </label>
        <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3 text-sm">
          <Checkbox />
          Notify on weekly analytics anomalies
        </label>
      </div>
    </div>
  );
}
