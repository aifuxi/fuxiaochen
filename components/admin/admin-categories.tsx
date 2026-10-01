"use client";

import { useRef, useState, type FormEvent } from "react";

import { Folder, Plus, Tags, Trash2, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardStage } from "@/components/ui/card";
import { ColorInput } from "@/components/ui/color-input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useAdminWorkspace } from "./admin-context";
import { initialDemoCategories, initialDemoTags } from "./category-mock-data";
import "./admin-categories.css";

export function AdminCategories() {
  const { onMessage } = useAdminWorkspace();
  const [categories, setCategories] = useState(initialDemoCategories);
  const [tags, setTags] = useState(initialDemoTags);
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

  const addCategory = (event: FormEvent) => {
    event.preventDefault();
    const name = categoryName.trim();
    const error = !name
      ? "请输入分类名称"
      : categories.some((item) => item.name.toLowerCase() === name.toLowerCase())
        ? "该分类已存在"
        : "";
    setCategoryError(error);
    if (error) {
      categoryInput.current?.focus();
      return;
    }
    setCategories((current) => [...current, { name, color, count: 0 }]);
    setCategoryName("");
    categoryInput.current?.focus();
    onMessage("分类已创建（模拟，仅修改此页演示列表）");
  };

  const addTag = (event: FormEvent) => {
    event.preventDefault();
    const name = tagName.trim();
    const error = !name
      ? "请输入标签名称"
      : tags.some((item) => item.name.toLowerCase() === name.toLowerCase())
        ? "该标签已存在"
        : "";
    setTagError(error);
    if (error) {
      tagInput.current?.focus();
      return;
    }
    setTags((current) => [...current, { name, count: 0 }]);
    setTagName("");
    tagInput.current?.focus();
    onMessage("标签已创建（模拟，仅修改此页演示列表）");
  };

  const removeTag = (name: string) => {
    const index = tags.findIndex((item) => item.name === name);
    const next = tags[index + 1] ?? tags[index - 1];
    setTags((current) => current.filter((item) => item.name !== name));
    (next ? tagTriggers.current.get(next.name) : tagInput.current)?.focus();
    onMessage("标签已移除（模拟，文章标签未变更）");
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
      <p className="admin-taxonomy-note">
        独立演示数据 · 关联数量为模拟值，操作不影响文章，刷新后恢复初始列表。
      </p>
      <div className="admin-taxonomy-grid">
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
              <label className="sr-only" htmlFor="demo-category-name">
                新增分类名称
              </label>
              <div className="admin-taxonomy-form">
                <Input
                  id="demo-category-name"
                  ref={categoryInput}
                  placeholder="新增分类标题…"
                  value={categoryName}
                  aria-invalid={Boolean(categoryError)}
                  aria-describedby={categoryError ? "demo-category-error" : undefined}
                  onChange={(event) => {
                    setCategoryName(event.target.value);
                    setCategoryError("");
                  }}
                />
                <label className="sr-only" htmlFor="demo-category-color">
                  选择分类主题色
                </label>
                <ColorInput
                  id="demo-category-color"
                  aria-label="选择分类主题色"
                  value={color}
                  onInput={(event) => setColor(event.currentTarget.value)}
                  onChange={(event) => setColor(event.target.value)}
                />
                <Button type="submit" variant="primary">
                  <Plus size={16} aria-hidden="true" />
                  添加
                </Button>
              </div>
              {categoryError && (
                <p id="demo-category-error" className="admin-taxonomy-error" role="alert">
                  {categoryError}
                </p>
              )}
            </form>
            <table className="admin-taxonomy-table">
              <caption className="sr-only">博文分类及模拟关联数量</caption>
              <thead>
                <tr>
                  <th scope="col">分类名称</th>
                  <th scope="col">关联博文</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.name}>
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
                    <td className="admin-taxonomy-count">{item.count} 篇</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="admin-taxonomy-delete"
                        aria-label={`删除分类 ${item.name}`}
                        onClick={(event) => {
                          deleteTrigger.current = event.currentTarget;
                          setDeleteName(item.name);
                        }}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!categories.length && (
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
              <label className="sr-only" htmlFor="demo-tag-name">
                新增标签名称
              </label>
              <div className="admin-taxonomy-form">
                <Input
                  id="demo-tag-name"
                  ref={tagInput}
                  placeholder="新增标签词…"
                  value={tagName}
                  aria-invalid={Boolean(tagError)}
                  aria-describedby={tagError ? "demo-tag-error" : undefined}
                  onChange={(event) => {
                    setTagName(event.target.value);
                    setTagError("");
                  }}
                />
                <Button type="submit" variant="primary">
                  <Plus size={16} aria-hidden="true" />
                  添加
                </Button>
              </div>
              {tagError && (
                <p id="demo-tag-error" className="admin-taxonomy-error" role="alert">
                  {tagError}
                </p>
              )}
            </form>
            <CardStage className="admin-taxonomy-cloud-stage">
              <ul className="admin-taxonomy-cloud" aria-label="标签列表">
                {tags.map((item) => (
                  <li key={item.name} className="admin-taxonomy-tag">
                    <span className="admin-taxonomy-tag-name">#{item.name}</span>
                    <span className="admin-taxonomy-count">({item.count})</span>
                    <Button
                      ref={(node) => {
                        if (node) tagTriggers.current.set(item.name, node);
                        else tagTriggers.current.delete(item.name);
                      }}
                      variant="ghost"
                      size="sm"
                      className="admin-taxonomy-tag-remove"
                      aria-label={`移除标签 ${item.name}`}
                      onClick={() => removeTag(item.name)}
                    >
                      <X size={14} aria-hidden="true" />
                    </Button>
                  </li>
                ))}
                {!tags.length && (
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
          if (!open) setDeleteName(null);
        }}
      >
        <DialogContent
          className="admin-confirm"
          initialFocus={cancelButton}
          finalFocus={() =>
            deleteTrigger.current?.isConnected ? deleteTrigger.current : categoryInput.current
          }
        >
          <DialogTitle>确认删除分类“{deleteName}”？</DialogTitle>
          <DialogDescription>仅从此页演示列表删除，文章分类与关联数据不会变更。</DialogDescription>
          <div className="admin-form-actions">
            <Button ref={cancelButton} onClick={() => setDeleteName(null)}>
              取消
            </Button>
            <Button
              className="admin-taxonomy-delete"
              disabled={deleteName === null}
              onClick={() => {
                setCategories((current) => current.filter((item) => item.name !== deleteName));
                setDeleteName(null);
                onMessage("分类已删除（模拟，文章分类未变更）");
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
