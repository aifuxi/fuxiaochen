"use client";
import type { ColumnDef } from "@tanstack/react-table";

import { Check, Link2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { ConfiguredImage } from "@/components/frontend/configured-image";
import { Button } from "@/components/ui/button";
import { DataTable, getDataTableSort, useDataTableState } from "@/components/ui/data-table";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  friendCategories,
  friendStatuses,
  friendStatusLabels,
  createFriendSchema,
  updateFriendSchema,
  type FriendInput,
  type FriendLink,
  type FriendList,
} from "@/lib/friends-links/schema";

import { useAdminWorkspace } from "./admin-context";
import { AdminRowActionsCell } from "./admin-table";
import { resourceRequest } from "./business-request";
import { BusinessStatus } from "./business-status";
import { AdminRequestError, usePostQuery, useDebouncedPostQuery } from "./use-posts";
import "./admin-data-workspace.css";
import "./admin-friends-links.css";
import "./admin-business.css";
const request = resourceRequest("/api/admin/friends-links");
const load = request<FriendList>;
const emptyDraft: FriendInput = {
  name: "",
  url: "",
  avatar: "",
  description: "",
  category: "技术博客",
  status: "pending",
  enabled: true,
};
function FriendSelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  compact = false,
}: {
  id?: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Select
      items={options}
      value={value}
      disabled={disabled}
      onValueChange={(v) => {
        if (v) onChange(v);
      }}
    >
      <SelectTrigger id={id} size={compact ? "compact" : "default"} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
const categories = friendCategories.map((value) => ({ value, label: value }));
const statuses = friendStatuses.map((value) => ({ value, label: friendStatusLabels[value] }));
const actionIcons = {
  Check: <Check size={16} />,
  Pencil: <Pencil size={16} />,
  Trash2: <Trash2 size={16} />,
};

const columns: ColumnDef<FriendLink>[] = [
  {
    id: "name",
    header: "博客名称 / 地址",
    accessorKey: "name",
    enableSorting: true,
    cell: ({ row }) => {
      const link = row.original;
      return (
        <>
          <div className="admin-friend-identity">
            <span className="admin-friend-avatar">
              <ConfiguredImage src={link.avatar} size={36} />
            </span>
            <div>
              <strong>{link.name}</strong>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.url}
              </a>
            </div>
          </div>
        </>
      );
    },
  },
  {
    id: "description",
    header: "站点描述",
    enableSorting: false,
    cell: ({ row }) => {
      const link = row.original;
      return (
        <>
          <p className="admin-friend-description">{link.description || "未填写简介"}</p>
        </>
      );
    },
  },
  {
    id: "category",
    header: "分类",
    accessorKey: "category",
    enableSorting: true,
    cell: ({ row }) => {
      const link = row.original;
      return (
        <>
          <span className="admin-post-category">{link.category}</span>
        </>
      );
    },
  },
  {
    id: "status",
    header: "审核 / 展示",
    accessorKey: "status",
    enableSorting: true,
    cell: ({ row }) => {
      const link = row.original;
      return (
        <>
          <span
            className={`admin-post-status ${link.status === "approved" ? "is-published" : link.status === "rejected" ? "is-rejected" : ""}`}
          >
            {friendStatusLabels[link.status]}
          </span>
          <p className="admin-muted">{link.enabled ? "展示启用" : "展示停用"}</p>
        </>
      );
    },
  },
  { id: "actions", header: "操作", cell: AdminRowActionsCell },
];

export function AdminFriendsLinks() {
  const { onMessage } = useAdminWorkspace();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [enabled, setEnabled] = useState("all");
  const [q, setQ] = useState("");
  const tableState = useDataTableState();
  const { page, setPage, sorting, pagination } = tableState;
  const [revision, setRevision] = useState(0);
  const keyword = useDebouncedPostQuery(q);
  const params = new URLSearchParams({
    q: keyword,
    page: String(page),
    pageSize: String(pagination.pageSize),
  });
  for (const [key, value] of Object.entries({
    category,
    status,
    enabled,
    ...getDataTableSort(sorting, ["name", "category", "status"] as const),
  }))
    if (value !== undefined && value !== "all") params.set(key, value);
  const query = usePostQuery(`?${params}`, revision, load);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FriendLink | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [deleting, setDeleting] = useState<FriendLink | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const trigger = useRef<HTMLElement | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const add = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const cancelDelete = useRef<HTMLButtonElement>(null);
  const deleted = useRef(false);
  const reset = () => {
    setCategory("all");
    setStatus("all");
    setEnabled("all");
    setQ("");
    setPage(1);
  };
  const returnFocus = () =>
    deleted.current ? search.current : trigger.current?.isConnected ? trigger.current : add.current;
  function open(element: HTMLElement, link?: FriendLink) {
    if (busy.current) return;
    trigger.current = element;
    deleted.current = false;
    setEditing(link ?? null);
    setDraft(
      link
        ? {
            name: link.name,
            url: link.url,
            avatar: link.avatar,
            description: link.description,
            category: link.category,
            status: link.status,
            enabled: link.enabled,
          }
        : { ...emptyDraft },
    );
    setErrors({});
    setError("");
    setConflict(false);
    setFormOpen(true);
  }
  async function mutate(work: () => Promise<unknown>, success: () => void) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    setConflict(false);
    try {
      await work();
      success();
      setRevision((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败，请重新加载列表核对。");
      if (e instanceof AdminRequestError) {
        setConflict(e.code === "VERSION_CONFLICT");
        const fields = Object.fromEntries(
          Object.entries(e.fieldErrors).map(([key, messages]) => [key, messages[0]]),
        );
        setErrors(fields);
        requestAnimationFrame(() =>
          document.getElementById(`friend-${Object.keys(fields)[0]}`)?.focus(),
        );
      }
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (busy.current || conflict) return;
    const { status: _status, ...newFields } = draft;
    const parsed = editing
      ? updateFriendSchema.safeParse({ ...draft, version: editing.version })
      : createFriendSchema.safeParse(newFields);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      );
      setErrors(fields);
      requestAnimationFrame(() =>
        document.getElementById(`friend-${Object.keys(fields)[0]}`)?.focus(),
      );
      return;
    }
    void mutate(
      () =>
        request(editing ? `/${editing.id}` : "", {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }),
      () => {
        if (!editing) reset();
        setFormOpen(false);
        onMessage(`友链已${editing ? "更新" : "添加"}。`);
      },
    );
  }
  async function reloadDetail() {
    const target = deleting ?? editing;
    if (!target || busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      const latest = await request<FriendLink>(`/${target.id}`);
      if (deleting) setDeleting(latest);
      else {
        setEditing(latest);
        setDraft({
          name: latest.name,
          url: latest.url,
          avatar: latest.avatar,
          description: latest.description,
          category: latest.category,
          status: latest.status,
          enabled: latest.enabled,
        });
      }
      setError("");
      setErrors({});
      setConflict(false);
      setRevision((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "载入失败，草稿已保留。");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  const data = query.data;
  const currentPage = data?.page ?? page;
  const errorBlock = error && (
    <div className="admin-business-feedback" role="alert">
      <p className="admin-business-error">{error}</p>
      {conflict && (editing || deleting) && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => void reloadDetail()}
        >
          {deleting ? "重新载入后再次确认删除" : "放弃草稿并重新载入"}
        </Button>
      )}
      {error.includes("登录") && (
        <Button type="button" size="sm" onClick={() => window.location.assign("/login")}>
          重新登录
        </Button>
      )}
    </div>
  );
  return (
    <div className="admin-posts admin-data-page admin-friends-links">
      <div className="admin-page-heading">
        <div>
          <h1>友情链接管理</h1>
          <p>管理站点资料、审核与展示状态。</p>
        </div>
        <Button
          ref={add}
          size="compact"
          variant="primary"
          disabled={pending}
          onClick={(e) => open(e.currentTarget)}
        >
          <Plus size={16} />
          新增友链
        </Button>
      </div>
      {!formOpen && !deleting && errorBlock}
      <div className="admin-data-workspace">
        <div className="admin-post-filters">
          <div className="admin-friend-filter-selects">
            <FriendSelect
              label="筛选友链分类"
              value={category}
              options={[{ value: "all", label: "全部分类" }, ...categories]}
              onChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
              compact
            />
            <FriendSelect
              label="筛选审核状态"
              value={status}
              options={[{ value: "all", label: "全部审核状态" }, ...statuses]}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              compact
            />
            <FriendSelect
              label="筛选展示状态"
              value={enabled}
              options={[
                { value: "all", label: "全部展示状态" },
                { value: "true", label: "展示启用" },
                { value: "false", label: "展示停用" },
              ]}
              onChange={(v) => {
                setEnabled(v);
                setPage(1);
              }}
              compact
            />
          </div>
          <InputGroup size="compact" className="admin-friend-search">
            <InputGroupInput
              ref={search}
              aria-label="搜索友链"
              placeholder="搜索友链名称、地址或描述…"
              maxLength={200}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
            <InputGroupAddon>
              <Search size={16} />
            </InputGroupAddon>
            {q && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="compact"
                  aria-label="清空友链搜索"
                  onClick={() => {
                    setQ("");
                    setPage(1);
                    search.current?.focus();
                  }}
                >
                  <X size={16} />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Button size="compact" variant="secondary" onClick={query.reload}>
            刷新列表
          </Button>
        </div>
        <BusinessStatus {...query} />
        {data && (
          <div className="admin-post-list">
            <DataTable
              meta={{
                getRowActions: (link) => ({
                  label: `友链 ${link.name} 的操作`,
                  disabled: pending || query.loading || Boolean(query.error),
                  actions: [
                    ...(link.status === "pending"
                      ? [
                          {
                            label: "通过审核",
                            icon: actionIcons.Check,
                            onSelect: () => {
                              const {
                                id: _id,
                                createdAt: _created,
                                updatedAt: _updated,
                                ...fields
                              } = link;
                              void mutate(
                                () =>
                                  request(`/${link.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ ...fields, status: "approved" }),
                                  }),
                                () => onMessage("友链已通过审核。"),
                              );
                            },
                          },
                        ]
                      : []),
                    {
                      label: "编辑友链",
                      icon: actionIcons.Pencil,
                      separator: link.status === "pending",
                      opensDialog: true,
                      onSelect: (element) => element && open(element, link),
                    },
                    {
                      label: "删除友链",
                      icon: actionIcons.Trash2,
                      destructive: true,
                      separator: true,
                      opensDialog: true,
                      onSelect: (element) => {
                        trigger.current = element;
                        deleted.current = false;
                        setDeleting(link);
                        setError("");
                        setConflict(false);
                      },
                    },
                  ],
                }),
              }}
              {...tableState}
              data={data.items}
              columns={columns}
              getRowId={(link) => link.id}
              mode="server"
              rowCount={data.total}
              loading={query.loading}
              disabled={Boolean(query.error)}
              caption={`友情链接列表，共 ${data.total} 条，第 ${currentPage} 页`}
              tableClassName="admin-post-table admin-friend-table"
              emptyState={
                <div className="admin-post-empty">
                  <Link2 size={28} />
                  <h2>暂无对应友链数据</h2>
                  <p>调整筛选条件，或添加第一条友情链接。</p>
                  <div className="admin-form-actions">
                    <Button size="compact" variant="secondary" onClick={reset}>
                      重置筛选
                    </Button>
                    <Button
                      size="compact"
                      disabled={pending}
                      onClick={(e) => open(e.currentTarget)}
                    >
                      新增友链
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        )}
      </div>
      <p className="admin-post-session-note">前台仅展示审核通过且已启用的友链。</p>
      <Dialog
        open={formOpen}
        onOpenChange={(v) => {
          if (!pending) setFormOpen(v);
        }}
      >
        <DialogContent
          className="admin-modal admin-friend-modal"
          initialFocus={nameInput}
          finalFocus={returnFocus}
        >
          <div className="admin-modal-heading">
            <div>
              <DialogTitle>{editing ? "编辑友情链接" : "添加友情链接"}</DialogTitle>
              <DialogDescription>新建友链进入待审核，审核通过后才具备展示资格。</DialogDescription>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              aria-label="关闭友链表单"
              onClick={() => setFormOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>
          {errorBlock}
          <form className="admin-form" ref={form} onSubmit={save} noValidate>
            <fieldset disabled={pending} className="admin-business-fieldset admin-form">
              {(
                [
                  ["name", "网站名称（必填）", 100],
                  ["url", "网站链接（必填）", 2048],
                  ["avatar", "站点图标（可选）", 2048],
                ] as const
              ).map(([key, label, max]) => (
                <label htmlFor={`friend-${key}`} key={key}>
                  {label}
                  <Input
                    id={`friend-${key}`}
                    ref={key === "name" ? nameInput : undefined}
                    value={draft[key]}
                    maxLength={max}
                    onChange={(e) => setDraft((v) => ({ ...v, [key]: e.target.value }))}
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `friend-${key}-error` : undefined}
                  />
                  {errors[key] && (
                    <span id={`friend-${key}-error`} className="admin-friend-error" role="alert">
                      {errors[key]}
                    </span>
                  )}
                </label>
              ))}
              <label htmlFor="friend-description">
                站点简介
                <Textarea
                  id="friend-description"
                  className="admin-friend-textarea"
                  value={draft.description}
                  maxLength={500}
                  onChange={(e) => setDraft((v) => ({ ...v, description: e.target.value }))}
                />
              </label>
              <div className="admin-friend-form-selects">
                <div>
                  <label htmlFor="friend-category">所属分类</label>
                  <FriendSelect
                    id="friend-category"
                    label="所属分类"
                    value={draft.category}
                    options={categories}
                    disabled={pending}
                    onChange={(v) => setDraft((d) => ({ ...d, category: friendSchemaCategory(v) }))}
                  />
                </div>
                <div>
                  <label htmlFor="friend-status">审核状态</label>
                  <FriendSelect
                    id="friend-status"
                    label="审核状态"
                    value={draft.status}
                    options={statuses}
                    disabled={pending || !editing}
                    onChange={(v) => setDraft((d) => ({ ...d, status: friendSchemaStatus(v) }))}
                  />
                </div>
              </div>
              <div className="admin-business-actions">
                <span id="friend-enabled-label">启用展示</span>
                <Switch
                  disabled={pending}
                  touchTarget
                  checked={draft.enabled}
                  onCheckedChange={(v) => setDraft((d) => ({ ...d, enabled: v }))}
                  aria-labelledby="friend-enabled-label"
                />
              </div>
              <div className="admin-form-actions">
                <Button
                  type="button"
                  disabled={pending}
                  variant="secondary"
                  onClick={() => setFormOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" variant="primary" disabled={pending || conflict}>
                  {pending ? "正在保存…" : "保存"}
                </Button>
              </div>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleting}
        onOpenChange={(v) => {
          if (!pending && !v) setDeleting(null);
        }}
      >
        <DialogContent
          className="admin-modal admin-friend-modal"
          initialFocus={cancelDelete}
          finalFocus={returnFocus}
        >
          <DialogTitle>删除友情链接</DialogTitle>
          <DialogDescription>
            永久删除「{deleting?.name}」的友链记录，此操作无法撤销。
          </DialogDescription>
          {errorBlock}
          <div className="admin-form-actions">
            <Button
              ref={cancelDelete}
              disabled={pending}
              variant="secondary"
              onClick={() => setDeleting(null)}
            >
              取消
            </Button>
            <Button
              disabled={pending || conflict || !deleting}
              onClick={() => {
                if (!deleting) return;
                void mutate(
                  () =>
                    request(`/${deleting.id}?version=${deleting.version}`, { method: "DELETE" }),
                  () => {
                    deleted.current = true;
                    setDeleting(null);
                    onMessage("友链已删除。");
                  },
                );
              }}
            >
              {pending ? "正在删除…" : "确认删除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function friendSchemaCategory(value: string) {
  return friendCategories.find((v) => v === value) ?? "技术博客";
}
function friendSchemaStatus(value: string) {
  return friendStatuses.find((v) => v === value) ?? "pending";
}
