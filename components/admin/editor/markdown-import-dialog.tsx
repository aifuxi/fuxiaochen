"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_TEXT_LIMIT } from "@/lib/posts/document";

export function MarkdownImportDialog({
  disabled,
  onClose,
  onImport,
}: {
  disabled: boolean;
  onClose: () => void;
  onImport: (source: string) => void;
}) {
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const readFile = async (file: File) => {
    setError("");
    if (!/\.(md|markdown)$/i.test(file.name)) {
      setError("请选择 .md 或 .markdown 文件。");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Markdown 文件最多 1 MiB。");
      return;
    }
    setReading(true);
    try {
      const value = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
      if (!active.current) return;
      if (value.length > CONTENT_TEXT_LIMIT) throw new Error("Markdown 源码最多 100,000 个字符。");
      setSource(value);
    } catch (cause) {
      if (active.current)
        setError(
          cause instanceof TypeError
            ? "文件不是有效的 UTF-8 文本。"
            : cause instanceof Error
              ? cause.message
              : "文件读取失败，请重试。",
        );
    } finally {
      if (active.current) setReading(false);
    }
  };
  const submit = () => {
    if (disabled || reading) return;
    setError("");
    try {
      if (!source.trim()) throw new Error("请选择文件或粘贴 Markdown 源码。");
      if (source.length > CONTENT_TEXT_LIMIT) throw new Error("Markdown 源码最多 100,000 个字符。");
      onImport(source);
      onClose();
    } catch (cause) {
      setError(
        cause instanceof z.ZodError
          ? cause.issues[0].message
          : cause instanceof Error
            ? cause.message
            : "Markdown 导入失败。",
      );
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !disabled) onClose();
      }}
    >
      <DialogContent className="post-editor-import-dialog" data-cursor="native" finalFocus={false}>
        <DialogTitle>导入 Markdown</DialogTitle>
        <DialogDescription>
          选择 UTF-8 的 Markdown 文件或粘贴源码，插入到光标位置。导入后可撤销，保存后才会写入文章。
        </DialogDescription>
        <input
          ref={fileInput}
          type="file"
          accept=".md,.markdown"
          hidden
          aria-label="Markdown 文件"
          disabled={disabled || reading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void readFile(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || reading}
          onClick={() => fileInput.current?.click()}
        >
          选择 Markdown 文件
        </Button>
        <label className="post-editor-import-source" htmlFor="post-import-source">
          Markdown 源码
          <Textarea
            id="post-import-source"
            value={source}
            disabled={disabled || reading}
            aria-invalid={Boolean(error)}
            aria-describedby="post-import-limit post-import-error"
            onChange={(event) => setSource(event.target.value)}
          />
        </label>
        <p id="post-import-limit">
          文件最多 1 MiB，源码最多 100,000 字符；HTML 和不支持的语法保留为文字。
        </p>
        {reading && <output aria-live="polite">正在读取文件…</output>}
        <p id="post-import-error" className="admin-post-error" role="alert">
          {error}
        </p>
        <div className="admin-form-actions">
          <Button type="button" variant="ghost" disabled={disabled} onClick={onClose}>
            取消
          </Button>
          <Button type="button" variant="primary" disabled={disabled || reading} onClick={submit}>
            导入
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
