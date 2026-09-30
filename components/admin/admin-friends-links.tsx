"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
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
import { friendCategories, friendStatuses, type FriendLink } from "./friends-links-mock-data";
import "./admin-friends-links.css";

type LinkDraft = Omit<FriendLink, "id">;
type FieldErrors = Partial<Record<"name" | "url" | "avatar", string>>;
const pageSize = 8;
const emptyDraft: LinkDraft = {
  name: "",
  url: "",
  avatar: "",
  description: "",
  category: "技术博客",
  status: "正常",
};

function isWebUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function FriendAvatar({ src }: { src: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return (
    <span className="admin-friend-avatar" aria-hidden="true">
      {src && failedSource !== src ? (
        <Image
          src={src}
          alt=""
          width={36}
          height={36}
          unoptimized
          onError={() => setFailedSource(src)}
        />
      ) : (
        <Link2 size={18} />
      )}
    </span>
  );
}

export function AdminFriendsLinks() {
  const { friendsLinks, setFriendsLinks, onMessage } = useAdminWorkspace();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LinkDraft>(emptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [deleting, setDeleting] = useState<FriendLink | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const urlInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const cancelDelete = useRef<HTMLButtonElement>(null);

  const keyword = query.trim().toLowerCase();
  const filtered = friendsLinks.filter(
    (link) =>
      (category === "all" || link.category === category) &&
      (status === "all" || link.status === status) &&
      [link.name, link.url, link.description].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const returnFocus = () => (trigger.current?.isConnected ? trigger.current : addButton.current);

  const resetFilters = () => {
    setCategory("all");
    setStatus("all");
    setQuery("");
    setPage(1);
  };
  const openForm = (element: HTMLElement, link?: FriendLink) => {
    trigger.current = element;
    setEditingId(link?.id ?? null);
    setDraft(link ? { ...link } : { ...emptyDraft });
    setErrors({});
    setFormOpen(true);
  };
  const updateDraft = <K extends keyof LinkDraft>(key: K, value: LinkDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.name.trim();
    const url = draft.url.trim();
    const avatar = draft.avatar.trim();
    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "请输入网站名称";
    if (!isWebUrl(url)) nextErrors.url = "请输入完整的 http:// 或 https:// 网站地址";
    if (
      avatar &&
      !isWebUrl(avatar) &&
      !(avatar.startsWith("/") && !avatar.startsWith("//") && !avatar.includes("\\"))
    ) {
      nextErrors.avatar = "请输入 HTTP(S) 图标地址或以 / 开头的本地路径";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      (nextErrors.name ? nameInput : nextErrors.url ? urlInput : avatarInput).current?.focus();
      return;
    }
    const saved: FriendLink = {
      ...draft,
      id: editingId ?? `friend-${crypto.randomUUID()}`,
      name,
      url,
      avatar,
      description: draft.description.trim() || "暂无站点简介",
    };
    setFriendsLinks((current) =>
      editingId
        ? current.map((link) => (link.id === editingId ? saved : link))
        : [saved, ...current],
    );
    if (!editingId) resetFilters();
    else setPage(currentPage);
    setFormOpen(false);
    onMessage(`友链已${editingId ? "更新" : "添加"}（模拟，仅当前会话）`);
  };

  return (
    <div className="admin-posts admin-friends-links">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CONNECTIONS / 友情链接</p>
          <h1>友情链接管理</h1>
          <p>与优质博客建立网状互联，拓展内容传播圈层。</p>
        </div>
        <Button
          ref={addButton}
          variant="primary"
          onClick={(event) => openForm(event.currentTarget)}
        >
          <Plus size={16} aria-hidden="true" />
          新增友链
        </Button>
      </div>
      <p className="admin-post-session-note">
        演示数据 · 操作仅影响当前会话，刷新后恢复；健康状态为模拟值。
      </p>
      <Card className="admin-friend-filters">
        <div className="admin-friend-filter-selects">
          <Select
            items={[
              { value: "all", label: "全部分类" },
              ...friendCategories.map((value) => ({ value, label: value })),
            ]}
            value={category}
            onValueChange={(value) => {
              setCategory(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="筛选友链分类">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {friendCategories.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={[
              { value: "all", label: "全部状态" },
              ...friendStatuses.map((value) => ({ value, label: value })),
            ]}
            value={status}
            onValueChange={(value) => {
              setStatus(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="筛选友链状态">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {friendStatuses.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="admin-friend-search">
          <Search size={16} aria-hidden="true" />
          <Input
            aria-label="搜索友链"
            placeholder="搜索友链名称、地址或描述…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="清空友链搜索"
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </Card>
      <Card className="admin-post-list">
        <section className="admin-post-table-scroll" aria-label="友情链接列表，可横向滚动">
          <table className="admin-post-table admin-friend-table">
            <caption className="sr-only">友情链接及模拟健康状态</caption>
            <thead>
              <tr>
                {["博客名称 / 地址", "站点描述", "分类", "状态", "操作"].map((title) => (
                  <th scope="col" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((link) => (
                <tr key={link.id}>
                  <td>
                    <div className="admin-friend-identity">
                      <FriendAvatar src={link.avatar} />
                      <div>
                        <strong>{link.name}</strong>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.url}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="admin-friend-description">{link.description}</p>
                  </td>
                  <td>
                    <span className="admin-post-category">{link.category}</span>
                  </td>
                  <td>
                    <span
                      className={`admin-post-status ${link.status === "正常" ? "is-published" : link.status === "异常" ? "is-rejected" : ""}`}
                    >
                      {link.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-post-row-actions">
                      {link.status === "待审核" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="通过审核"
                          aria-label={`通过 ${link.name} 的友链审核`}
                          onClick={() => {
                            setFriendsLinks((current) =>
                              current.map((item) =>
                                item.id === link.id ? { ...item, status: "正常" } : item,
                              ),
                            );
                            setPage(currentPage);
                            onMessage("友链已通过审核（模拟，仅当前会话）");
                          }}
                        >
                          <Check size={16} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="编辑友链"
                        aria-label={`编辑友链 ${link.name}`}
                        onClick={(event) => openForm(event.currentTarget, link)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="删除友链"
                        aria-label={`删除友链 ${link.name}`}
                        onClick={(event) => {
                          trigger.current = event.currentTarget;
                          setDeleting(link);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {!filtered.length && (
          <div className="admin-post-empty">
            <Link2 size={28} aria-hidden="true" />
            <h2>暂无对应友链数据</h2>
            <p>调整筛选条件，或添加第一条友情链接。</p>
            <div className="admin-form-actions">
              <Button onClick={resetFilters}>重置筛选</Button>
              <Button variant="primary" onClick={(event) => openForm(event.currentTarget)}>
                新增友链
              </Button>
            </div>
          </div>
        )}
        <div className="admin-post-pagination">
          <output>
            显示第 {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, filtered.length)} 条，共 {filtered.length} 条
          </output>
          <nav aria-label="友链分页">
            <Button
              size="sm"
              variant="ghost"
              aria-label="上一页友链"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span aria-current="page">
              {currentPage} / {pageCount}
            </span>
            <Button
              size="sm"
              variant="ghost"
              aria-label="下一页友链"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </nav>
        </div>
      </Card>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="admin-modal admin-friend-modal"
          initialFocus={nameInput}
          finalFocus={returnFocus}
        >
          <div className="admin-modal-heading">
            <div>
              <DialogTitle>{editingId ? "编辑友情链接" : "添加友情链接"}</DialogTitle>
              <DialogDescription>使用演示数据，保存仅影响当前会话。</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="关闭友链表单"
              onClick={() => setFormOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>
          <form className="admin-form" onSubmit={save} noValidate>
            <label htmlFor="friend-name">
              网站名称（必填）
              <Input
                id="friend-name"
                ref={nameInput}
                required
                maxLength={100}
                placeholder="例如：拾光漫步"
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "friend-name-error" : undefined}
              />
              {errors.name && (
                <span id="friend-name-error" className="admin-friend-error" role="alert">
                  {errors.name}
                </span>
              )}
            </label>
            <label htmlFor="friend-url">
              网站链接（必填）
              <Input
                id="friend-url"
                ref={urlInput}
                required
                type="url"
                placeholder="https://example.com"
                value={draft.url}
                onChange={(event) => updateDraft("url", event.target.value)}
                aria-invalid={Boolean(errors.url)}
                aria-describedby={errors.url ? "friend-url-error" : undefined}
              />
              {errors.url && (
                <span id="friend-url-error" className="admin-friend-error" role="alert">
                  {errors.url}
                </span>
              )}
            </label>
            <label htmlFor="friend-avatar">
              站点图标（可选）
              <Input
                id="friend-avatar"
                ref={avatarInput}
                placeholder="https://example.com/avatar.png"
                value={draft.avatar}
                onChange={(event) => updateDraft("avatar", event.target.value)}
                aria-invalid={Boolean(errors.avatar)}
                aria-describedby={errors.avatar ? "friend-avatar-error" : undefined}
              />
              {errors.avatar && (
                <span id="friend-avatar-error" className="admin-friend-error" role="alert">
                  {errors.avatar}
                </span>
              )}
            </label>
            <label htmlFor="friend-description">
              站点简介
              <Textarea
                id="friend-description"
                className="admin-friend-textarea"
                maxLength={500}
                placeholder="用一句话描述该站点的调性与核心关注…"
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
              />
            </label>
            <div className="admin-friend-form-selects">
              <div>
                <label id="friend-category-label" htmlFor="friend-category">
                  所属分类
                </label>
                <Select
                  value={draft.category}
                  onValueChange={(value) => {
                    if (value) updateDraft("category", value);
                  }}
                >
                  <SelectTrigger id="friend-category" aria-labelledby="friend-category-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {friendCategories.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label id="friend-status-label" htmlFor="friend-status">
                  健康状态
                </label>
                <Select
                  value={draft.status}
                  onValueChange={(value) => {
                    if (value) updateDraft("status", value);
                  }}
                >
                  <SelectTrigger id="friend-status" aria-labelledby="friend-status-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {friendStatuses.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="admin-form-actions">
              <Button type="button" onClick={() => setFormOpen(false)}>
                取消
              </Button>
              <Button variant="primary" type="submit">
                保存
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent
          className="admin-confirm admin-friend-modal"
          initialFocus={cancelDelete}
          finalFocus={returnFocus}
        >
          <DialogTitle>确认删除友链“{deleting?.name}”？</DialogTitle>
          <DialogDescription>仅从当前会话的演示列表移除，刷新后恢复初始数据。</DialogDescription>
          <div className="admin-form-actions">
            <Button ref={cancelDelete} onClick={() => setDeleting(null)}>
              取消
            </Button>
            <Button
              className="admin-friend-delete"
              disabled={!deleting}
              onClick={() => {
                if (!deleting) return;
                setFriendsLinks((current) => current.filter((link) => link.id !== deleting.id));
                setPage(currentPage);
                setDeleting(null);
                onMessage("友链已删除（模拟，仅当前会话）");
              }}
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
