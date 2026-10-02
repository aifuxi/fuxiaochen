"use client";

import { Folder, Plus, Tags, Trash2, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardStage } from "@/components/ui/card";
import { ColorInput } from "@/components/ui/color-input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useAdminWorkspace } from "./admin-context";
import { TaxonomyStatus } from "./taxonomy-status";
import "./admin-categories.css";

export function AdminCategories() {
  const {
    onMessage,
    categoryItems: categories,
    tagItems: tags,
    createCategory,
    createTag,
    deleteCategory,
    deleteTag,
    taxonomyLoading,
    taxonomyError,
    taxonomyPending,
  } = useAdminWorkspace();
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
  const addCategory = async (event: FormEvent) => {
    event.preventDefault();
    setCategoryError("");
    try {
      await createCategory({ name: categoryName.trim(), color });
      setCategoryName("");
      requestAnimationFrame(() => categoryInput.current?.focus());
      onMessage("分类已创建");
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : "分类创建失败。");
      requestAnimationFrame(() => categoryInput.current?.focus());
    }
  };
  const addTag = async (event: FormEvent) => {
    event.preventDefault();
    setTagError("");
    try {
      await createTag({ name: tagName.trim() });
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
        (next ? tagTriggers.current.get(next.id) : tagInput.current)?.focus(),
      );
      onMessage("标签已移除");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "标签删除失败。");
    }
  };

  return (
    <div className="admin-categories">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">TAXONOMY / 分类与标签</p>
          <h1>分类与标签</h1>
          <p>建立清晰的知识架构与多维标签索引，帮助读者快速探索感兴趣的领域。</p>
        </div>
      </div>
      <p className="admin-taxonomy-note">分类与标签保存到数据库 · 被文章引用时无法删除。</p>
      <TaxonomyStatus />
      <div className="admin-taxonomy-grid" aria-busy={taxonomyLoading || taxonomyPending}>
        <Card className="admin-taxonomy-card">
          <div className="admin-taxonomy-heading">
            <h2>
              <Folder size={18} aria-hidden="true" />
              博文分类体系
            </h2>
            <span className="admin-taxonomy-badge" aria-label={`${categories.length} 个分类`}>
              {categories.length}
            </span>
          </div>
          <div className="admin-taxonomy-body">
            <form onSubmit={addCategory} noValidate>
              <label className="sr-only" htmlFor="admin-category-name">
                新增分类名称
              </label>
              <div className="admin-taxonomy-form">
                <Input
                  id="admin-category-name"
                  ref={categoryInput}
                  placeholder="新增分类标题…"
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
                <label className="sr-only" htmlFor="admin-category-color">
                  选择分类主题色
                </label>
                <ColorInput
                  id="admin-category-color"
                  disabled={taxonomyPending}
                  aria-label="选择分类主题色"
                  value={color}
                  onInput={(event) => setColor(event.currentTarget.value)}
                  onChange={(event) => setColor(event.target.value)}
                />
                <Button type="submit" variant="primary" disabled={disabled}>
                  <Plus size={16} aria-hidden="true" />
                  {taxonomyPending ? "正在保存…" : "添加"}
                </Button>
              </div>
              {categoryError && (
                <p id="admin-category-error" className="admin-taxonomy-error" role="alert">
                  {categoryError}
                </p>
              )}
            </form>
            <table className="admin-taxonomy-table">
              <caption className="sr-only">博文分类及关联文章数量</caption>
              <thead>
                <tr>
                  <th scope="col">分类名称</th>
                  <th scope="col">关联博文</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id}>
                    <td aria-label={item.name}>
                      <div className="admin-taxonomy-name">
                        <span
                          className="admin-taxonomy-swatch"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="admin-taxonomy-count">{item.postCount}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="admin-taxonomy-delete"
                        disabled={disabled}
                        aria-label={`删除分类 ${item.name}`}
                        onClick={(event) => {
                          deleteTrigger.current = event.currentTarget;
                          setDeleteName(item.id);
                          setDeleteError("");
                        }}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!taxonomyLoading && !taxonomyError && !categories.length && (
                  <tr>
                    <td colSpan={3} className="admin-taxonomy-empty">
                      暂无分类，可在上方添加新分类。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="admin-taxonomy-card">
          <div className="admin-taxonomy-heading admin-taxonomy-tag-heading">
            <h2>
              <Tags size={18} aria-hidden="true" />
              标签云检索
            </h2>
            <span className="admin-taxonomy-badge" aria-label={`${tags.length} 个标签`}>
              {tags.length}
            </span>
          </div>
          <div className="admin-taxonomy-body">
            <form onSubmit={addTag} noValidate>
              <label className="sr-only" htmlFor="admin-tag-name">
                新增标签名称
              </label>
              <div className="admin-taxonomy-form">
                <Input
                  id="admin-tag-name"
                  ref={tagInput}
                  placeholder="新增标签词…"
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
            <CardStage className="admin-taxonomy-cloud-stage">
              <ul className="admin-taxonomy-cloud" aria-label="标签列表">
                {tags.map((item) => (
                  <li key={item.id} className="admin-taxonomy-tag">
                    <span className="admin-taxonomy-tag-name">#{item.name}</span>
                    <span className="admin-taxonomy-count">{item.postCount}</span>
                    <Button
                      ref={(node) => {
                        if (node) tagTriggers.current.set(item.id, node);
                        else tagTriggers.current.delete(item.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="admin-taxonomy-tag-remove"
                      aria-label={`移除标签 ${item.name}`}
                      disabled={disabled}
                      onClick={() => void removeTag(item.id)}
                    >
                      <X size={14} aria-hidden="true" />
                    </Button>
                  </li>
                ))}
                {!taxonomyLoading && !taxonomyError && !tags.length && (
                  <li className="admin-taxonomy-empty">暂无标签，可在上方添加新标签。</li>
                )}
              </ul>
            </CardStage>
          </div>
        </Card>
      </div>
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
            deleteTrigger.current?.isConnected ? deleteTrigger.current : categoryInput.current
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
              disabled={taxonomyPending}
              onClick={() => setDeleteName(null)}
            >
              取消
            </Button>
            <Button
              className="admin-taxonomy-delete"
              disabled={deleteName === null || disabled}
              onClick={async () => {
                if (!deleteName) return;
                setDeleteError("");
                try {
                  await deleteCategory(deleteName);
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
