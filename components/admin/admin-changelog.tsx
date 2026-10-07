"use client";

import { History, Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  releaseTypes,
  releaseSchema,
  type ReleaseType,
  type ReleaseList,
  type ReleaseLog,
} from "@/lib/changelog/schema";

import { useAdminWorkspace } from "./admin-context";
import { resourceRequest } from "./business-request";
import { BusinessStatus } from "./business-status";
import { RecordLocator, useRecordTarget } from "./record-locator";
import { AdminRequestError, usePostQuery, useDebouncedPostQuery } from "./use-posts";
import "./admin-business.css";
import "./admin-data-workspace.css";
import "./admin-changelog.css";

const request = resourceRequest("/api/admin/changelog");
const load = request<ReleaseList>;
const typeOptions: ReleaseType[] = ["feature", "fix", "performance", "security"];

export function AdminChangelog() {
  const record = useRecordTarget();
  const { onMessage } = useAdminWorkspace();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReleaseType>("feature");
  const [changes, setChanges] = useState("");
  const [errors, setErrors] = useState<{ version?: string; title?: string; changes?: string }>({});
  const publishButton = useRef<HTMLButtonElement>(null);
  const versionInput = useRef<HTMLInputElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const keyword = useDebouncedPostQuery(query);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const result = usePostQuery(
    `?${new URLSearchParams(record ? { record } : { q: keyword, page: String(page) })}`,
    revision,
    load,
  );
  const filtered = result.data?.items ?? [];
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [checked, setChecked] = useState<ReleaseList | null>(null);
  const submittedVersion = useRef("");
  const publish = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current || uncertain) return;
    const parsed = releaseSchema.safeParse({
      version,
      title,
      type,
      changes: changes
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      const fields = Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      );
      setErrors(fields);
      requestAnimationFrame(() =>
        document.getElementById(`release-${Object.keys(fields)[0]}`)?.focus(),
      );
      return;
    }
    busy.current = true;
    setPending(true);
    setError("");
    setErrors({});
    submittedVersion.current = parsed.data.version;
    try {
      await request<ReleaseLog>("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      setQuery("");
      setPage(1);
      setRevision((v) => v + 1);
      setOpen(false);
      onMessage("版本记录已保存；此操作不会部署软件。");
    } catch (e) {
      setError(e instanceof Error ? e.message : "无法确认发布结果。");
      if (e instanceof AdminRequestError && e.code === "INVALID_INPUT") {
        const fields = Object.fromEntries(
          Object.entries(e.fieldErrors).map(([key, values]) => [key.split(".")[0], values[0]]),
        );
        setErrors(fields);
        requestAnimationFrame(() =>
          document.getElementById(`release-${Object.keys(fields)[0]}`)?.focus(),
        );
      } else if (
        !(e instanceof AdminRequestError) ||
        ["INVALID_RESPONSE", "SERVICE_UNAVAILABLE", "REQUEST_FAILED"].includes(e.code)
      ) {
        setUncertain(true);
        setChecked(null);
      }
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  const checkOutcome = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      setChecked(await load(`?${new URLSearchParams({ q: submittedVersion.current })}`));
      setRevision((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "查询失败，请稍后再核对。");
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <div className="admin-changelog admin-data-page">
      <RecordLocator
        record={record}
        loading={result.loading}
        error={result.error}
        found={Boolean(filtered.length)}
      />
      <div className="admin-page-heading">
        <div>
          <h1>更新日志</h1>
          <p>记录版本变更。</p>
        </div>
        <Button
          ref={publishButton}
          variant="primary"
          size="compact"
          disabled={pending}
          onClick={() => {
            if (uncertain) {
              setOpen(true);
              return;
            }
            setError("");
            setVersion("");
            setTitle("");
            setType("feature");
            setChanges("");
            setErrors({});
            setOpen(true);
          }}
        >
          <Plus size={16} aria-hidden="true" />
          发布日志
        </Button>
      </div>

      <section className="admin-data-workspace" aria-label="版本更新记录">
        <div className="admin-data-toolbar admin-changelog-filters">
          <InputGroup size="compact" className="admin-release-search">
            <InputGroupInput
              ref={searchInput}
              aria-label="搜索更新日志"
              placeholder="搜索版本号、功能词或特性..."
              value={query}
              maxLength={200}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            <InputGroupAddon>
              <Search size={16} aria-hidden="true" />
            </InputGroupAddon>
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="compact"
                  aria-label="清空搜索"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                    searchInput.current?.focus();
                  }}
                >
                  <X size={15} aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <output>
            共 <strong>{result.data?.total ?? "—"}</strong> 条更新日志
          </output>
        </div>

        <BusinessStatus {...result} />
        {result.data &&
          (filtered.length ? (
            <div className="admin-release-content">
              <ol className="admin-release-timeline" aria-label="版本迭代时间线">
                {filtered.map((log) => (
                  <li
                    key={log.id}
                    data-record-id={log.id}
                    tabIndex={record === log.id ? -1 : undefined}
                    className={`admin-release-item is-${log.type} ${record === log.id ? "admin-record-highlight" : ""}`}
                  >
                    <div className="admin-release-heading">
                      <span className="admin-release-version">{log.version}</span>
                      <span className={`admin-release-tag is-${log.type}`}>
                        {releaseTypes[log.type]}
                      </span>
                      <h2>{log.title}</h2>
                    </div>
                    {!log.changes.length && <p className="admin-muted">未填写更新详情</p>}
                    <ul className="admin-release-changes">
                      {log.changes.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                    <time dateTime={log.createdAt}>
                      {new Date(log.createdAt).toLocaleDateString("sv-SE", {
                        timeZone: "Asia/Shanghai",
                      })}
                    </time>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="admin-post-empty">
              <History size={28} aria-hidden="true" />
              <h2>{keyword ? "没有匹配的版本记录" : "尚无版本记录"}</h2>
              <p>{keyword ? "试试其他版本号或更新关键词。" : "发布第一条更新日志。"}</p>
              {keyword && (
                <Button
                  size="compact"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                    searchInput.current?.focus();
                  }}
                >
                  清空搜索
                </Button>
              )}
            </div>
          ))}
        {result.data && (
          <div className="admin-post-pagination">
            <output aria-live="polite">
              显示第 {result.data.total ? (result.data.page - 1) * result.data.pageSize + 1 : 0}–
              {Math.min(result.data.page * result.data.pageSize, result.data.total)} 条，共{" "}
              {result.data.total} 条
            </output>
            <nav aria-label="更新日志分页">
              <Button
                size="compact"
                variant="ghost"
                aria-label="上一页日志"
                disabled={result.data.page === 1}
                onClick={() => setPage(result.data!.page - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <span
                aria-current="page"
                aria-label={`第 ${result.data.page} 页，共 ${result.data.pageCount} 页`}
              >
                {result.data.page} / {result.data.pageCount}
              </span>
              <Button
                size="compact"
                variant="ghost"
                aria-label="下一页日志"
                disabled={result.data.page === result.data.pageCount}
                onClick={() => setPage(result.data!.page + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </nav>
          </div>
        )}
      </section>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!pending) setOpen(v);
        }}
      >
        <DialogContent
          className="admin-release-modal"
          initialFocus={versionInput}
          finalFocus={publishButton}
        >
          <div className="admin-modal-heading">
            <div>
              <DialogTitle>发布版本更新日志</DialogTitle>
              <DialogDescription>填写版本号、主题和更新内容。</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              aria-label="关闭发布弹窗"
              onClick={() => setOpen(false)}
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </div>
          {error && (
            <div role="alert" className="admin-business-feedback">
              <p className="admin-business-error">{error}</p>
            </div>
          )}
          {uncertain && (
            <section aria-label="核对发布结果">
              <p>发布结果未确认，请先查询记录，避免重复发布。</p>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => void checkOutcome()}
              >
                查询并核对发布结果
              </Button>
              {checked && (
                <>
                  <p>匹配记录共 {checked.total} 条；以下为最新8条：</p>
                  <ul>
                    {checked.items.map((item) => (
                      <li key={item.id}>
                        {item.version} · {item.title} ·{" "}
                        {new Date(item.createdAt).toLocaleString("zh-CN", {
                          timeZone: "Asia/Shanghai",
                        })}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => {
                      setUncertain(false);
                      setChecked(null);
                      setError("");
                    }}
                  >
                    确认尚未发布，重新提交
                  </Button>
                </>
              )}
            </section>
          )}
          <form className="admin-form" noValidate onSubmit={publish}>
            <fieldset
              disabled={pending || uncertain}
              className="admin-business-fieldset admin-form"
            >
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
                    maxLength={80}
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
                    disabled={pending || uncertain}
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
                  maxLength={200}
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
                更新条目清单（每行一条，最多20条、每条200字符）
                <Textarea
                  id="release-changes"
                  rows={5}
                  placeholder={"新增某个核心模块...\n优化某些交互细节...\n修复某些显示缺陷..."}
                  maxLength={4020}
                  aria-invalid={!!errors.changes}
                  aria-describedby={errors.changes ? "release-changes-error" : undefined}
                  value={changes}
                  onChange={(event) => setChanges(event.target.value)}
                />
                {errors.changes && (
                  <span id="release-changes-error" className="admin-release-error" role="alert">
                    {errors.changes}
                  </span>
                )}
              </label>
              <div className="admin-form-actions">
                <Button type="button" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button type="submit" variant="primary" disabled={pending || uncertain}>
                  {pending ? "正在发布…" : "确认发布"}
                </Button>
              </div>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
