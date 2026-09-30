"use client";

import { History, Plus, Search, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useAdminWorkspace } from "./admin-context";
import { releaseTypes, type ReleaseType } from "./changelog-mock-data";
import "./admin-changelog.css";

const typeOptions: ReleaseType[] = ["feature", "fix", "performance", "security"];

export function AdminChangelog() {
  const { releaseLogs, setReleaseLogs, onMessage } = useAdminWorkspace();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReleaseType>("feature");
  const [changes, setChanges] = useState("");
  const [errors, setErrors] = useState<{ version?: string; title?: string }>({});
  const publishButton = useRef<HTMLButtonElement>(null);
  const versionInput = useRef<HTMLInputElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const keyword = query.trim().toLowerCase();
  const filtered = releaseLogs.filter((log) =>
    [log.version, log.title, ...log.changes].some((text) => text.toLowerCase().includes(keyword)),
  );

  const publish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = {
      version: version.trim() ? undefined : "请输入版本号",
      title: title.trim() ? undefined : "请输入版本更新主题",
    };
    setErrors(nextErrors);
    if (nextErrors.version || nextErrors.title) {
      (nextErrors.version ? versionInput : titleInput).current?.focus();
      return;
    }
    const items = changes
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    setReleaseLogs((current) => [
      {
        id: crypto.randomUUID(),
        version: version.trim(),
        title: title.trim(),
        type,
        date: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" }),
        changes: items.length ? items : ["常规细节优化与稳定性提升"],
      },
      ...current,
    ]);
    setQuery("");
    setOpen(false);
    onMessage("版本记录已发布（模拟，仅当前会话；未部署软件）");
  };

  return (
    <div className="admin-dashboard admin-changelog">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CHANGELOG / 更新日志</p>
          <h1>系统版本迭代日志</h1>
          <p>记录每一次演进脉络，回溯功能迭代与架构优化。演示数据，刷新后恢复。</p>
        </div>
        <Button
          ref={publishButton}
          variant="primary"
          onClick={() => {
            setVersion("");
            setTitle("");
            setType("feature");
            setChanges("");
            setErrors({});
            setOpen(true);
          }}
        >
          <Plus size={16} aria-hidden="true" />
          发布新版本
        </Button>
      </div>

      <Card className="admin-changelog-filters">
        <div className="admin-release-search">
          <Search size={16} aria-hidden="true" />
          <Input
            ref={searchInput}
            aria-label="搜索更新日志"
            placeholder="搜索版本号、功能词或特性..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="清空搜索"
              onClick={() => {
                setQuery("");
                searchInput.current?.focus();
              }}
            >
              <X size={15} aria-hidden="true" />
            </Button>
          )}
        </div>
        <output>
          已记录 <strong>{filtered.length}</strong> 个迭代里程碑
        </output>
      </Card>

      <Card className="admin-release-card">
        {filtered.length ? (
          <ol className="admin-release-timeline" aria-label="版本迭代时间线">
            {filtered.map((log) => (
              <li key={log.id} className={`admin-release-item is-${log.type}`}>
                <div className="admin-release-heading">
                  <span className="admin-release-version">{log.version}</span>
                  <span className={`admin-release-tag is-${log.type}`}>
                    {releaseTypes[log.type]}
                  </span>
                  <h2>{log.title}</h2>
                </div>
                <ul className="admin-release-changes">
                  {log.changes.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
                <time dateTime={log.date}>{log.date}</time>
              </li>
            ))}
          </ol>
        ) : (
          <div className="admin-post-empty">
            <History size={28} aria-hidden="true" />
            <h2>没有匹配的版本记录</h2>
            <p>试试其他版本号或更新关键词。</p>
            <Button
              onClick={() => {
                setQuery("");
                searchInput.current?.focus();
              }}
            >
              清空搜索
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="admin-release-modal"
          initialFocus={versionInput}
          finalFocus={publishButton}
        >
          <div className="admin-modal-heading">
            <div>
              <DialogTitle>发布版本更新日志</DialogTitle>
              <DialogDescription>
                仅添加当前会话的模拟记录，不部署软件或修改服务器。
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="关闭发布弹窗"
              onClick={() => setOpen(false)}
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </div>
          <form className="admin-form" noValidate onSubmit={publish}>
            <div className="admin-release-fields">
              <label htmlFor="release-version">
                <span>
                  版本号 <span className="admin-release-required">*</span>
                </span>
                <Input
                  id="release-version"
                  ref={versionInput}
                  required
                  placeholder="v2.3.0"
                  value={version}
                  aria-invalid={!!errors.version}
                  aria-describedby={errors.version ? "release-version-error" : undefined}
                  onChange={(event) => {
                    setVersion(event.target.value);
                    setErrors((current) => ({ ...current, version: undefined }));
                  }}
                />
                {errors.version && (
                  <span id="release-version-error" className="admin-release-error">
                    {errors.version}
                  </span>
                )}
              </label>
              <div>
                <label id="release-type-label" htmlFor="release-type">
                  更新类型
                </label>
                <Select
                  value={type}
                  onValueChange={(value) => {
                    if (value) setType(value);
                  }}
                  items={Object.entries(releaseTypes).map(([value, label]) => ({ value, label }))}
                >
                  <SelectTrigger id="release-type" aria-labelledby="release-type-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((value) => (
                      <SelectItem key={value} value={value}>
                        {releaseTypes[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label htmlFor="release-title">
              <span>
                版本更新主题 <span className="admin-release-required">*</span>
              </span>
              <Input
                id="release-title"
                ref={titleInput}
                required
                placeholder="简要概括此次升级核心..."
                value={title}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "release-title-error" : undefined}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setErrors((current) => ({ ...current, title: undefined }));
                }}
              />
              {errors.title && (
                <span id="release-title-error" className="admin-release-error">
                  {errors.title}
                </span>
              )}
            </label>
            <label htmlFor="release-changes">
              更新条目清单（每行一条）
              <Textarea
                id="release-changes"
                rows={5}
                placeholder={"新增某个核心模块...\n优化某些交互细节...\n修复某些显示缺陷..."}
                value={changes}
                onChange={(event) => setChanges(event.target.value)}
              />
            </label>
            <div className="admin-form-actions">
              <Button type="button" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                确认发布
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
