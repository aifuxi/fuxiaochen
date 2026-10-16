"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  ChevronLeft,
  ChevronRight,
  Code2,
  Eye,
  FileUp,
  Focus,
  Heading2,
  Link2,
  List,
  Pencil,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColorInput } from "@/components/ui/color-input";
import { DataTable, useDataTableState } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RowActions } from "@/components/ui/menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import "./admin-preview-sections.css";

type NotifyProps = { notify: (message: string) => void };
type DraftPreviewProps = { onDirtyChange?: (dirty: boolean) => void; discardVersion?: number };
type Category = { id: string; name: string; color: string; postCount: number };
type Release = {
  id: string;
  version: string;
  title: string;
  type: string;
  changes: string[];
  published: boolean;
  date: string;
};

function PreviewSelect({
  id,
  value,
  onChange,
  options,
  compact = false,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  compact?: boolean;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <SelectTrigger id={id} size={compact ? "compact" : "default"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DialogActions({ children }: { children: ReactNode }) {
  return <div className="ap-dialog-actions">{children}</div>;
}

export function CategoriesPreview({ notify }: NotifyProps) {
  const [categories, setCategories] = useState<Category[]>([
    { id: "c1", name: "前端开发", color: "#0064fa", postCount: 12 },
    { id: "c2", name: "设计与体验", color: "#30953b", postCount: 7 },
    { id: "c3", name: "生活记录", color: "#d26700", postCount: 4 },
    { id: "c4", name: "阅读笔记", color: "#71168a", postCount: 0 },
  ]);
  const [tags, setTags] = useState([
    "React",
    "TypeScript",
    "Next.js",
    "设计系统",
    "阅读",
    "随笔",
    "CSS",
    "工具",
  ]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0064fa");
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");
  const [tagError, setTagError] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);
  const categoryInput = useRef<HTMLInputElement>(null);
  const tagInput = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const deleted = useRef(false);
  const state = useDataTableState();
  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: "分类名称",
        enableSorting: true,
        meta: { rowHeader: true },
        // oxlint-disable-next-line react/no-unstable-nested-components -- 列定义由 useMemo 固定，避免行操作在弹窗切换时重建。
        cell: ({ row }) => (
          <span className="ap-category-name">
            <span
              className="ap-category-swatch"
              style={{ background: row.original.color }}
              aria-hidden="true"
            />
            {row.original.name}
          </span>
        ),
      },
      { accessorKey: "postCount", header: "关联博文", enableSorting: true, meta: { width: "24%" } },
      {
        id: "actions",
        header: "操作",
        meta: { width: "15%" },
        // oxlint-disable-next-line react/no-unstable-nested-components -- 列定义由 useMemo 固定，避免行操作在弹窗切换时重建。
        cell: ({ row }) => (
          <RowActions
            label={`管理分类 ${row.original.name}`}
            actions={[
              {
                label: "编辑分类",
                icon: <Pencil size={16} />,
                opensDialog: true,
                onSelect: (button) => {
                  trigger.current = button;
                  setEditing(row.original);
                  setEditName(row.original.name);
                  setEditColor(row.original.color);
                  setError("");
                },
              },
              {
                label: "删除分类",
                icon: <Trash2 size={16} />,
                destructive: true,
                opensDialog: true,
                separator: true,
                onSelect: (button) => {
                  trigger.current = button;
                  deleted.current = false;
                  setDeleting(row.original);
                },
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  return (
    <div className="admin-data-page">
      <div className="ap-page-heading">
        <div>
          <h1>分类与标签</h1>
          <p>整理文章的主题，让内容更容易被发现。</p>
        </div>
      </div>
      <div className="ap-taxonomy-grid">
        <Card className="ap-taxonomy-card">
          <div className="ap-module-heading">
            <h2>分类</h2>
            <span className="ap-count">{categories.length}</span>
          </div>
          <form
            className="ap-taxonomy-form"
            onSubmit={(event) => {
              event.preventDefault();
              const value = name.trim();
              if (!value || categories.some((item) => item.name === value)) {
                setError(value ? "该分类已存在。" : "请填写分类名称。");
                categoryInput.current?.focus();
                return;
              }
              setCategories([
                ...categories,
                { id: `c${Date.now()}`, name: value, color, postCount: 0 },
              ]);
              setName("");
              setError("");
              notify("分类已添加到预览");
              categoryInput.current?.focus();
            }}
          >
            <label htmlFor="ap-category-name">分类名称</label>
            <div className="ap-taxonomy-add">
              <Input
                id="ap-category-name"
                ref={categoryInput}
                value={name}
                placeholder="输入分类名称"
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(error) && !editing}
                aria-describedby={error && !editing ? "ap-category-error" : undefined}
              />
              <ColorInput
                value={color}
                onChange={(event) => setColor(event.target.value)}
                aria-label="分类颜色"
              />
              <Button type="submit" size="form" variant="primary">
                <Plus size={16} />
                添加
              </Button>
            </div>
            {error && !editing && (
              <p id="ap-category-error" className="ap-field-error" role="alert">
                {error}
              </p>
            )}
          </form>
          <DataTable
            data={categories}
            columns={columns}
            getRowId={(item) => item.id}
            {...state}
            caption="分类及关联文章数量"
            tableClassName="ap-category-table"
            emptyState={<p className="ap-empty">还没有分类，添加一个主题开始整理。</p>}
          />
        </Card>
        <Card className="ap-taxonomy-card">
          <div className="ap-module-heading">
            <h2>标签</h2>
            <span className="ap-count">{tags.length}</span>
          </div>
          <form
            className="ap-taxonomy-form"
            onSubmit={(event) => {
              event.preventDefault();
              const value = tag.trim();
              if (!value || tags.includes(value)) {
                setTagError(value ? "该标签已存在。" : "请填写标签名称。");
                tagInput.current?.focus();
                return;
              }
              setTags([...tags, value]);
              setTag("");
              setTagError("");
              notify("标签已添加到预览");
              tagInput.current?.focus();
            }}
          >
            <label htmlFor="ap-tag-name">标签名称</label>
            <div className="ap-taxonomy-add">
              <Input
                id="ap-tag-name"
                ref={tagInput}
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                placeholder="输入标签名称"
                aria-invalid={Boolean(tagError)}
                aria-describedby={tagError ? "ap-tag-error" : undefined}
              />
              <Button type="submit" size="form" variant="primary">
                <Plus size={16} />
                添加
              </Button>
            </div>
            {tagError && (
              <p id="ap-tag-error" className="ap-field-error" role="alert">
                {tagError}
              </p>
            )}
          </form>
          <div className="ap-tag-cloud">
            {tags.map((item) => (
              <span className="ap-tag" key={item}>
                {item}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`移除标签 ${item}`}
                  onClick={(event) => {
                    const container = event.currentTarget.closest(".ap-tag-cloud");
                    const buttons = container?.querySelectorAll<HTMLButtonElement>("button");
                    const index = tags.indexOf(item);
                    const nextButton = buttons?.[index + 1] ?? buttons?.[index - 1];
                    setTags(tags.filter((tagName) => tagName !== item));
                    requestAnimationFrame(() => (nextButton ?? tagInput.current)?.focus());
                    notify(`已从预览移除标签 ${item}`);
                  }}
                >
                  <X size={14} />
                </Button>
              </span>
            ))}
          </div>
          <p className="ap-module-note">标签可用于细分文章主题。已关联文章的标签需要先解除引用。</p>
        </Card>
      </div>
      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setError("");
          }
        }}
      >
        <DialogContent
          className="ap-dialog"
          portalClassName="ap-preview-portal"
          finalFocus={() => trigger.current ?? categoryInput.current}
        >
          <DialogTitle>编辑分类</DialogTitle>
          <DialogDescription>调整名称和分类色，仅影响当前预览。</DialogDescription>
          <form
            className="ap-dialog-form"
            onSubmit={(event) => {
              event.preventDefault();
              const value = editName.trim();
              if (
                !value ||
                categories.some((item) => item.id !== editing?.id && item.name === value)
              ) {
                setError(value ? "该分类已存在。" : "请填写分类名称。");
                return;
              }
              setCategories(
                categories.map((item) =>
                  item.id === editing?.id ? { ...item, name: value, color: editColor } : item,
                ),
              );
              setEditing(null);
              setError("");
              notify("分类已在预览中更新");
            }}
          >
            <label htmlFor="ap-category-edit">分类名称</label>
            <Input
              id="ap-category-edit"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "ap-category-edit-error" : undefined}
            />
            <label htmlFor="ap-category-color">分类颜色</label>
            <ColorInput
              id="ap-category-color"
              value={editColor}
              onChange={(event) => setEditColor(event.target.value)}
            />
            {error && (
              <p id="ap-category-edit-error" role="alert" className="ap-field-error">
                {error}
              </p>
            )}
            <DialogActions>
              <Button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setError("");
                }}
              >
                取消
              </Button>
              <Button type="submit" variant="primary">
                保存分类
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent
          className="ap-dialog"
          portalClassName="ap-preview-portal"
          finalFocus={() => (deleted.current ? categoryInput.current : trigger.current)}
        >
          <DialogTitle>{deleting?.postCount ? "分类仍有关联文章" : "删除分类"}</DialogTitle>
          <DialogDescription>
            {deleting?.postCount
              ? `“${deleting?.name}”关联了 ${deleting?.postCount} 篇文章，请先调整文章分类。`
              : `确认从预览中删除“${deleting?.name}”？`}
          </DialogDescription>
          <DialogActions>
            <Button onClick={() => setDeleting(null)}>取消</Button>
            <Button
              variant="primary"
              disabled={Boolean(deleting?.postCount)}
              onClick={() => {
                deleted.current = true;
                setCategories(categories.filter((item) => item.id !== deleting?.id));
                setDeleting(null);
                notify("分类已从预览删除");
              }}
            >
              确认删除
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const releaseOptions = [
  { value: "feature", label: "功能" },
  { value: "fix", label: "修复" },
  { value: "performance", label: "性能" },
  { value: "security", label: "安全" },
];

export function ChangelogPreview({ notify }: NotifyProps) {
  const [items, setItems] = useState<Release[]>([
    {
      id: "r1",
      version: "1.6.0",
      title: "让写作回到内容本身",
      type: "feature",
      changes: [
        "整理文章写作工具栏，保存状态更清晰。",
        "补充移动端文章设置入口和专注模式。",
        "统一深浅主题下的控件与操作反馈。",
      ],
      published: true,
      date: "2026-10-16",
    },
    {
      id: "r2",
      version: "1.5.2",
      title: "改善阅读与管理体验",
      type: "fix",
      changes: ["修复窄屏下长标题造成的布局溢出。", "优化分类筛选与文章列表的空状态提示。"],
      published: true,
      date: "2026-10-12",
    },
    {
      id: "r3",
      version: "1.5.1",
      title: "资源加载调整",
      type: "performance",
      changes: ["减少重复资源请求，保持页面布局稳定。"],
      published: false,
      date: "2026-10-09",
    },
  ]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Release | null>(null);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("feature");
  const [changes, setChanges] = useState("");
  const [error, setError] = useState("");
  const [withdrawing, setWithdrawing] = useState<Release | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const filtered = items.filter(
    (item) =>
      (status === "all" || (status === "published") === item.published) &&
      `${item.version} ${item.title} ${item.changes.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const edit = (item: Release | null, button: HTMLElement | null) => {
    trigger.current = button;
    setEditing(item);
    setVersion(item?.version ?? "");
    setTitle(item?.title ?? "");
    setType(item?.type ?? "feature");
    setChanges(item?.changes.join("\n") ?? "");
    setError("");
    setOpen(true);
  };
  return (
    <div className="admin-data-page">
      <div className="ap-page-heading">
        <div>
          <h1>更新日志</h1>
          <p>记录每一次改进，让变化清晰可见。</p>
        </div>
        <Button
          ref={createButton}
          variant="primary"
          size="compact"
          onClick={(event) => edit(null, event.currentTarget)}
        >
          <Plus size={16} />
          发布更新
        </Button>
      </div>
      <div className="ap-workspace">
        <div className="ap-toolbar ap-release-toolbar">
          <div className="ap-release-search">
            <label htmlFor="ap-release-search" className="sr-only">
              搜索更新日志
            </label>
            <Input
              ref={search}
              id="ap-release-search"
              className="ds-control-compact"
              placeholder="搜索版本、标题或内容"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="ap-release-filter">
            <PreviewSelect
              id="ap-release-status"
              compact
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "全部状态" },
                { value: "published", label: "已发布" },
                { value: "withdrawn", label: "已撤回" },
              ]}
            />
          </div>
          <span className="ap-results">{filtered.length} 条更新</span>
        </div>
        <ol className="ap-release-timeline">
          {filtered.map((item) => (
            <li key={item.id} className="ap-release-item">
              <div className="ap-release-date">
                <time dateTime={item.date}>{item.date}</time>
                <strong>v{item.version}</strong>
              </div>
              <div className="ap-release-content">
                <div className="ap-release-title">
                  <h2>{item.title}</h2>
                  <span className={`ap-release-type ap-release-${item.type}`}>
                    {releaseOptions.find((option) => option.value === item.type)?.label}
                  </span>
                </div>
                <ul>
                  {item.changes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="ap-release-actions">
                  <span className={item.published ? "ap-status-success" : "ap-secondary-text"}>
                    {item.published ? "已发布" : "已撤回"}
                  </span>
                  <Button
                    variant="ghost"
                    size="compact"
                    onClick={(event) => edit(item, event.currentTarget)}
                  >
                    <Pencil size={14} />
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="compact"
                    className={item.published ? "ap-danger-action" : undefined}
                    onClick={(event) => {
                      if (item.published) {
                        trigger.current = event.currentTarget;
                        setWithdrawing(item);
                      } else {
                        setItems(
                          items.map((current) =>
                            current.id === item.id ? { ...current, published: true } : current,
                          ),
                        );
                        notify("更新已在预览中重新发布");
                      }
                    }}
                  >
                    {item.published ? "撤回" : "重新发布"}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
        {!filtered.length && (
          <div className="ap-empty">
            <p>没有找到匹配的更新。</p>
            <Button
              variant="ghost"
              onClick={() => {
                setQuery("");
                setStatus("all");
                search.current?.focus();
              }}
            >
              重置筛选
            </Button>
          </div>
        )}
        <div className="ap-local-pagination">
          <span>共 {filtered.length} 条，第 1 / 1 页</span>
          <Button variant="ghost" size="compact" disabled aria-label="上一页">
            <ChevronLeft size={16} />
            上一页
          </Button>
          <Button variant="ghost" size="compact" disabled aria-label="下一页">
            下一页
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="ap-release-dialog"
          portalClassName="ap-preview-portal"
          finalFocus={() => trigger.current ?? createButton.current}
        >
          <DialogTitle>{editing ? "编辑更新" : "发布更新"}</DialogTitle>
          <DialogDescription>将改动分条记录，每行一项。内容仅保留在预览中。</DialogDescription>
          <form
            className="ap-dialog-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!version.trim() || !title.trim() || !changes.trim()) {
                setError("请填写版本号、标题和变更内容。");
                return;
              }
              const data: Release = {
                id: editing?.id ?? `r${Date.now()}`,
                version: version.trim(),
                title: title.trim(),
                type,
                changes: changes
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
                published: editing?.published ?? true,
                date: editing?.date ?? "2026-10-16",
              };
              setItems(
                editing
                  ? items.map((item) => (item.id === editing.id ? data : item))
                  : [data, ...items],
              );
              setOpen(false);
              notify(editing ? "更新已在预览中保存" : "更新已在预览中发布");
            }}
          >
            <label htmlFor="ap-release-version">版本号</label>
            <Input
              id="ap-release-version"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              placeholder="例如 1.6.1"
            />
            <label htmlFor="ap-release-title">标题</label>
            <Input
              id="ap-release-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <label htmlFor="ap-release-type">类型</label>
            <PreviewSelect
              id="ap-release-type"
              value={type}
              onChange={setType}
              options={releaseOptions}
            />
            <label htmlFor="ap-release-changes">变更内容</label>
            <Textarea
              id="ap-release-changes"
              rows={5}
              value={changes}
              onChange={(event) => setChanges(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "ap-release-error" : undefined}
            />
            {error && (
              <p className="ap-field-error" id="ap-release-error" role="alert">
                {error}
              </p>
            )}
            <DialogActions>
              <Button type="button" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button variant="primary" type="submit">
                {editing ? "保存更新" : "发布更新"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(withdrawing)}
        onOpenChange={(next) => {
          if (!next) setWithdrawing(null);
        }}
      >
        <DialogContent
          className="ap-dialog"
          portalClassName="ap-preview-portal"
          finalFocus={() => trigger.current ?? search.current}
        >
          <DialogTitle>撤回更新</DialogTitle>
          <DialogDescription>
            “{withdrawing?.title}”将从预览的已发布列表中隐藏，之后可重新发布。
          </DialogDescription>
          <DialogActions>
            <Button onClick={() => setWithdrawing(null)}>取消</Button>
            <Button
              variant="primary"
              onClick={() => {
                setItems(
                  items.map((item) =>
                    item.id === withdrawing?.id ? { ...item, published: false } : item,
                  ),
                );
                setWithdrawing(null);
                notify("更新已在预览中撤回");
              }}
            >
              确认撤回
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const initialSettings: Record<string, string> = {
  title: "付小晨的个人网站",
  subtitle: "记录想法，持续创造。",
  authorName: "付小晨",
  authorRole: "开发者 / 设计爱好者",
  avatarUrl: "",
  aboutMe: "关注前端开发、产品设计与日常生活。\n在这里分享实践中的发现，也保存值得回看的时刻。",
  seoDescription: "付小晨的个人网站，分享前端开发、产品设计与生活记录。",
  ogImageUrl: "",
  googleVerification: "",
  bingVerification: "",
  baiduVerification: "",
  postsPerPage: "12",
  icpText: "",
  icpUrl: "",
  policeText: "",
  policeUrl: "",
  googleId: "",
  baiduId: "",
};
const settingsGroups = [
  { value: "profile", label: "资料与站点" },
  { value: "seo", label: "SEO" },
  { value: "system", label: "系统偏好" },
  { value: "filing", label: "备案" },
  { value: "social", label: "社交账号" },
  { value: "analytics", label: "访问统计" },
];

function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="ap-settings-section">
      <div className="ap-settings-section-heading">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="ap-settings-fields">{children}</div>
    </section>
  );
}

export function SettingsPreview({
  notify,
  onDirtyChange,
  discardVersion = 0,
}: NotifyProps & DraftPreviewProps) {
  const [draft, setDraft] = useState(initialSettings);
  const [saved, setSaved] = useState(initialSettings);
  const [tab, setTab] = useState("profile");
  const [reload, setReload] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState({ google: false, baidu: false });
  const [socials, setSocials] = useState([
    {
      id: "s1",
      label: "GitHub",
      url: "https://github.com/fuxiaochen",
      icon: "github",
      enabled: true,
    },
  ]);
  const [savedSocials, setSavedSocials] = useState(socials);
  const [savedAnalytics, setSavedAnalytics] = useState(analytics);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  // 只在壳确认放弃草稿后同步重置本组件，避免先绘制旧草稿再由 effect 覆盖。
  const [seenDiscardVersion, setSeenDiscardVersion] = useState(discardVersion);
  if (seenDiscardVersion !== discardVersion) {
    setSeenDiscardVersion(discardVersion);
    setDraft({ ...saved });
    setSocials(savedSocials.map((item) => ({ ...item })));
    setAnalytics({ ...savedAnalytics });
    setDirty(false);
    setError("");
  }
  const reloadButton = useRef<HTMLButtonElement>(null);
  const set = (key: string, value: string) => {
    setDraft({ ...draft, [key]: value });
    setDirty(true);
    setError("");
  };
  const field = (key: string, label: string, hint?: string, textarea = false) => (
    <div className={`ap-settings-field${textarea ? " ap-settings-field-wide" : ""}`}>
      <label htmlFor={`ap-setting-${key}`}>{label}</label>
      <div>
        {textarea ? (
          <Textarea
            id={`ap-setting-${key}`}
            maxLength={key === "seoDescription" ? 300 : 2000}
            rows={4}
            value={draft[key]}
            onChange={(event) => set(key, event.target.value)}
            aria-invalid={
              Boolean(error) &&
              ((key === "title" && !draft.title.trim()) ||
                (key === "authorName" && !draft.authorName.trim()) ||
                (key === "postsPerPage" && error.includes("每页文章")))
            }
            aria-describedby={error ? "ap-settings-error" : undefined}
          />
        ) : (
          <Input
            id={`ap-setting-${key}`}
            value={draft[key]}
            type={key === "postsPerPage" ? "number" : "text"}
            min={key === "postsPerPage" ? 1 : undefined}
            max={key === "postsPerPage" ? 100 : undefined}
            onChange={(event) => set(key, event.target.value)}
            aria-invalid={
              Boolean(error) &&
              ((key === "title" && !draft.title.trim()) ||
                (key === "authorName" && !draft.authorName.trim()) ||
                (key === "postsPerPage" && error.includes("每页文章")))
            }
            aria-describedby={error ? "ap-settings-error" : undefined}
          />
        )}
        {hint && <p className="ap-field-hint">{hint}</p>}
      </div>
    </div>
  );
  return (
    <form
      className="ap-settings admin-data-page"
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.title.trim() || !draft.authorName.trim()) {
          setTab("profile");
          setError("请填写站点名称和博主昵称。");
          requestAnimationFrame(() =>
            document
              .getElementById(`ap-setting-${draft.title.trim() ? "authorName" : "title"}`)
              ?.focus(),
          );
          return;
        }
        if (
          !Number.isInteger(Number(draft.postsPerPage)) ||
          Number(draft.postsPerPage) < 1 ||
          Number(draft.postsPerPage) > 100
        ) {
          setTab("system");
          setError("每页文章数量应为 1-100 之间的整数。");
          requestAnimationFrame(() => document.getElementById("ap-setting-postsPerPage")?.focus());
          return;
        }
        setSaved({ ...draft });
        setSavedSocials(socials.map((item) => ({ ...item })));
        setSavedAnalytics({ ...analytics });
        setDirty(false);
        notify("所有变更已保存到当前预览");
      }}
    >
      <div className="ap-page-heading">
        <div>
          <h1>系统设置</h1>
          <p>管理站点资料、SEO、备案、社交账号与访问统计。</p>
        </div>
        <Button variant="primary" size="compact" type="submit">
          <Save size={16} />
          保存所有变更
        </Button>
      </div>
      {error && (
        <p id="ap-settings-error" role="alert" className="ap-field-error ap-settings-feedback">
          {error}
        </p>
      )}
      <Tabs value={tab} onValueChange={(next) => setTab(String(next))}>
        <div className="ap-settings-toolbar">
          <div className="ap-settings-tab-scroll">
            <TabsList size="compact" aria-label="设置分组">
              {settingsGroups.map((group) => (
                <TabsTrigger key={group.value} value={group.value}>
                  {group.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button
            ref={reloadButton}
            variant="ghost"
            size="compact"
            type="button"
            onClick={() => setReload(true)}
          >
            重新载入已保存设置
          </Button>
        </div>
        <TabsPanel value="profile">
          <SettingSection title="站点信息" description="首页、导航与页脚使用这些资料。">
            {field("title", "站点名称")}
            {field("subtitle", "站点副标题")}
          </SettingSection>
          <SettingSection title="个人资料">
            <div className="ap-settings-identity">
              {/* 独立 HTML 会内嵌此本地头像，不经过 Next 图片服务。 */}
              {/* oxlint-disable-next-line next/no-img-element */}
              <img
                className="ap-identity-avatar"
                src="/avatar.avif"
                alt=""
                width={56}
                height={56}
              />
              <span>{draft.authorName}</span>
            </div>
            {field("authorName", "博主昵称")}
            {field("authorRole", "身份头衔")}
            {field("avatarUrl", "头像图片链接", "HTTPS 图片链接或站内绝对路径；留空使用默认图标。")}
            {field("aboutMe", "个人简介", "用简短的文字介绍自己。", true)}
          </SettingSection>
        </TabsPanel>
        <TabsPanel value="seo">
          <SettingSection title="搜索与分享" description="设置站点的默认搜索描述与分享图片。">
            {field("seoDescription", "搜索描述", "最多 300 个字符；文章页优先使用文章摘要。", true)}
            {field(
              "ogImageUrl",
              "默认分享图片",
              "HTTPS 图片链接或站内绝对路径；留空使用站点默认分享图。",
            )}
          </SettingSection>
          <SettingSection
            title="站长平台验证"
            description="填写验证标签 content 中的验证码；留空时不输出验证标签。"
          >
            {field("googleVerification", "Google Search Console")}
            {field("bingVerification", "Bing Webmaster Tools")}
            {field("baiduVerification", "百度搜索资源平台")}
          </SettingSection>
        </TabsPanel>
        <TabsPanel value="system">
          <SettingSection title="阅读偏好" description="设置前台文章列表每页显示的条数。">
            {field("postsPerPage", "每页文章数量", "1-100 之间的整数。")}
          </SettingSection>
        </TabsPanel>
        <TabsPanel value="filing">
          <SettingSection
            title="备案信息（选填）"
            description="每项文案与链接一起填写或一起留空；留空不展示。"
          >
            {field("icpText", "网站备案展示文案")}
            {field("icpUrl", "网站备案查询链接")}
            {field("policeText", "公安备案展示文案")}
            {field("policeUrl", "公安备案查询链接")}
          </SettingSection>
        </TabsPanel>
        <TabsPanel value="social">
          <SettingSection
            title="社交账号"
            description="按列表顺序展示启用账号，支持同一平台多个账号。"
          >
            {socials.map((social, index) => (
              <section
                className="ap-social-editor"
                key={social.id}
                aria-label={`社交账号 ${index + 1}`}
              >
                <div className="ap-social-actions">
                  <span className="ap-social-index">账号 {index + 1}</span>
                  <Switch
                    touchTarget
                    aria-label={`展示账号 ${index + 1}`}
                    checked={social.enabled}
                    onCheckedChange={(checked) => {
                      setSocials(
                        socials.map((item) =>
                          item.id === social.id ? { ...item, enabled: checked } : item,
                        ),
                      );
                      setDirty(true);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="compact"
                    aria-label={`上移账号 ${index + 1}`}
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...socials];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      setSocials(next);
                      setDirty(true);
                    }}
                  >
                    <ArrowUp size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="compact"
                    aria-label={`下移账号 ${index + 1}`}
                    disabled={index === socials.length - 1}
                    onClick={() => {
                      const next = [...socials];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      setSocials(next);
                      setDirty(true);
                    }}
                  >
                    <ArrowDown size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="compact"
                    aria-label={`删除账号 ${index + 1}`}
                    onClick={() => {
                      const next = socials[index + 1] ?? socials[index - 1];
                      setSocials(socials.filter((item) => item.id !== social.id));
                      setDirty(true);
                      requestAnimationFrame(() =>
                        document
                          .getElementById(next ? `ap-social-${next.id}-label` : "ap-social-add")
                          ?.focus(),
                      );
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="ap-settings-field">
                  <label htmlFor={`ap-social-${social.id}-label`}>展示文案</label>
                  <Input
                    id={`ap-social-${social.id}-label`}
                    value={social.label}
                    onChange={(event) => {
                      setSocials(
                        socials.map((item) =>
                          item.id === social.id ? { ...item, label: event.target.value } : item,
                        ),
                      );
                      setDirty(true);
                    }}
                  />
                </div>
                <div className="ap-settings-field">
                  <label htmlFor={`ap-social-${social.id}-url`}>账号链接</label>
                  <Input
                    id={`ap-social-${social.id}-url`}
                    value={social.url}
                    onChange={(event) => {
                      setSocials(
                        socials.map((item) =>
                          item.id === social.id ? { ...item, url: event.target.value } : item,
                        ),
                      );
                      setDirty(true);
                    }}
                  />
                </div>
                <div className="ap-settings-field">
                  <label htmlFor={`ap-social-${social.id}-icon`}>图标</label>
                  <PreviewSelect
                    id={`ap-social-${social.id}-icon`}
                    value={social.icon}
                    onChange={(icon) => {
                      setSocials(
                        socials.map((item) => (item.id === social.id ? { ...item, icon } : item)),
                      );
                      setDirty(true);
                    }}
                    options={[
                      { value: "github", label: "GitHub" },
                      { value: "globe", label: "网站" },
                      { value: "mail", label: "邮箱" },
                    ]}
                  />
                </div>
              </section>
            ))}
            <Button
              id="ap-social-add"
              type="button"
              size="compact"
              disabled={socials.length >= 20}
              onClick={() => {
                const id = `s${Date.now()}`;
                setSocials([...socials, { id, label: "", url: "", icon: "globe", enabled: true }]);
                setDirty(true);
                requestAnimationFrame(() =>
                  document.getElementById(`ap-social-${id}-label`)?.focus(),
                );
              }}
            >
              <Plus size={16} />
              新增账号
            </Button>
          </SettingSection>
        </TabsPanel>
        <TabsPanel value="analytics">
          <SettingSection
            title="Google Analytics（GA4）"
            description="请在 GA4 数据流设置中关闭基于浏览器历史记录的网页浏览，避免重复计数。"
          >
            <div className="ap-settings-field">
              <label htmlFor="ap-ga-enabled">启用 Google 统计</label>
              <div className="ap-settings-toggle">
                <Switch
                  id="ap-ga-enabled"
                  touchTarget
                  checked={analytics.google}
                  onCheckedChange={(checked) => {
                    setAnalytics({ ...analytics, google: checked });
                    setDirty(true);
                  }}
                />
                <span>{analytics.google ? "已启用" : "未启用"}</span>
              </div>
            </div>
            {field("googleId", "Measurement ID", "例如 G-XXXXXXXXXX；不接受脚本代码。")}
          </SettingSection>
          <SettingSection title="百度统计">
            <div className="ap-settings-field">
              <label htmlFor="ap-baidu-enabled">启用百度统计</label>
              <div className="ap-settings-toggle">
                <Switch
                  id="ap-baidu-enabled"
                  touchTarget
                  checked={analytics.baidu}
                  onCheckedChange={(checked) => {
                    setAnalytics({ ...analytics, baidu: checked });
                    setDirty(true);
                  }}
                />
                <span>{analytics.baidu ? "已启用" : "未启用"}</span>
              </div>
            </div>
            {field("baiduId", "站点 ID", "填写统计代码 hm.js 后的 32 位站点 ID。")}
          </SettingSection>
        </TabsPanel>
      </Tabs>
      <output className="ap-settings-footnote">
        {dirty ? "有未保存的预览变更。" : "预览中的设置已保存。"}
      </output>
      <Dialog open={reload} onOpenChange={setReload}>
        <DialogContent
          className="ap-dialog"
          portalClassName="ap-preview-portal"
          finalFocus={reloadButton}
        >
          <DialogTitle>重新载入设置</DialogTitle>
          <DialogDescription>
            将使用本次预览中保存的设置，替换当前未保存的资料草稿。
          </DialogDescription>
          <DialogActions>
            <Button type="button" onClick={() => setReload(false)}>
              保留草稿
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setDraft({ ...saved });
                setSocials(savedSocials.map((item) => ({ ...item })));
                setAnalytics({ ...savedAnalytics });
                setDirty(false);
                setError("");
                setReload(false);
                notify("已载入预览中保存的设置");
              }}
            >
              确认重新载入
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </form>
  );
}

// 仅渲染工具栏支持的 Markdown 子集；使用 React 文本节点，避免执行粘贴的 HTML。
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={index}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/.exec(part);
    if (link)
      return (
        <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">
          {link[1]}
        </a>
      );
    return part;
  });
}

function PreviewMarkdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const key = index;
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (line.startsWith("```")) {
      index += 1;
      const code: string[] = [];
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push(
        <pre key={key}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      index += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={key}>{renderInline(line.slice(3))}</h2>);
      index += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const list: ReactNode[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        list.push(<li key={index}>{renderInline(lines[index].slice(2))}</li>);
        index += 1;
      }
      blocks.push(<ul key={key}>{list}</ul>);
      continue;
    }
    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(## |- |```)/.test(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={key}>{renderInline(paragraph.join("\n"))}</p>);
  }
  return <article className="article-prose ap-article-render">{blocks}</article>;
}

const initialArticle =
  "## 留意那些值得反复打磨的细节\n\n好的工具应该让人专注于手头的事。写作时，最重要的是想法如何落到文字里，而不是界面上有多少操作。\n\n这次整理，我把常用操作放在了更容易找到的位置，让次要设置安静地待在一旁。\n\n- 保存状态始终可见\n- 正文保留连续的阅读空间\n- 需要时再打开文章设置\n\n细节不必抢眼，但每一次使用都应该顺手。";

export function EditorPreview({
  notify,
  onBack,
  active = true,
  onDirtyChange,
  discardVersion = 0,
}: NotifyProps & DraftPreviewProps & { onBack: () => void; active?: boolean }) {
  const [title, setTitle] = useState("把界面的细节留给设计，把注意力留给内容");
  const [body, setBody] = useState(initialArticle);
  const [summary, setSummary] = useState("一些关于写作工具、内容与界面细节的想法。");
  const [focus, setFocus] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(true);
  // 初始展示共用正文排版；轻量编辑通过工具栏切换，避免把 Markdown 源码当成视觉目标。
  const [preview, setPreview] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("draft");
  const [category, setCategory] = useState("design");
  const [tag, setTag] = useState("设计系统");
  const [sort, setSort] = useState("0");
  const [importOpen, setImportOpen] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState("");
  const [savedArticle, setSavedArticle] = useState({
    title,
    body,
    summary,
    featured,
    status,
    category,
    tag,
    sort,
  });
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  const [seenDiscardVersion, setSeenDiscardVersion] = useState(discardVersion);
  if (seenDiscardVersion !== discardVersion) {
    setSeenDiscardVersion(discardVersion);
    setTitle(savedArticle.title);
    setBody(savedArticle.body);
    setSummary(savedArticle.summary);
    setFeatured(savedArticle.featured);
    setStatus(savedArticle.status);
    setCategory(savedArticle.category);
    setTag(savedArticle.tag);
    setSort(savedArticle.sort);
    setDirty(false);
    setError("");
  }
  const editor = useRef<HTMLTextAreaElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const layout = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const element = layout.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width >= 1100;
      setWide(next);
      if (next) setSettingsOpen(false);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) {
      setFocus(false);
      setSettingsOpen(false);
      setImportOpen(false);
      setLinkOpen(false);
    }
  }
  useEffect(() => {
    document.body.classList.toggle("ap-editor-focus", focus && active);
    return () => document.body.classList.remove("ap-editor-focus");
  }, [focus, active]);
  const change = () => setDirty(true);
  const save = () => {
    if (!title.trim() || !body.trim()) {
      setError("请填写文章标题和正文。");
      return;
    }
    setError("");
    setDirty(false);
    setSavedArticle({ title, body, summary, featured, status, category, tag, sort });
    notify(status === "published" ? "文章已在当前预览中发布" : "草稿已保存到当前预览");
  };
  // 预览只提供轻量 Markdown 编辑；正式块编辑器的上传和持久化不在此运行。
  const insert = (before: string, after = "", placeholder = "文字") => {
    const start = editor.current?.selectionStart ?? body.length;
    const end = editor.current?.selectionEnd ?? body.length;
    const selected = body.slice(start, end) || placeholder;
    setBody(body.slice(0, start) + before + selected + after + body.slice(end));
    setDirty(true);
    requestAnimationFrame(() => {
      editor.current?.focus();
      editor.current?.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };
  const settingsFields = (
    <div className="ap-article-fields">
      <div className="ap-dialog-field">
        <label htmlFor="ap-article-status">文章状态</label>
        <div id="ap-article-status" className="ap-status-radios">
          {[
            { value: "draft", label: "草稿" },
            { value: "published", label: "已发布" },
          ].map((item) => (
            <label key={item.value}>
              <input
                type="radio"
                name="ap-article-status"
                value={item.value}
                checked={status === item.value}
                onChange={() => {
                  setStatus(item.value);
                  change();
                }}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
      <div className="ap-dialog-field">
        <label htmlFor="ap-article-category">文章分类</label>
        <PreviewSelect
          id="ap-article-category"
          value={category}
          onChange={(value) => {
            setCategory(value);
            change();
          }}
          options={[
            { value: "design", label: "设计与体验" },
            { value: "frontend", label: "前端开发" },
            { value: "life", label: "生活记录" },
            { value: "none", label: "未分类" },
          ]}
        />
      </div>
      <div className="ap-dialog-field">
        <label htmlFor="ap-article-tags">标签</label>
        <Input
          id="ap-article-tags"
          value={tag}
          onChange={(event) => {
            setTag(event.target.value);
            change();
          }}
        />
        <p className="ap-field-hint">多个标签使用逗号分隔。</p>
      </div>
      <div className="ap-dialog-field">
        <label htmlFor="ap-article-summary">摘要</label>
        <Textarea
          id="ap-article-summary"
          rows={4}
          maxLength={300}
          value={summary}
          onChange={(event) => {
            setSummary(event.target.value);
            change();
          }}
        />
        <span className="ap-field-hint">{summary.length} / 300</span>
      </div>
      <div className="ap-article-switch">
        <label htmlFor="ap-article-featured">精选文章</label>
        <Switch
          id="ap-article-featured"
          checked={featured}
          onCheckedChange={(value) => {
            setFeatured(value);
            change();
          }}
          touchTarget
        />
      </div>
      <div className="ap-dialog-field">
        <label htmlFor="ap-article-sort">排序</label>
        <Input
          id="ap-article-sort"
          type="number"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            change();
          }}
        />
      </div>
    </div>
  );
  return (
    <div className={`ap-editor${focus ? " is-focus" : ""}`} ref={layout}>
      <div className="ap-writing-bar">
        <Button ref={backButton} variant="ghost" size="compact" onClick={onBack}>
          <ArrowLeft size={16} />
          返回
        </Button>
        <output className="ap-writing-status">{dirty ? "未保存" : "已保存到预览"}</output>
        <div className="ap-writing-actions">
          <Button
            ref={settingsButton}
            variant="ghost"
            size="compact"
            onClick={() => {
              if (wide) setSettingsVisible(!settingsVisible);
              else setSettingsOpen(true);
            }}
            aria-expanded={wide ? settingsVisible : settingsOpen}
          >
            <Settings2 size={16} />
            <span>文章设置</span>
          </Button>
          <Button
            variant="ghost"
            size="compact"
            aria-pressed={focus}
            onClick={() => setFocus(!focus)}
          >
            <Focus size={16} />
            <span>{focus ? "退出专注" : "专注模式"}</span>
          </Button>
          <Button variant="primary" size="compact" onClick={save}>
            <Save size={16} />
            保存
          </Button>
        </div>
      </div>
      {error && (
        <p id="ap-writing-error" className="ap-field-error" role="alert">
          {error}
        </p>
      )}
      <div className={`ap-writing-layout${settingsVisible ? " has-settings" : ""}`}>
        <div className="ap-writing-canvas">
          <label className="sr-only" htmlFor="ap-writing-title">
            文章标题
          </label>
          <textarea
            id="ap-writing-title"
            className="ap-writing-title"
            rows={1}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              change();
            }}
            placeholder="输入文章标题"
            aria-invalid={Boolean(error) && !title.trim()}
            aria-describedby={error ? "ap-writing-error" : undefined}
          />
          <div
            className={`ap-editor-toolbar${error && !body.trim() ? " is-invalid" : ""}`}
            role="toolbar"
            aria-label="正文工具"
          >
            <Button
              variant="ghost"
              size="compact"
              aria-label="插入二级标题"
              onClick={() => insert("\n## ", "\n", "标题")}
            >
              <Heading2 size={17} />
            </Button>
            <Button
              variant="ghost"
              size="compact"
              aria-label="插入加粗文字"
              onClick={() => insert("**", "**")}
            >
              <Bold size={17} />
            </Button>
            <Button
              variant="ghost"
              size="compact"
              aria-label="插入列表"
              onClick={() => insert("\n- ", "\n", "列表项")}
            >
              <List size={17} />
            </Button>
            <Button
              variant="ghost"
              size="compact"
              aria-label="插入代码块"
              onClick={() => insert("\n```javascript\n", "\n```\n", "console.log('你好');")}
            >
              <Code2 size={17} />
            </Button>
            <Button
              variant="ghost"
              size="compact"
              aria-label="插入链接"
              onClick={() => setLinkOpen(true)}
            >
              <Link2 size={17} />
            </Button>
            <Button
              variant="ghost"
              size="compact"
              aria-label="导入 Markdown"
              onClick={() => setImportOpen(true)}
            >
              <FileUp size={17} />
            </Button>
            <Button
              variant="ghost"
              size="compact"
              aria-pressed={preview}
              onClick={() => setPreview(!preview)}
            >
              <Eye size={17} />
              {preview ? "继续编辑" : "阅读预览"}
            </Button>
          </div>
          {preview ? (
            <PreviewMarkdown source={body} />
          ) : (
            <>
              <label htmlFor="ap-writing-body" className="sr-only">
                文章正文（Markdown）
              </label>
              <textarea
                id="ap-writing-body"
                className="article-prose ap-writing-body"
                ref={editor}
                value={body}
                onChange={(event) => {
                  setBody(event.target.value);
                  change();
                }}
                spellCheck={false}
                aria-invalid={Boolean(error) && !body.trim()}
                aria-describedby={error ? "ap-writing-error" : undefined}
              />
            </>
          )}
          <div className="ap-editor-footnote">
            <span>{body.length} 字符</span>
            <span>轻量 Markdown 预览，修改仅保留在内存中</span>
          </div>
        </div>
        {wide && settingsVisible && (
          <aside className="ap-article-settings">
            <h2>文章设置</h2>
            {settingsFields}
          </aside>
        )}
      </div>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent
          placement="right"
          className="ap-article-drawer"
          portalClassName="ap-preview-portal"
          finalFocus={settingsButton}
        >
          <div className="ap-drawer-heading">
            <DialogTitle>文章设置</DialogTitle>
            <Button
              variant="ghost"
              size="compact"
              aria-label="关闭文章设置"
              onClick={() => setSettingsOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>
          <DialogDescription>调整发布状态、分类和摘要。</DialogDescription>
          {settingsOpen && settingsFields}
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>关闭</Button>
            <Button
              variant="primary"
              onClick={() => {
                save();
                if (title.trim() && body.trim()) setSettingsOpen(false);
              }}
            >
              保存
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent
          className="ap-markdown-dialog"
          portalClassName="ap-preview-portal"
          finalFocus={editor}
        >
          <DialogTitle>导入 Markdown</DialogTitle>
          <DialogDescription>粘贴 Markdown 内容，将追加到当前预览正文末尾。</DialogDescription>
          <div className="ap-dialog-form">
            <label htmlFor="ap-import-markdown">Markdown 内容</label>
            <Textarea
              id="ap-import-markdown"
              rows={10}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
            />
            <DialogActions>
              <Button onClick={() => setImportOpen(false)}>取消</Button>
              <Button
                variant="primary"
                disabled={!markdown.trim()}
                onClick={() => {
                  setBody(`${body}\n\n${markdown.trim()}`);
                  setMarkdown("");
                  setDirty(true);
                  setImportOpen(false);
                  notify("Markdown 已加入预览正文");
                }}
              >
                插入正文
              </Button>
            </DialogActions>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent
          className="ap-dialog"
          portalClassName="ap-preview-portal"
          finalFocus={editor}
        >
          <DialogTitle>插入链接</DialogTitle>
          <DialogDescription>添加到正文光标位置。</DialogDescription>
          <form
            className="ap-dialog-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^https?:\/\//.test(linkUrl)) {
                setError("链接需要以 http:// 或 https:// 开头。");
                return;
              }
              const start = editor.current?.selectionStart ?? body.length;
              const end = editor.current?.selectionEnd ?? body.length;
              setBody(
                body.slice(0, start) +
                  `[${linkLabel || body.slice(start, end) || linkUrl}](${linkUrl})` +
                  body.slice(end),
              );
              setDirty(true);
              setLinkOpen(false);
              setLinkLabel("");
              setLinkUrl("");
              setError("");
            }}
          >
            <label htmlFor="ap-link-label">链接文字</label>
            <Input
              id="ap-link-label"
              value={linkLabel}
              onChange={(event) => setLinkLabel(event.target.value)}
            />
            <label htmlFor="ap-link-url">链接地址</label>
            <Input
              id="ap-link-url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://"
              aria-invalid={Boolean(error)}
            />
            {error && (
              <p className="ap-field-error" role="alert">
                {error}
              </p>
            )}
            <DialogActions>
              <Button
                type="button"
                onClick={() => {
                  setLinkOpen(false);
                  setError("");
                }}
              >
                取消
              </Button>
              <Button type="submit" variant="primary">
                插入链接
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
