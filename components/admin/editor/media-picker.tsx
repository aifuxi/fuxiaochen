"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { safeContentUrl } from "@/lib/posts/content-url";

import { useAdminWorkspace } from "../admin-context";
import { uploadEditorImage } from "../use-media";

export function EditorMediaPicker({
  onInsert,
  onClose,
  initialAlt = "",
  initialUrl = "",
  finalFocus,
}: {
  onInsert: (src: string, alt: string) => void;
  onClose: () => void;
  initialAlt?: string;
  initialUrl?: string;
  finalFocus?: () => HTMLElement;
}) {
  const { postPending } = useAdminWorkspace();
  const fileInput = useRef<HTMLInputElement>(null);
  const urlInput = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [url, setUrl] = useState(initialUrl);
  const [alt, setAlt] = useState(initialAlt);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  useEffect(() => () => controller.current?.abort(), []);

  const close = () => {
    // 取消只停止当前请求；已经上传成功的对象仍留在 OSS，不尝试删除。
    controller.current?.abort();
    onClose();
  };
  const upload = async (selected: File, existingUrl = "") => {
    if (controller.current || postPending) return;
    const task = new AbortController();
    controller.current = task;
    setBusy(true);
    setFile(selected);
    setError("");
    setProgress(null);
    try {
      // 插入失败时复用已经上传的 URL，重试不会重复创建 OSS 文件。
      const src = existingUrl || (await uploadEditorImage(selected, task.signal, setProgress));
      task.signal.throwIfAborted();
      setUploadedUrl(src);
      onInsert(src, alt.trim() || selected.name);
    } catch (failure) {
      if (!task.signal.aborted)
        setError(failure instanceof Error ? failure.message : "图片上传失败，请重试。");
    } finally {
      if (!task.signal.aborted) {
        controller.current = null;
        setBusy(false);
      }
    }
  };
  const insertUrl = () => {
    const src = url.trim();
    // 只检查正文 URL 的协议和格式，不下载或探测目标图片。
    if (!/^https?:\/\//i.test(src) || !safeContentUrl(src, true)) {
      setUrlError("请填写完整的 HTTP 或 HTTPS 图片 URL。");
      urlInput.current?.focus();
      return;
    }
    setUrlError("");
    setError("");
    try {
      onInsert(src, alt.trim());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "图片插入失败，请重试。");
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="post-media-picker" finalFocus={finalFocus ?? false}>
        <DialogTitle>插入图片</DialogTitle>
        <DialogDescription>
          上传图片后直接插入正文，或粘贴图片 URL。移除正文图片不会删除原文件。
        </DialogDescription>
        <label className="post-editor-field" htmlFor="post-image-alt">
          图片替代文字（选填）
          <Input
            id="post-image-alt"
            maxLength={2000}
            value={alt}
            disabled={busy || postPending}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="描述图片内容"
          />
        </label>
        <div className="post-image-upload">
          <Button
            type="button"
            disabled={busy || postPending}
            onClick={() => fileInput.current?.click()}
          >
            {busy ? "正在上传…" : "上传图片并插入"}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="上传文章图片"
            disabled={busy || postPending}
            onChange={(event) => {
              const selected = event.target.files?.[0];
              event.target.value = "";
              if (!selected) return;
              setUploadedUrl("");
              void upload(selected);
            }}
          />
          {busy && (
            <output className="post-image-progress">
              <span>
                {file?.name} · {progress === null ? "正在获取上传地址…" : `正在上传 ${progress}%`}
              </span>
              <progress aria-label="图片上传进度" max={100} value={progress ?? undefined} />
            </output>
          )}
        </div>
        <label className="post-editor-field" htmlFor="post-image-url">
          图片 URL
          <Input
            ref={urlInput}
            id="post-image-url"
            type="url"
            maxLength={2000}
            value={url}
            disabled={busy || postPending}
            aria-invalid={Boolean(urlError)}
            aria-describedby={urlError ? "post-image-url-error" : undefined}
            onChange={(event) => {
              setUrl(event.target.value);
              setUrlError("");
            }}
            placeholder="https://example.com/image.png"
          />
        </label>
        {urlError && (
          <p id="post-image-url-error" className="admin-post-error" role="alert">
            {urlError}
          </p>
        )}
        {error && (
          <p className="admin-post-error" role="alert">
            {error}
          </p>
        )}
        {error && file && (
          <Button
            type="button"
            disabled={busy || postPending}
            onClick={() => void upload(file, uploadedUrl)}
          >
            {uploadedUrl ? "重试插入" : "重试上传"}
          </Button>
        )}
        <div className="admin-form-actions">
          <Button type="button" variant="ghost" onClick={close} disabled={postPending}>
            {busy ? "取消上传" : "取消"}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={busy || postPending || !url.trim()}
            onClick={insertUrl}
          >
            插入 URL 图片
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
