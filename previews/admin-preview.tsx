/**
 * 后台独立预览入口。所有数据和写入仅存在于 React 内存。
 * 直接复用项目组件；构建脚本负责内嵌样式、字体与运行时。
 */
import type { ColumnDef, TableMeta } from "@tanstack/react-table";
import type { ReactElement, ReactNode, RefObject } from "react";

import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Globe2,
  KeyRound,
  Link2,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sun,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { AdminRowActionsCell } from "@/components/admin/admin-table";
import { BrandLogo } from "@/components/brand-logo";
import { MotionProvider } from "@/components/motion/motion-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, useDataTableState } from "@/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  CategoriesPreview,
  ChangelogPreview,
  EditorPreview,
  SettingsPreview,
} from "./admin-preview-sections";

type Page = "posts" | "categories" | "changelog" | "friends" | "settings" | "backups" | "editor";
type Notify = (message: string) => void;
const navigation = [
  {
    group: "内容",
    items: [
      { page: "posts", name: "文章管理", icon: FileText },
      { page: "categories", name: "分类与标签", icon: Tags },
      { page: "changelog", name: "更新日志", icon: Clock3 },
    ],
  },
  { group: "互动", items: [{ page: "friends", name: "友情链接", icon: Link2 }] },
  {
    group: "系统",
    items: [
      { page: "settings", name: "系统设置", icon: Settings },
      { page: "backups", name: "备份管理", icon: Database },
    ],
  },
] as const;

function Avatar({ size }: { size: number }) {
  // oxlint-disable-next-line next/no-img-element -- 离线 HTML 内嵌头像，不依赖 Next 图片优化服务。
  return <img src="/avatar.avif" width={size} height={size} alt="" />;
}

function isPage(value: string): value is Page {
  return (
    value === "posts" ||
    value === "categories" ||
    value === "changelog" ||
    value === "friends" ||
    value === "settings" ||
    value === "backups" ||
    value === "editor"
  );
}

function Hint({ label, children }: { label: string; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="ap-page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </header>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger size="compact" aria-label={label} className="ap-filter">
        <SelectValue>{options.find((option) => option[0] === value)?.[1]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map(([key, name]) => (
          <SelectItem key={key} value={key}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SearchBox({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <InputGroup size="compact" className="ap-search">
      <InputGroupAddon>
        <Search size={16} aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </InputGroup>
  );
}

function useCollectionSidebar() {
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 1201px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1201px)");
    const update = () => setWide(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  finalFocus,
  fallbackFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  finalFocus?: RefObject<HTMLElement | null>;
  fallbackFocus?: () => HTMLElement | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="ap-dialog"
        finalFocus={() => {
          const target = finalFocus?.current;
          return target?.isConnected && !target.closest("[hidden]")
            ? target
            : (fallbackFocus?.() ?? true);
        }}
        portalClassName="ap-preview-portal"
      >
        <div className="ap-dialog-heading">
          <div>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </div>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="compact"
                className="ap-icon-button"
                aria-label="关闭弹窗"
              />
            }
          >
            <X size={18} />
          </DialogClose>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}

type Backup = {
  id: string;
  date: string;
  bytes: number;
  status: "complete" | "running" | "failed";
  sha: string;
};
const exampleBackups: Backup[] = [
  {
    id: "baf734ad-7832-4e3d-bf16-2db9c6f25081",
    date: "2026/10/16 02:00:03",
    bytes: 3846144,
    status: "complete",
    sha: "7f3a92c1d4e60b8a2c519e67f018a35d9c6b42e17a5fd803be914c27d8e6a590",
  },
  {
    id: "6ced261e-8fc1-4bf8-b328-bf783c680f2a",
    date: "2026/10/15 02:00:02",
    bytes: 3829760,
    status: "complete",
    sha: "b96d4e20a7183c5f6e902d71c34ab805e69f1230d87c4a5b2e6109fc378d5a46",
  },
  {
    id: "a12bde77-87aa-439b-91a0-f8ac62d470e4",
    date: "2026/10/14 02:00:04",
    bytes: 3813376,
    status: "complete",
    sha: "e813c467a9d025b10f72e698ab341d05c86f1237d9a604e8b2c571fe830b6a29",
  },
];

function backupStatus(status: Backup["status"]) {
  return status === "complete" ? "备份完成" : status === "running" ? "正在备份" : "备份失败";
}

const backupColumns: ColumnDef<Backup>[] = [
  {
    accessorKey: "date",
    header: "执行时间",
    enableSorting: true,
    meta: { width: "34%", rowHeader: true, className: "ap-mono" },
  },
  {
    accessorKey: "status",
    header: "状态",
    enableSorting: true,
    meta: { width: "22%" },
    cell: ({ row }) => (
      <span className={row.original.status === "complete" ? "ap-status is-success" : "ap-status"}>
        {row.original.status === "complete" ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
        {backupStatus(row.original.status)}
      </span>
    ),
  },
  {
    accessorKey: "bytes",
    header: "文件大小",
    enableSorting: true,
    meta: { width: "20%", className: "ap-mono" },
    cell: ({ row }) => (row.original.bytes / 1024 / 1024).toFixed(2) + " MiB",
  },
  {
    id: "details",
    header: "校验信息",
    meta: { width: "24%" },
    cell: ({ row, table }) => (
      <Button
        variant="ghost"
        size="compact"
        disabled={table.options.meta?.disableActions}
        onClick={() => table.options.meta?.editRow?.(row.original)}
      >
        查看详情 <ArrowRight size={15} />
      </Button>
    ),
  },
];

function BackupsPreview({ notify }: { notify: Notify }) {
  const [records, setRecords] = useState(exampleBackups);
  const [automatic, setAutomatic] = useState(true);
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<Backup | null>(null);
  const detailTrigger = useRef<HTMLElement | null>(null);
  const tableState = useDataTableState();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function makeBackup() {
    if (pending || refreshing) return;
    setPending(true);
    const id = crypto.randomUUID();
    // 固定两位日期，保持示例记录的展示与字符串排序一致。
    const date = new Date().toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    tableState.setPage(1);
    setRecords((current) => [{ id, date, bytes: 3846144, status: "running", sha: "" }, ...current]);
    timer.current = setTimeout(() => {
      setRecords((current) =>
        current.map((row) =>
          row.id === id ? { ...row, status: "complete", sha: exampleBackups[0].sha } : row,
        ),
      );
      setPending(false);
      notify("预览备份已完成，仅添加示例记录。");
    }, 1000);
  }
  function refresh() {
    if (pending || refreshing) return;
    setRefreshing(true);
    timer.current = setTimeout(() => {
      setRefreshing(false);
      notify("示例备份记录已刷新。");
    }, 650);
  }
  function openDetails(item: Backup) {
    detailTrigger.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDetail(item);
  }
  const latest = records[0];
  return (
    <div className="admin-data-page">
      <PageHeading title="备份管理" description="查看数据库备份记录、执行备份与配置自动备份。">
        <Button
          size="compact"
          variant="primary"
          disabled={pending || refreshing}
          onClick={makeBackup}
        >
          <Database size={16} />
          {pending ? "正在执行…" : "立即备份数据库"}
        </Button>
      </PageHeading>
      <div className="ap-backup-layout">
        <Card className="ap-backup-latest">
          <div className="ap-latest-heading">
            <h2 className="ap-section-title">最近一次备份</h2>
            <span className={latest.status === "complete" ? "ap-status is-success" : "ap-status"}>
              {latest.status === "complete" ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
              {backupStatus(latest.status)}
            </span>
          </div>
          <div className="ap-latest-facts">
            <div>
              <span className="ap-muted">执行时间（北京时间）</span>
              <strong>{latest.date}</strong>
            </div>
            <div>
              <span className="ap-muted">文件大小</span>
              <strong>
                {(latest.bytes / 1024 / 1024).toFixed(2)}
                <small>MiB</small>
              </strong>
            </div>
          </div>
          <div className="ap-latest-reference">
            <div>
              <span className="ap-muted">备份编号</span>
              <code>{latest.id}</code>
            </div>
            <Button
              size="compact"
              variant="ghost"
              disabled={pending}
              onClick={() => openDetails(latest)}
            >
              校验详情 <ArrowRight size={15} />
            </Button>
          </div>
        </Card>
        <Card className="ap-backup-automation">
          <div className="ap-latest-heading">
            <h2 className="ap-section-title">自动备份</h2>
            <span className="ap-muted">{automatic ? "已开启" : "已关闭"}</span>
          </div>
          <div className="ap-backup-switch-row">
            <label htmlFor="preview-auto-backup">每日自动备份数据库</label>
            <Switch
              id="preview-auto-backup"
              touchTarget
              checked={automatic}
              disabled={pending}
              onCheckedChange={(value) => {
                setAutomatic(value);
                notify(value ? "预览：已启用每日数据库备份。" : "预览：已关闭每日数据库备份。");
              }}
            />
          </div>
          <p className="ap-muted">自动备份由服务器定时任务执行。</p>
          <div className="ap-last-schedule">
            <span className="ap-muted">最近调度</span>
            <time dateTime="2026-10-15T18:00:03Z">2026/10/16 02:00:03</time>
          </div>
        </Card>
        <section className="admin-data-workspace ap-backup-history" aria-label="数据库备份记录">
          <div className="ap-record-heading">
            <div className="ap-heading-with-count">
              <h2 className="ap-section-title">执行记录</h2>
              <span className="ap-count">{records.length}</span>
            </div>
            <Button
              variant="ghost"
              size="compact"
              disabled={pending || refreshing}
              onClick={refresh}
            >
              <RefreshCw size={15} />
              {refreshing ? "正在刷新…" : "刷新备份记录"}
            </Button>
          </div>
          <DataTable
            data={records}
            columns={backupColumns}
            getRowId={(item) => item.id}
            {...tableState}
            meta={{ editRow: openDetails, disableActions: pending || refreshing }}
            loading={refreshing}
            disabled={pending || refreshing}
            caption="示例备份执行记录"
            tableClassName="ap-backup-table"
            emptyState={
              <div className="ap-empty">
                <h2>暂无备份记录</h2>
                <p>执行一次数据库备份后，记录会显示在这里。</p>
              </div>
            }
          />
        </section>
        <Card className="ap-backup-scope">
          <h2 className="ap-section-title">备份与恢复</h2>
          <div>
            <h3>数据库内容</h3>
            <p>包含文章、设置、会话及媒体元数据。</p>
          </div>
          <div>
            <h3>OSS 文件</h3>
            <p>文件本体不在数据库备份中。</p>
          </div>
          <div>
            <h3>恢复影响</h3>
            <p>备份保存在服务器。恢复时会撤销全部登录会话。</p>
          </div>
        </Card>
      </div>
      <Modal
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
        title="备份校验详情"
        description="保留完整备份标识、文件大小与校验摘要。"
        finalFocus={detailTrigger}
      >
        {detail && (
          <dl className="ap-backup-detail">
            <div>
              <dt>执行时间</dt>
              <dd>{detail.date}</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>{backupStatus(detail.status)}</dd>
            </div>
            <div>
              <dt>文件大小</dt>
              <dd>{detail.bytes.toLocaleString("zh-CN")} 字节</dd>
            </div>
            <div>
              <dt>备份编号</dt>
              <dd>{detail.id}</dd>
            </div>
            <div>
              <dt>SHA-256</dt>
              <dd>{detail.sha || "执行完成后生成"}</dd>
            </div>
          </dl>
        )}
        <div className="ap-dialog-actions">
          <Button onClick={() => setDetail(null)}>关闭</Button>
        </div>
      </Modal>
    </div>
  );
}

type Post = {
  id: string;
  title: string;
  summary: string;
  tag: string;
  category: string;
  status: "published" | "draft";
  featured: boolean;
  date: string;
};
const examplePosts: Post[] = [
  {
    id: "p1",
    title: "用 SQLite 整理个人网站的数据",
    summary: "从连接配置到备份恢复，记录个人站点数据库维护的实践。",
    tag: "SQLite",
    category: "后端与数据库",
    status: "published",
    featured: true,
    date: "2026-10-15",
  },
  {
    id: "p2",
    title: "给博客建立一套统一的设计规范",
    summary: "整理色彩、排版与组件状态，让每个页面保持一致。",
    tag: "设计系统",
    category: "创意设计",
    status: "published",
    featured: true,
    date: "2026-10-12",
  },
  {
    id: "p3",
    title: "从命令行到自动化：我的部署笔记",
    summary: "记录构建、上传和服务检查的常用命令与注意事项。",
    tag: "自动化部署",
    category: "部署运维",
    status: "published",
    featured: false,
    date: "2026-10-09",
  },
  {
    id: "p4",
    title: "浏览器中的图片尺寸与视频时长",
    summary: "在上传前读取媒体信息，及时发现格式和尺寸问题。",
    tag: "JavaScript",
    category: "Web 前端",
    status: "draft",
    featured: false,
    date: "2026-10-07",
  },
  {
    id: "p5",
    title: "保留阅读时的思路",
    summary: "关于做笔记、摘录以及重新找到旧想法的一些方法。",
    tag: "阅读",
    category: "生活记录",
    status: "published",
    featured: false,
    date: "2026-10-03",
  },
  {
    id: "p6",
    title: "减少界面中的无效提示",
    summary: "把解释放在用户需要的位置，保留清晰的操作反馈。",
    tag: "交互设计",
    category: "创意设计",
    status: "draft",
    featured: false,
    date: "2026-09-29",
  },
  {
    id: "p7",
    title: "在终端里检查服务器的运行状态",
    summary: "几条用来定位端口、进程和服务响应的日常命令。",
    tag: "Linux",
    category: "部署运维",
    status: "published",
    featured: false,
    date: "2026-09-25",
  },
  {
    id: "p8",
    title: "一个适合长期维护的个人网站",
    summary: "整理内容、媒体和公开资料之间的关系。",
    tag: "个人网站",
    category: "Web 前端",
    status: "published",
    featured: true,
    date: "2026-09-20",
  },
  {
    id: "p9",
    title: "小范围试验，再决定是否推广",
    summary: "用独立预览降低改动成本，留下可以核对的记录。",
    tag: "开发工具",
    category: "创意设计",
    status: "published",
    featured: false,
    date: "2026-09-16",
  },
];

const postColumns: ColumnDef<Post>[] = [
  {
    accessorKey: "title",
    header: "文章标题",
    enableSorting: true,
    meta: { width: "38%", rowHeader: true },
    cell: ({ row, table }) => (
      <div className="ap-post-identity">
        <button
          className="ap-title-link"
          onClick={() => table.options.meta?.editRow?.(row.original)}
        >
          {row.original.title}
        </button>
        <p title={row.original.summary}>{row.original.summary}</p>
        <span>#{row.original.tag}</span>
      </div>
    ),
  },
  { accessorKey: "category", header: "分类", enableSorting: true, meta: { width: "12%" } },
  {
    accessorKey: "status",
    header: "状态",
    enableSorting: true,
    meta: { width: "10%" },
    cell: ({ row }) => (
      <span className={row.original.status === "published" ? "ap-status is-success" : "ap-status"}>
        {row.original.status === "published" && <Check size={13} />}
        {row.original.status === "published" ? "已发布" : "草稿"}
      </span>
    ),
  },
  {
    accessorKey: "featured",
    header: "精选",
    meta: { width: "12%" },
    cell: ({ row }) => (row.original.featured ? "精选" : "未精选"),
  },
  {
    accessorKey: "date",
    header: "时间",
    enableSorting: true,
    meta: { width: "18%", className: "ap-mono" },
  },
  {
    id: "actions",
    header: "操作",
    meta: { width: "10%" },
    cell: AdminRowActionsCell,
  },
];

function PostsPreview({ notify, onEdit }: { notify: Notify; onEdit: () => void }) {
  const wide = useCollectionSidebar();
  const [posts, setPosts] = useState(examplePosts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [deleting, setDeleting] = useState<Post | null>(null);
  const deleteTrigger = useRef<HTMLElement | null>(null);
  const search = useRef<HTMLDivElement | null>(null);
  const state = useDataTableState();
  const filtered = posts.filter(
    (post) =>
      (status === "all" || post.status === status) &&
      (category === "all" || post.category === category) &&
      (featured === "all" || post.featured === (featured === "yes")) &&
      (post.title + post.summary + post.tag + post.category).includes(query),
  );

  const getPostActions: NonNullable<TableMeta<Post>["getRowActions"]> = (post) => ({
    label: `文章 ${post.title} 的操作`,
    actions: [
      { label: "编辑文章", icon: <Pencil size={15} />, onSelect: onEdit },
      {
        label: post.featured ? "取消精选" : "设为精选",
        icon: <CheckCircle2 size={15} />,
        onSelect: () => {
          setPosts((current) =>
            current.map((item) =>
              item.id === post.id ? { ...item, featured: !item.featured } : item,
            ),
          );
          notify("预览精选状态已更新。");
        },
      },
      {
        label: "删除文章",
        icon: <Trash2 size={15} />,
        destructive: true,
        opensDialog: true,
        onSelect: (target) => {
          deleteTrigger.current = target;
          setDeleting(post);
        },
      },
    ],
  });
  return (
    <div className="admin-data-page">
      <PageHeading title="文章管理" description="管理文章与草稿。">
        <Button size="compact" variant="primary" onClick={onEdit}>
          <Plus size={16} />
          新建文章
        </Button>
      </PageHeading>
      <section className="admin-data-workspace ap-posts" ref={search} aria-label="文章工作区">
        <Tabs
          className="ap-collection-layout"
          orientation={wide ? "vertical" : "horizontal"}
          value={status}
          onValueChange={(value) => {
            setStatus(String(value));
            state.setPage(1);
          }}
        >
          <div className="ap-task-navigation">
            <h2>文章状态</h2>
            <div className="ap-tabs-scroll">
              <TabsList size="compact" className="ap-task-tabs" aria-label="按文章状态筛选">
                <TabsTrigger value="all">
                  <FileText size={16} />
                  <span>全部文章</span>
                  <span className="ap-task-count">{posts.length}</span>
                </TabsTrigger>
                <TabsTrigger value="published">
                  <CheckCircle2 size={16} />
                  <span>已发布</span>
                  <span className="ap-task-count">
                    {posts.filter((post) => post.status === "published").length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="draft">
                  <Pencil size={16} />
                  <span>草稿箱</span>
                  <span className="ap-task-count">
                    {posts.filter((post) => post.status === "draft").length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <div className="ap-collection-main">
            <div className="ap-toolbar ap-post-toolbar">
              <SearchBox
                label="搜索标题、摘要、标签或分类"
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  state.setPage(1);
                }}
              />
              <div className="ap-filter-group">
                <Filter
                  label="按分类筛选"
                  value={category}
                  onChange={(value) => {
                    setCategory(value);
                    state.setPage(1);
                  }}
                  options={[
                    ["all", "全部分类"],
                    ...[...new Set(posts.map((post) => post.category))].map(
                      (value): [string, string] => [value, value],
                    ),
                  ]}
                />
                <Filter
                  label="按精选筛选"
                  value={featured}
                  onChange={(value) => {
                    setFeatured(value);
                    state.setPage(1);
                  }}
                  options={[
                    ["all", "全部精选状态"],
                    ["yes", "仅精选"],
                    ["no", "未精选"],
                  ]}
                />
              </div>
            </div>
            <div className="ap-collection-heading">
              <h2>
                {status === "draft" ? "草稿箱" : status === "published" ? "已发布文章" : "全部文章"}
              </h2>
              <span>{filtered.length} 篇文章</span>
            </div>
            <TabsPanel value={status} className="ap-table-panel">
              <DataTable
                data={filtered}
                columns={postColumns}
                meta={{
                  editRow: onEdit,
                  getRowActions: getPostActions,
                }}
                getRowId={(row) => row.id}
                {...state}
                caption="示例文章列表"
                tableClassName="admin-post-table"
                emptyState={
                  <div className="ap-empty">
                    <h2>没有找到文章</h2>
                    <p>试试其他关键词，或清除当前筛选。</p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setQuery("");
                        setCategory("all");
                        setFeatured("all");
                        setStatus("all");
                      }}
                    >
                      清除筛选
                    </Button>
                  </div>
                }
              />
            </TabsPanel>
          </div>
        </Tabs>
      </section>
      <Modal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="删除文章"
        description={"确定删除「" + (deleting?.title ?? "") + "」？此操作仅影响预览中的示例数据。"}
        finalFocus={deleteTrigger}
        fallbackFocus={() => search.current?.querySelector("input") ?? null}
      >
        <div className="ap-dialog-actions">
          <Button onClick={() => setDeleting(null)}>取消</Button>
          <Button
            variant="primary"
            onClick={() => {
              setPosts((current) => current.filter((post) => post.id !== deleting?.id));
              setDeleting(null);
              deleteTrigger.current = search.current?.querySelector("input") ?? null;
              notify("已删除示例文章。");
            }}
          >
            确认删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}

type Friend = {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  approved: boolean;
  enabled: boolean;
};
const exampleFriends: Friend[] = [
  {
    id: "f1",
    name: "木棉手记",
    url: "https://mumian.example.com",
    description: "记录日常观察，分享摄影、阅读与生活。",
    category: "生活记录",
    approved: true,
    enabled: true,
  },
  {
    id: "f2",
    name: "林间代码",
    url: "https://linjian.example.com",
    description: "关于前端开发、工具探索与开源项目。",
    category: "技术博客",
    approved: true,
    enabled: true,
  },
  {
    id: "f3",
    name: "慢慢设计",
    url: "https://manman.example.com",
    description: "整理设计过程，留下构思与练习。",
    category: "创意设计",
    approved: false,
    enabled: false,
  },
  {
    id: "f4",
    name: "晚晴笔记",
    url: "https://wanqing.example.com",
    description: "把读过的书和走过的路记下来。",
    category: "生活记录",
    approved: true,
    enabled: false,
  },
];

const friendColumns: ColumnDef<Friend>[] = [
  {
    accessorKey: "name",
    header: "博客名称 / 地址",
    enableSorting: true,
    meta: { width: "32%", rowHeader: true },
    cell: ({ row }) => (
      <div className="ap-friend-identity">
        <span className="ap-friend-icon">
          <Link2 size={18} />
        </span>
        <div>
          <strong>{row.original.name}</strong>
          <span className="ap-site-url">{row.original.url}</span>
        </div>
      </div>
    ),
  },
  { accessorKey: "description", header: "站点描述", meta: { width: "34%" } },
  { accessorKey: "category", header: "分类", enableSorting: true, meta: { width: "12%" } },
  {
    accessorKey: "approved",
    header: "审核 / 展示",
    enableSorting: true,
    meta: { width: "14%" },
    cell: ({ row }) => (
      <div className="ap-friend-status">
        <span className={row.original.approved ? "ap-status is-success" : "ap-status"}>
          {row.original.approved ? <Check size={13} /> : <Clock3 size={13} />}
          {row.original.approved ? "已通过" : "待审核"}
        </span>
        <span className="ap-muted">{row.original.enabled ? "展示启用" : "展示停用"}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "操作",
    meta: { width: "8%" },
    cell: AdminRowActionsCell,
  },
];

function FriendsPreview({ notify }: { notify: Notify }) {
  const wide = useCollectionSidebar();
  const [items, setItems] = useState(exampleFriends);
  const [category, setCategory] = useState("all");
  const [review, setReview] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Friend | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [deleting, setDeleting] = useState<Friend | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const tableState = useDataTableState();
  const workspace = useRef<HTMLElement>(null);
  const filtered = items.filter(
    (item) =>
      (category === "all" || category === item.category) &&
      (review === "all" || item.approved === (review === "approved")) &&
      (visibility === "all" || item.enabled === (visibility === "yes")) &&
      (item.name + item.url + item.description).includes(query),
  );
  function edit(item: Friend | null, target: HTMLElement | null = null) {
    trigger.current = target;
    setInvalid(false);
    setEditing(
      item ?? {
        id: crypto.randomUUID(),
        name: "",
        url: "",
        description: "",
        category: "技术博客",
        approved: true,
        enabled: true,
      },
    );
  }

  const getFriendActions: NonNullable<TableMeta<Friend>["getRowActions"]> = (friend) => ({
    label: `友链 ${friend.name} 的操作`,
    actions: [
      {
        label: "编辑友链",
        icon: <Pencil size={15} />,
        opensDialog: true,
        onSelect: (target) => edit(friend, target),
      },
      {
        label: friend.approved ? "设为待审核" : "通过审核",
        icon: <Check size={15} />,
        onSelect: () => {
          setItems((current) =>
            current.map((item) =>
              item.id === friend.id ? { ...item, approved: !item.approved } : item,
            ),
          );
          // 当前审核视图会移除这条记录，等 DOM 更新后回到仍可用的搜索入口。
          if (review !== "all") {
            requestAnimationFrame(() => workspace.current?.querySelector("input")?.focus());
          }
          notify("预览审核状态已更新。");
        },
      },
      {
        label: "删除友链",
        icon: <Trash2 size={15} />,
        destructive: true,
        opensDialog: true,
        onSelect: (target) => {
          trigger.current = target;
          setDeleting(friend);
        },
      },
    ],
  });
  return (
    <div className="admin-data-page">
      <PageHeading title="友情链接管理" description="管理站点资料、审核与展示状态。">
        <Button
          size="compact"
          variant="primary"
          onClick={(event) => edit(null, event.currentTarget)}
        >
          <Plus size={16} />
          新增友链
        </Button>
      </PageHeading>
      <section className="admin-data-workspace ap-friends" ref={workspace} aria-label="友链工作区">
        <Tabs
          className="ap-collection-layout"
          orientation={wide ? "vertical" : "horizontal"}
          value={review}
          onValueChange={(value) => {
            setReview(String(value));
            tableState.setPage(1);
          }}
        >
          <div className="ap-task-navigation">
            <h2>审核状态</h2>
            <div className="ap-tabs-scroll">
              <TabsList size="compact" className="ap-task-tabs" aria-label="筛选审核状态">
                <TabsTrigger value="all">
                  <Link2 size={16} />
                  <span>全部友链</span>
                  <span className="ap-task-count">{items.length}</span>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  <Clock3 size={16} />
                  <span>待审核</span>
                  <span className="ap-task-count">
                    {items.filter((item) => !item.approved).length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  <CheckCircle2 size={16} />
                  <span>已通过</span>
                  <span className="ap-task-count">
                    {items.filter((item) => item.approved).length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <div className="ap-collection-main">
            <div className="ap-toolbar">
              <SearchBox
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  tableState.setPage(1);
                }}
                label="搜索名称、地址或描述"
              />
              <div className="ap-filter-group">
                <Filter
                  label="筛选友链分类"
                  value={category}
                  onChange={(value) => {
                    setCategory(value);
                    tableState.setPage(1);
                  }}
                  options={[
                    ["all", "全部分类"],
                    ["技术博客", "技术博客"],
                    ["创意设计", "创意设计"],
                    ["生活记录", "生活记录"],
                  ]}
                />
                <Filter
                  label="筛选展示状态"
                  value={visibility}
                  onChange={(value) => {
                    setVisibility(value);
                    tableState.setPage(1);
                  }}
                  options={[
                    ["all", "全部展示状态"],
                    ["yes", "展示启用"],
                    ["no", "展示停用"],
                  ]}
                />
                <Button size="compact" variant="ghost" onClick={() => notify("示例友链已刷新。")}>
                  <RefreshCw size={15} />
                  刷新列表
                </Button>
              </div>
            </div>
            <div className="ap-collection-heading">
              <h2>
                {review === "pending"
                  ? "待审核友链"
                  : review === "approved"
                    ? "已通过友链"
                    : "全部友链"}
              </h2>
              <span>{filtered.length} 个站点</span>
            </div>
            <TabsPanel value={review} className="ap-table-panel">
              <DataTable
                data={filtered}
                columns={friendColumns}
                meta={{
                  getRowActions: getFriendActions,
                }}
                getRowId={(item) => item.id}
                {...tableState}
                caption="示例友情链接列表"
                tableClassName="admin-post-table ap-friend-table"
                emptyState={
                  <div className="ap-empty">
                    <h2>没有找到友链</h2>
                    <p>调整筛选条件后再试。</p>
                    <Button
                      onClick={() => {
                        setQuery("");
                        setReview("all");
                        setCategory("all");
                        setVisibility("all");
                      }}
                    >
                      清除筛选
                    </Button>
                  </div>
                }
              />
            </TabsPanel>
          </div>
        </Tabs>
      </section>
      <p className="ap-muted">前台仅展示审核通过且已启用的友链。</p>
      <Modal
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title={items.some((item) => item.id === editing?.id) ? "编辑友链" : "新增友链"}
        finalFocus={trigger}
        fallbackFocus={() => workspace.current?.querySelector("input") ?? null}
        description="编辑站点资料及展示状态。"
      >
        {editing && (
          <form
            className="ap-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!editing.name.trim() || !editing.url.startsWith("https://")) {
                setInvalid(true);
                return;
              }
              setItems((current) =>
                current.some((item) => item.id === editing.id)
                  ? current.map((item) => (item.id === editing.id ? editing : item))
                  : [...current, editing],
              );
              setEditing(null);
              notify("示例友链已保存。");
            }}
          >
            <label className="ap-field" htmlFor="ap-friend-name">
              博客名称
              <Input
                id="ap-friend-name"
                value={editing.name}
                aria-invalid={invalid && !editing.name.trim()}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
              />
            </label>
            <label className="ap-field" htmlFor="ap-friend-url">
              网站地址
              <Input
                id="ap-friend-url"
                value={editing.url}
                aria-invalid={invalid && !editing.url.startsWith("https://")}
                aria-describedby="friend-url-help"
                onChange={(event) => setEditing({ ...editing, url: event.target.value })}
              />
              <span id="friend-url-help" className={invalid ? "ap-error" : "ap-muted"}>
                {invalid ? "请填写名称与有效的 HTTPS 地址。" : "使用 https:// 开头的完整地址。"}
              </span>
            </label>
            <label className="ap-field" htmlFor="ap-friend-description">
              站点描述
              <Input
                id="ap-friend-description"
                value={editing.description}
                onChange={(event) => setEditing({ ...editing, description: event.target.value })}
              />
            </label>
            <div className="ap-inline-switch">
              <label htmlFor="friend-display">启用展示</label>
              <Switch
                id="friend-display"
                touchTarget
                checked={editing.enabled}
                onCheckedChange={(enabled) => setEditing({ ...editing, enabled })}
              />
            </div>
            <div className="ap-dialog-actions">
              <Button onClick={() => setEditing(null)}>取消</Button>
              <Button type="submit" variant="primary">
                保存友链
              </Button>
            </div>
          </form>
        )}
      </Modal>
      <Modal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="删除友链"
        description={"确定从预览移除「" + (deleting?.name ?? "") + "」？"}
        finalFocus={trigger}
        fallbackFocus={() => workspace.current?.querySelector("input") ?? null}
      >
        <div className="ap-dialog-actions">
          <Button onClick={() => setDeleting(null)}>取消</Button>
          <Button
            variant="primary"
            onClick={() => {
              setItems((current) => current.filter((item) => item.id !== deleting?.id));
              setDeleting(null);
              notify("已移除示例友链。");
            }}
          >
            确认删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const demoNotifications = [
  { title: "数据库备份已完成", detail: "2026/10/16 02:00:03", read: false },
  { title: "有一条友情链接等待审核", detail: "2026/10/15 16:24:08", read: false },
  { title: "站点资料已更新", detail: "2026/10/14 10:18:42", read: true },
];

function App() {
  const [page, setPage] = useState<Page>(() => {
    const initial = location.hash.slice(1);
    return isPage(initial) ? initial : "backups";
  });
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("fuxiaochen-admin-preview-theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  const [pendingNavigation, setPendingNavigation] = useState<Page | null>(null);
  const [discardVersions, setDiscardVersions] = useState({ settings: 0, editor: 0 });
  const dirtyPages = useRef({ settings: false, editor: false });
  const navigationTrigger = useRef<HTMLElement | null>(null);
  const main = useRef<HTMLElement>(null);
  const settingsDirty = useCallback((dirty: boolean) => {
    dirtyPages.current.settings = dirty;
  }, []);
  const editorDirty = useCallback((dirty: boolean) => {
    dirtyPages.current.editor = dirty;
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState<"notifications" | "profile" | "about" | null>(null);
  const [notice, setNotice] = useState("");
  const [notifications, setNotifications] = useState(demoNotifications);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [keyDeleted, setKeyDeleted] = useState(false);
  const [confirmKey, setConfirmKey] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileButton = useRef<HTMLButtonElement | null>(null);
  const pendingPanel = useRef<"notifications" | "profile" | null>(null);
  const panelTrigger = useRef<HTMLElement | null>(null);
  const unread = notifications.filter((item) => !item.read).length;
  const notify = useCallback(
    (message: string) => {
      setNotice(message);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setNotice(""), 4000);
    },
    [setNotice],
  );
  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("fuxiaochen-admin-preview-theme", theme);
    } catch {
      /* 私密窗口或文件协议限制存储时仍保留当前会话主题。 */
    }
  }, [theme]);
  const commitNavigation = useCallback(
    (next: Page) => {
      setPage(next);
      history.replaceState(null, "", "#" + next);
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [setPage, setMobileOpen],
  );
  function navigate(next: Page) {
    if (next === page) {
      setMobileOpen(false);
      return;
    }
    if ((page === "settings" || page === "editor") && dirtyPages.current[page]) {
      navigationTrigger.current = mobileOpen
        ? mobileButton.current
        : document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setPendingNavigation(next);
      setMobileOpen(false);
      return;
    }
    commitNavigation(next);
  }
  function openUtility(next: "notifications" | "profile", mobile: boolean, trigger: HTMLElement) {
    if (mobile) {
      pendingPanel.current = next;
      panelTrigger.current = mobileButton.current;
      setMobileOpen(false);
    } else {
      panelTrigger.current = trigger;
      setPanel(next);
    }
  }
  const utilities = (mobile: boolean) => {
    const themeLabel = theme === "dark" ? "切换到浅色模式" : "切换到深色模式";
    const toggle = (
      <Button
        size="compact"
        variant="ghost"
        className="admin-utility-button"
        aria-label={themeLabel}
        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        {mobile && <span>{themeLabel}</span>}
      </Button>
    );
    const notification = (
      <Button
        size="compact"
        variant="ghost"
        className="admin-utility-button"
        aria-label={"通知，" + unread + " 条未读"}
        aria-haspopup="dialog"
        onClick={(event) => openUtility("notifications", mobile, event.currentTarget)}
      >
        <Bell size={20} />
        {mobile && <span>通知</span>}
        {unread > 0 && (
          <span className="admin-notification-count" aria-hidden="true">
            {unread}
          </span>
        )}
      </Button>
    );
    const profile = (
      <Button
        size="compact"
        variant="ghost"
        className="admin-utility-button admin-profile"
        aria-label="账户菜单"
        aria-haspopup="dialog"
        onClick={(event) => openUtility("profile", mobile, event.currentTarget)}
      >
        <Avatar size={28} />
        {mobile && <span>管理账户</span>}
      </Button>
    );
    return (
      <div className="admin-utility-actions">
        {mobile ? toggle : <Hint label={themeLabel}>{toggle}</Hint>}
        {mobile ? notification : <Hint label={"通知，" + unread + " 条未读"}>{notification}</Hint>}
        {mobile ? profile : <Hint label="管理账户">{profile}</Hint>}
      </div>
    );
  };
  const sidebar = (mobile: boolean) => (
    <div className="admin-sidebar-inner">
      <div className="ap-dock-navigation">
        <div className="admin-brand">
          {mobile ? (
            <BrandLogo />
          ) : (
            <Hint label="前往网站首页">
              <Button
                className="ap-dock-home"
                variant="ghost"
                aria-label="前往网站首页"
                onClick={() => notify("这是离线后台预览，网站首页未包含在本文件中。")}
              >
                <BrandLogo />
              </Button>
            </Hint>
          )}
          {mobile && (
            <>
              <span className="admin-brand-name">
                付小晨<small>管理空间</small>
              </span>
              <Button
                size="compact"
                variant="ghost"
                className="admin-mobile-close"
                aria-label="关闭导航"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </Button>
            </>
          )}
        </div>
        <nav className="admin-nav" aria-label="管理导航">
          {navigation.map((group) => (
            <div className="admin-nav-group" key={group.group}>
              <p className={mobile ? "admin-nav-group-label" : "sr-only"}>{group.group}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const link = (
                  <a
                    href={"#" + item.page}
                    className={
                      "admin-nav-item" +
                      (page === item.page || (item.page === "posts" && page === "editor")
                        ? " is-active"
                        : "")
                    }
                    aria-label={item.name}
                    aria-current={
                      page === item.page || (item.page === "posts" && page === "editor")
                        ? "page"
                        : undefined
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(item.page);
                    }}
                  >
                    <Icon size={mobile ? 18 : 20} strokeWidth={1.8} aria-hidden="true" />
                    <span className={mobile ? undefined : "ap-dock-label"} aria-hidden={!mobile}>
                      {mobile
                        ? item.name
                        : {
                            posts: "文章",
                            categories: "分类",
                            changelog: "日志",
                            friends: "友链",
                            settings: "设置",
                            backups: "备份",
                          }[item.page]}
                    </span>
                  </a>
                );
                return mobile ? (
                  <span key={item.page}>{link}</span>
                ) : (
                  <Hint key={item.page} label={item.name}>
                    {link}
                  </Hint>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
      <div className="admin-sidebar-bottom">
        {mobile ? (
          <Button
            size="compact"
            variant="ghost"
            onClick={() => notify("这是离线后台预览，网站首页未包含在本文件中。")}
          >
            <Globe2 size={18} />
            前往网站首页
          </Button>
        ) : null}
        {utilities(mobile)}
      </div>
    </div>
  );
  return (
    <MotionProvider>
      <TooltipProvider delay={250}>
        <div className="admin-layout ap-preview">
          <aside className="admin-sidebar" aria-label="侧边栏">
            {sidebar(false)}
          </aside>
          <div className="admin-main-column">
            <main className="admin-content" ref={main} tabIndex={-1}>
              <div hidden={page !== "backups"}>
                <BackupsPreview notify={notify} />
              </div>
              <div hidden={page !== "posts"}>
                <PostsPreview notify={notify} onEdit={() => navigate("editor")} />
              </div>
              <div hidden={page !== "friends"}>
                <FriendsPreview notify={notify} />
              </div>
              <div hidden={page !== "categories"}>
                <CategoriesPreview notify={notify} />
              </div>
              <div hidden={page !== "changelog"}>
                <ChangelogPreview notify={notify} />
              </div>
              <div hidden={page !== "settings"}>
                <SettingsPreview
                  notify={notify}
                  onDirtyChange={settingsDirty}
                  discardVersion={discardVersions.settings}
                />
              </div>
              <div hidden={page !== "editor"}>
                <EditorPreview
                  notify={notify}
                  onBack={() => navigate("posts")}
                  active={page === "editor"}
                  onDirtyChange={editorDirty}
                  discardVersion={discardVersions.editor}
                />
              </div>
            </main>
            <footer className="admin-footer">
              <span>© 付小晨</span>
              <button
                className="ap-preview-note"
                onClick={(event) => {
                  panelTrigger.current = event.currentTarget;
                  setPanel("about");
                }}
              >
                交互预览 · 示例数据
              </button>
            </footer>
          </div>
          <Button
            ref={mobileButton}
            className="admin-menu-button"
            variant="secondary"
            aria-label="打开管理导航"
            aria-haspopup="dialog"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon size={20} />
          </Button>
          <Dialog
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            onOpenChangeComplete={(open) => {
              if (!open && pendingPanel.current) {
                setPanel(pendingPanel.current);
                pendingPanel.current = null;
              }
            }}
          >
            <DialogContent className="ap-mobile-dialog" finalFocus={mobileButton}>
              <DialogTitle className="sr-only">管理导航</DialogTitle>
              {sidebar(true)}
            </DialogContent>
          </Dialog>
          <Modal
            open={pendingNavigation !== null}
            onOpenChange={(open) => {
              if (!open) setPendingNavigation(null);
            }}
            title="离开当前页面"
            description="当前页面有未保存的预览修改。放弃后将恢复本次预览中已保存的内容。"
            finalFocus={navigationTrigger}
            fallbackFocus={() => main.current}
          >
            <div className="ap-dialog-actions">
              <Button onClick={() => setPendingNavigation(null)}>继续编辑</Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (pendingNavigation === null) return;
                  if (page === "settings" || page === "editor") {
                    dirtyPages.current[page] = false;
                    setDiscardVersions((current) => ({ ...current, [page]: current[page] + 1 }));
                  }
                  const next = pendingNavigation;
                  setPendingNavigation(null);
                  commitNavigation(next);
                }}
              >
                放弃修改并离开
              </Button>
            </div>
          </Modal>
          <Modal
            open={panel === "notifications"}
            onOpenChange={(open) => !open && setPanel(null)}
            title="通知"
            description="查看站点操作与内容更新。"
            finalFocus={panelTrigger}
          >
            <div className="ap-notification-toolbar">
              <Button
                size="compact"
                variant={unreadOnly ? "ghost" : "secondary"}
                aria-pressed={!unreadOnly}
                onClick={() => setUnreadOnly(false)}
              >
                全部
              </Button>
              <Button
                size="compact"
                variant={unreadOnly ? "secondary" : "ghost"}
                aria-pressed={unreadOnly}
                onClick={() => setUnreadOnly(true)}
              >
                未读
              </Button>
              <Button
                size="compact"
                variant="ghost"
                disabled={!unread}
                onClick={() => {
                  setNotifications((current) => current.map((item) => ({ ...item, read: true })));
                  notify("示例通知已标记为已读。");
                }}
              >
                本页全部已读
              </Button>
            </div>
            <ul className="ap-notifications">
              {notifications
                .filter((item) => !unreadOnly || !item.read)
                .map((item) => (
                  <li key={item.title}>
                    <div>
                      <strong>{item.title}</strong>
                      <span className="ap-muted">{item.detail}</span>
                    </div>
                    <span className={item.read ? "ap-muted" : "ap-focus-text"}>
                      {item.read ? "已读" : "未读"}
                    </span>
                  </li>
                ))}
            </ul>
            {unreadOnly && !unread && (
              <p className="ap-muted ap-notification-empty">暂无未读通知。</p>
            )}
            <div className="ap-pagination">
              <span>1 / 1 · 共 {unreadOnly ? unread : notifications.length} 条</span>
              <Button size="compact" variant="ghost" disabled>
                上一页
              </Button>
              <Button size="compact" variant="ghost" disabled>
                下一页
              </Button>
            </div>
          </Modal>
          <Modal
            open={panel === "profile"}
            onOpenChange={(open) => !open && setPanel(null)}
            title="管理账户"
            description="管理当前账户与通行密钥。"
            finalFocus={panelTrigger}
          >
            <div className="ap-profile">
              <Avatar size={48} />
              <div>
                <strong>付小晨</strong>
                <span className="ap-muted">管理员</span>
              </div>
            </div>
            <section className="ap-passkeys">
              <h3 className="ap-section-title">通行密钥</h3>
              <p className="ap-muted">使用设备上的通行密钥登录。</p>
              {!keyDeleted && (
                <div className="ap-key-row">
                  <KeyRound size={18} />
                  <div>
                    <strong>日常使用的设备</strong>
                    <span className="ap-muted">添加于 2026/10/12</span>
                  </div>
                  <Button size="compact" variant="ghost" onClick={() => setConfirmKey(true)}>
                    删除
                  </Button>
                </div>
              )}
              {confirmKey && !keyDeleted && (
                <div className="ap-inline-confirm">
                  <p>从预览中移除此通行密钥？</p>
                  <div className="ap-dialog-actions">
                    <Button size="compact" onClick={() => setConfirmKey(false)}>
                      取消
                    </Button>
                    <Button
                      size="compact"
                      onClick={() => {
                        setKeyDeleted(true);
                        setConfirmKey(false);
                        notify("已移除示例通行密钥，真实账户未改变。");
                      }}
                    >
                      确认删除
                    </Button>
                  </div>
                </div>
              )}
              {keyDeleted && <p className="ap-muted">暂无通行密钥。</p>}
              <label className="ap-field" htmlFor="ap-passkey-name">
                名称（选填）
                <Input id="ap-passkey-name" placeholder="例如：日常使用的设备" />
              </label>
              <Button onClick={() => notify("预览仅展示通行密钥管理布局，不调用设备认证。")}>
                <Plus size={15} />
                添加通行密钥
              </Button>
            </section>
            <div className="ap-dialog-actions">
              <Button variant="ghost" onClick={() => notify("预览不包含真实登录会话。")}>
                <LogOut size={16} />
                退出登录
              </Button>
              <Button onClick={() => setPanel(null)}>关闭</Button>
            </div>
          </Modal>
          <Modal
            open={panel === "about"}
            onOpenChange={(open) => !open && setPanel(null)}
            title="后台交互预览"
            description="依据当前 DESIGN.md 与后台场景规范制作。"
            finalFocus={panelTrigger}
          >
            <div className="ap-about">
              <p>可切换六个管理页、进入写作页，体验主题、搜索筛选、排序分页、菜单、表单与弹窗。</p>
              <p>
                全部记录都是示例。保存、删除、发布和备份仅修改当前页面内存；刷新文件后恢复初始数据，不访问真实后台。
              </p>
              <p className="ap-muted">
                正式 Base UI 组件、Semi default + modern 皮肤、字体及图标已内嵌，本文件可离线打开。
              </p>
            </div>
            <div className="ap-dialog-actions">
              <Button onClick={() => setPanel(null)}>知道了</Button>
            </div>
          </Modal>
          <output className="ap-toast-area" aria-live="polite" aria-atomic="true">
            {notice && (
              <div className="admin-toast">
                <CheckCircle2 size={17} />
                <span>{notice}</span>
                <button aria-label="关闭提示" onClick={() => setNotice("")}>
                  <X size={16} />
                </button>
              </div>
            )}
          </output>
        </div>
      </TooltipProvider>
    </MotionProvider>
  );
}

createRoot(document.getElementById("preview-root")!).render(<App />);
