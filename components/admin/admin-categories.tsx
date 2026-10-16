"use client";

import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { List, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type SubmitEvent } from "react";

import type { Category } from "@/lib/taxonomy/schema";

import { Button } from "@/components/ui/button";
import { ColorInput } from "@/components/ui/color-input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RowActions } from "@/components/ui/menu";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { categorySchema, tagSchema } from "@/lib/taxonomy/schema";

import { useAdminWorkspace } from "./admin-context";
import { RecordPageSize, RecordSort } from "./record-list";
import { RecordLocator, useRecordTarget } from "./record-locator";
import { TaxonomyStatus } from "./taxonomy-status";
import "./admin-categories.css";

const actionIcons = {
  Trash2: <Trash2 size={16} />,
  Pencil: <Pencil size={16} aria-hidden="true" />,
};

const columns: ColumnDef<Category>[] = [
  { accessorKey: "name", enableSorting: true },
  { accessorKey: "postCount", enableSorting: true },
];

export function AdminCategories() {
  "use no memo";

  const record = useRecordTarget();
  const recordKind = useSearchParams().get("kind");
  const {
    onMessage,
    categoryItems: categories,
    tagItems: tags,
    createCategory,
    updateCategory,
    reloadCategory,
    createTag,
    deleteCategory,
    deleteTag,
    taxonomyLoading,
    taxonomyError,
    taxonomyPending,
  } = useAdminWorkspace();
  const visibleCategories = record
    ? categories.filter((item) => recordKind !== "tag" && item.id === record)
    : categories;
  const visibleTags = record
    ? tags.filter((item) => recordKind !== "category" && item.id === record)
    : tags;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [batchSize, setBatchSize] = useState(8);
  const [visibleCount, setVisibleCount] = useState(8);
  const [createOpen, setCreateOpen] = useState(false);
  const createButton = useRef<HTMLButtonElement>(null);
  const recordView = record
    ? recordKind === "tag" || (recordKind !== "category" && visibleTags.length > 0)
      ? "tags"
      : "categories"
    : null;
  const targetKey = record ? `${record}:${recordView}` : null;
  const [selection, setSelection] = useState({
    target: targetKey,
    value: recordView ?? "categories",
  });
  // 在定位目标变化时同步选择分组，避免 RecordLocator 回焦早于隐藏面板的挂载。
  if (selection.target !== targetKey) {
    setSelection({ target: targetKey, value: recordView ?? selection.value });
  }
  const view = selection.target === targetKey ? selection.value : (recordView ?? selection.value);
  const filteredCategories = useMemo(
    () => visibleCategories.filter((item) => record || item.name.includes(query)),
    [visibleCategories, query, record],
  );
  const sorting = useMemo<SortingState>(
    () =>
      sort === "default"
        ? []
        : [{ id: sort.startsWith("name") ? "name" : "postCount", desc: sort.endsWith("desc") }],
    [sort],
  );
  // 保留 TanStack 的真实排序模型，将展示改为无表头、无分割线的分类块。
  // oxlint-disable-next-line react/incompatible-library -- v8 实例可变，本组件明确使用 use no memo。
  const table = useReactTable({
    data: filteredCategories,
    columns,
    state: { sorting },
    getRowId: (item) => item.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const rows = table.getRowModel().rows;
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#0066df");
  const [editError, setEditError] = useState("");
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const editInput = useRef<HTMLInputElement>(null);
  const editTrigger = useRef<HTMLElement | null>(null);
  const categoryDeleted = useRef(false);
  const disabled = taxonomyLoading || Boolean(taxonomyError) || taxonomyPending;
  const [categoryName, setCategoryName] = useState("");
  const [color, setColor] = useState("#0066df");
  const [tagName, setTagName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [tagError, setTagError] = useState("");
  const [deleteName, setDeleteName] = useState<string | null>(null);
  const categoryInput = useRef<HTMLInputElement>(null);
  const tagInput = useRef<HTMLInputElement>(null);
  const deleteTrigger = useRef<HTMLElement>(null);
  const tagTriggers = useRef(new Map<string, HTMLElement>());
  const cancelButton = useRef<HTMLButtonElement>(null);

  const [deleteError, setDeleteError] = useState("");
  const addCategory = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    setCategoryError("");
    const parsed = categorySchema.safeParse({ name: categoryName, color });
    if (!parsed.success) {
      setCategoryError(parsed.error.issues[0].message);
      categoryInput.current?.focus();
      return;
    }
    try {
      await createCategory(parsed.data);
      setCategoryName("");
      setQuery("");
      setVisibleCount(categories.length + 1);
      setCreateOpen(false);
      onMessage("分类已创建");
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : "分类创建失败。");
      requestAnimationFrame(() => categoryInput.current?.focus());
    }
  };
  const addTag = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    setTagError("");
    const parsed = tagSchema.safeParse({ name: tagName });
    if (!parsed.success) {
      setTagError(parsed.error.issues[0].message);
      tagInput.current?.focus();
      return;
    }
    try {
      await createTag(parsed.data);
      setTagName("");
      requestAnimationFrame(() => tagInput.current?.focus());
      onMessage("标签已创建");
    } catch (error) {
      setTagError(error instanceof Error ? error.message : "标签创建失败。");
      requestAnimationFrame(() => tagInput.current?.focus());
    }
  };
  const removeTag = async (id: string) => {
    const index = tags.findIndex((item) => item.id === id);
    const next = tags[index + 1] ?? tags[index - 1];
    try {
      await deleteTag(id);
      requestAnimationFrame(() =>
        (tagTriggers.current.get(next?.id ?? "") ?? tagInput.current)?.focus(),
      );
      onMessage("标签已移除");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "标签删除失败。");
    }
  };

  return (
    <div className="admin-categories">
      <RecordLocator
        record={record}
        loading={taxonomyLoading}
        error={taxonomyError}
        found={[...visibleCategories, ...visibleTags].some((item) => item.id === record)}
      />
      <div className="admin-page-heading">
        <div>
          <h1>分类与标签</h1>
          <p>管理文章分类与标签；被文章引用时无法删除。</p>
        </div>
        {view === "categories" && (
          <Button
            ref={createButton}
            variant="primary"
            size="compact"
            disabled={disabled}
            onClick={() => {
              setCategoryError("");
              setCreateOpen(true);
            }}
          >
            <Plus size={16} aria-hidden="true" />
            新增分类
          </Button>
        )}
      </div>
      <TaxonomyStatus />
      <Tabs
        className="admin-taxonomy-workspace"
        value={view}
        onValueChange={(next) => {
          if (next) setSelection({ target: targetKey, value: next });
        }}
        aria-busy={taxonomyLoading || taxonomyPending}
      >
        <div className="admin-taxonomy-navigation">
          <TabsList size="compact" aria-label="分类与标签视图">
            <TabsTrigger value="categories">
              <List size={16} aria-hidden="true" />
              分类 <span className="admin-taxonomy-count">{categories.length}</span>
            </TabsTrigger>
            <TabsTrigger value="tags">
              <Tags size={16} aria-hidden="true" />
              标签 <span className="admin-taxonomy-count">{tags.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsPanel value="categories" className="admin-taxonomy-panel">
          <div className="admin-taxonomy-toolbar">
            <Input
              className="ds-control-compact admin-taxonomy-search"
              aria-label="搜索分类"
              placeholder="搜索分类名称"
              value={query}
              maxLength={40}
              disabled={Boolean(record)}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(batchSize);
              }}
            />
            <div className="admin-taxonomy-controls">
              <div className="admin-taxonomy-sort">
                <RecordSort
                  label="分类排序"
                  value={sort}
                  disabled={disabled}
                  onChange={(next) => {
                    setSort(next);
                    setVisibleCount(batchSize);
                  }}
                  options={[
                    ["default", "默认顺序"],
                    ["name-asc", "名称正序"],
                    ["name-desc", "名称倒序"],
                    ["count-desc", "文章数从多到少"],
                    ["count-asc", "文章数从少到多"],
                  ]}
                />
              </div>
              <div className="admin-taxonomy-batch-size">
                <RecordPageSize
                  value={batchSize}
                  disabled={disabled}
                  onChange={(next) => {
                    setBatchSize(next);
                    setVisibleCount(next);
                  }}
                />
              </div>
            </div>
          </div>
          <ul className="admin-taxonomy-list" aria-label="文章分类">
            {rows.slice(0, visibleCount).map(({ original: item }) => (
              <li
                key={item.id}
                data-record-id={item.id}
                tabIndex={-1}
                className={`admin-taxonomy-item ${record === item.id ? "admin-record-highlight" : ""}`}
              >
                <div className="admin-taxonomy-identity">
                  <h2 className="admin-taxonomy-name">
                    <span
                      className="admin-taxonomy-swatch"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    {item.name}
                  </h2>
                  <p>{item.postCount} 篇文章</p>
                </div>
                <RowActions
                  label={`分类 ${item.name} 的操作`}
                  disabled={disabled}
                  actions={[
                    {
                      label: "编辑分类",
                      icon: actionIcons.Pencil,
                      opensDialog: true,
                      onSelect: (trigger) => {
                        editTrigger.current = trigger;
                        setEditTarget(item);
                        setEditName(item.name);
                        setEditColor(item.color);
                        setEditError("");
                        setEditFieldErrors({});
                      },
                    },
                    {
                      label: "删除分类",
                      icon: actionIcons.Trash2,
                      destructive: true,
                      opensDialog: true,
                      onSelect: (trigger) => {
                        deleteTrigger.current = trigger;
                        categoryDeleted.current = false;
                        setDeleteName(item.id);
                        setDeleteError("");
                      },
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
          {!taxonomyLoading && !taxonomyError && !rows.length && (
            <div className="admin-taxonomy-empty">
              <p>{query ? "没有匹配的分类。" : "暂无分类，可在页首添加新分类。"}</p>
              {query && (
                <Button variant="ghost" size="compact" onClick={() => setQuery("")}>
                  清除搜索
                </Button>
              )}
            </div>
          )}
          {visibleCount < rows.length && (
            <div className="admin-taxonomy-more">
              <Button
                variant="secondary"
                size="compact"
                disabled={disabled}
                onClick={() => {
                  const nextId = rows[visibleCount].id;
                  setVisibleCount((count) => count + batchSize);
                  requestAnimationFrame(() => {
                    document.querySelector<HTMLElement>(`[data-record-id="${nextId}"]`)?.focus();
                  });
                }}
              >
                显示更多分类
              </Button>
            </div>
          )}
          <output className="sr-only" aria-live="polite">
            {!taxonomyLoading && !taxonomyError
              ? `已显示 ${Math.min(visibleCount, rows.length)} 个分类，共 ${rows.length} 个。`
              : ""}
          </output>
        </TabsPanel>
        <TabsPanel value="tags" className="admin-taxonomy-panel">
          <div className="admin-taxonomy-tag-form">
            <form onSubmit={addTag} noValidate>
              <label className="admin-taxonomy-label" htmlFor="admin-tag-name">
                标签名称
              </label>
              <div className="admin-taxonomy-form">
                <Input
                  id="admin-tag-name"
                  ref={tagInput}
                  placeholder="输入标签名称"
                  disabled={taxonomyPending}
                  maxLength={40}
                  value={tagName}
                  aria-invalid={Boolean(tagError)}
                  aria-describedby={tagError ? "admin-tag-error" : undefined}
                  onChange={(event) => {
                    setTagName(event.target.value);
                    setTagError("");
                  }}
                />
                <Button type="submit" variant="primary" disabled={disabled}>
                  <Plus size={16} aria-hidden="true" />
                  {taxonomyPending ? "正在保存…" : "添加"}
                </Button>
              </div>
              {tagError && (
                <p id="admin-tag-error" className="admin-taxonomy-error" role="alert">
                  {tagError}
                </p>
              )}
            </form>
          </div>
          <ul className="admin-taxonomy-cloud" aria-label="标签列表">
            {visibleTags.map((item) => (
              <li
                key={item.id}
                data-record-id={item.id}
                tabIndex={record === item.id ? -1 : undefined}
                className={`admin-taxonomy-tag ${record === item.id ? "admin-record-highlight" : ""}`}
              >
                <span className="admin-taxonomy-tag-name">#{item.name}</span>
                <span className="admin-taxonomy-count">{item.postCount}</span>
                <Button
                  ref={(node) => {
                    if (node) tagTriggers.current.set(item.id, node);
                    else tagTriggers.current.delete(item.id);
                  }}
                  variant="ghost"
                  size="compact"
                  className="admin-taxonomy-tag-remove"
                  aria-label={`移除标签 ${item.name}`}
                  disabled={disabled}
                  onClick={() => void removeTag(item.id)}
                >
                  <X size={14} aria-hidden="true" />
                </Button>
              </li>
            ))}
            {!taxonomyLoading && !taxonomyError && !visibleTags.length && (
              <li className="admin-taxonomy-empty">暂无标签，可在上方添加新标签。</li>
            )}
          </ul>
          <p className="admin-taxonomy-note">
            标签可用于细分文章主题。已关联文章的标签需要先解除引用。
          </p>
        </TabsPanel>
      </Tabs>
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!taxonomyPending) setCreateOpen(open);
        }}
      >
        <DialogContent initialFocus={categoryInput} finalFocus={createButton}>
          <DialogTitle>新增分类</DialogTitle>
          <DialogDescription>为文章添加一个清晰的主题分类。</DialogDescription>
          <form className="admin-form" onSubmit={addCategory} noValidate>
            <label className="admin-taxonomy-label" htmlFor="admin-category-name">
              分类名称
            </label>
            <div className="admin-taxonomy-form">
              <Input
                id="admin-category-name"
                ref={categoryInput}
                placeholder="输入分类名称"
                disabled={taxonomyPending}
                maxLength={40}
                value={categoryName}
                aria-invalid={Boolean(categoryError)}
                aria-describedby={categoryError ? "admin-category-error" : undefined}
                onChange={(event) => {
                  setCategoryName(event.target.value);
                  setCategoryError("");
                }}
              />
              <ColorInput
                id="admin-category-color"
                disabled={taxonomyPending}
                aria-label="选择分类颜色"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
            </div>
            {categoryError && (
              <p id="admin-category-error" className="admin-taxonomy-error" role="alert">
                {categoryError}
              </p>
            )}
            <div className="admin-form-actions">
              <Button type="button" disabled={taxonomyPending} onClick={() => setCreateOpen(false)}>
                取消
              </Button>
              <Button type="submit" variant="primary" disabled={disabled}>
                {taxonomyPending ? "正在保存…" : "创建分类"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open && !taxonomyPending) setEditTarget(null);
        }}
      >
        <DialogContent
          initialFocus={editInput}
          finalFocus={() =>
            editTrigger.current?.isConnected ? editTrigger.current : createButton.current
          }
        >
          <DialogTitle>编辑分类</DialogTitle>
          <DialogDescription>修改名称与颜色，文章关联保持不变。</DialogDescription>
          {editError && (
            <p role="alert" className="admin-business-error">
              {editError}
            </p>
          )}
          <form
            className="admin-form"
            noValidate
            onSubmit={async (event) => {
              event.preventDefault();
              if (!editTarget || taxonomyPending) return;
              const parsed = categorySchema.safeParse({ name: editName, color: editColor });
              if (!parsed.success) {
                setEditFieldErrors(
                  Object.fromEntries(
                    parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
                  ),
                );
                editInput.current?.focus();
                return;
              }
              setEditError("");
              setEditFieldErrors({});
              try {
                await updateCategory(editTarget.id, {
                  ...parsed.data,
                  expected: { name: editTarget.name, color: editTarget.color },
                });
                setEditTarget(null);
                onMessage("分类已更新");
              } catch (error) {
                setEditError(error instanceof Error ? error.message : "分类保存失败。");
                requestAnimationFrame(() => editInput.current?.focus());
              }
            }}
          >
            <label htmlFor="admin-edit-category-name">分类名称</label>
            <Input
              id="admin-edit-category-name"
              ref={editInput}
              value={editName}
              maxLength={40}
              disabled={taxonomyPending}
              onChange={(event) => setEditName(event.target.value)}
              aria-invalid={Boolean(editFieldErrors.name)}
              aria-describedby={editFieldErrors.name ? "category-edit-name-error" : undefined}
            />
            {editFieldErrors.name && (
              <p id="category-edit-name-error" className="admin-business-error">
                {editFieldErrors.name}
              </p>
            )}
            <label htmlFor="admin-edit-category-color">分类颜色</label>
            <ColorInput
              id="admin-edit-category-color"
              value={editColor}
              disabled={taxonomyPending}
              onChange={(event) => setEditColor(event.target.value)}
              aria-invalid={Boolean(editFieldErrors.color)}
              aria-describedby={editFieldErrors.color ? "category-edit-color-error" : undefined}
            />
            {editFieldErrors.color && (
              <p id="category-edit-color-error" className="admin-business-error">
                {editFieldErrors.color}
              </p>
            )}
            {editError && (
              <Button
                type="button"
                disabled={taxonomyPending}
                onClick={async () => {
                  if (!editTarget) return;
                  try {
                    const latest = await reloadCategory(editTarget.id);
                    setEditTarget(latest);
                    setEditName(latest.name);
                    setEditColor(latest.color);
                    setEditError("");
                    setEditFieldErrors({});
                  } catch (error) {
                    setEditError(error instanceof Error ? error.message : "重新载入失败。");
                  }
                }}
              >
                放弃修改并重新载入
              </Button>
            )}
            <div className="admin-form-actions">
              <Button type="button" disabled={taxonomyPending} onClick={() => setEditTarget(null)}>
                取消
              </Button>
              <Button type="submit" variant="primary" disabled={taxonomyPending}>
                {taxonomyPending ? "正在保存…" : "保存分类"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteName !== null}
        onOpenChange={(open) => {
          if (!open && !taxonomyPending) setDeleteName(null);
        }}
      >
        <DialogContent
          className="admin-confirm"
          initialFocus={cancelButton}
          finalFocus={() =>
            !categoryDeleted.current && deleteTrigger.current?.isConnected
              ? deleteTrigger.current
              : createButton.current
          }
        >
          <DialogTitle>
            确认删除分类“{categories.find((item) => item.id === deleteName)?.name}”？
          </DialogTitle>
          <DialogDescription>
            将永久删除分类。被文章引用的分类无法删除，请先调整关联文章。
          </DialogDescription>
          {deleteError && <p role="alert">{deleteError}</p>}
          <div className="admin-form-actions">
            <Button
              ref={cancelButton}
              size="form"
              disabled={taxonomyPending}
              onClick={() => setDeleteName(null)}
            >
              取消
            </Button>
            <Button
              size="form"
              className="admin-taxonomy-delete-confirm"
              disabled={
                deleteName === null ||
                disabled ||
                Boolean(categories.find((item) => item.id === deleteName)?.postCount)
              }
              onClick={async () => {
                if (!deleteName) return;
                setDeleteError("");
                try {
                  await deleteCategory(deleteName);
                  categoryDeleted.current = true;
                  setDeleteName(null);
                  onMessage("分类已删除");
                } catch (error) {
                  setDeleteError(error instanceof Error ? error.message : "分类删除失败。");
                }
              }}
            >
              {taxonomyPending ? "正在删除…" : "确认删除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
