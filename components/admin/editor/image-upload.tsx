"use client";

import type { Editor } from "@tiptap/core";

import { posToDOMRect } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import { NodeSelection } from "@tiptap/pm/state";
import { ImagePlus, X, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTitle } from "@/components/ui/popover";
import { safeContentUrl } from "@/lib/posts/content-url";

import { uploadEditorImage } from "../use-media";
import { waitForComposition } from "./composition";
import {
  ImageUploadTask,
  imageUploadKey,
  uploadAnchor,
  uploadImageTransaction,
  type ImageUploadAnchor,
  type UploadSnapshot,
} from "./image-upload-state";

export const IMAGE_UPLOAD_REQUEST = "article-image-upload-request";
export const IMAGE_URL_REQUEST = "article-image-url-request";
type ActiveUpload = { id: string; task: ImageUploadTask; element: HTMLElement; preview: string };

const target = (instance: Editor, position: number | null = null): ImageUploadAnchor => ({
  id: crypto.randomUUID(),
  position: position ?? instance.state.selection.from,
  replaceSrc:
    position === null &&
    instance.state.selection instanceof NodeSelection &&
    instance.state.selection.node.type.name === "image"
      ? instance.state.selection.node.attrs.src
      : undefined,
});

export function EditorImageUpload({
  editor,
  onPendingChange,
}: {
  editor: Editor;
  onPendingChange: (pending: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const choice = useRef<ImageUploadAnchor | null>(null);
  const active = useRef<ActiveUpload | null>(null);
  const committing = useRef(false);
  const [display, setDisplay] = useState<{ upload: ActiveUpload; snapshot: UploadSnapshot } | null>(
    null,
  );
  const [urlTarget, setUrlTarget] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  useEffect(() => {
    const node = input.current;
    const cancel = () => {
      choice.current = null;
      editor.commands.focus(null, { scrollIntoView: false });
    };
    node?.addEventListener("cancel", cancel);
    return () => node?.removeEventListener("cancel", cancel);
  }, [editor]);

  const removeAnchor = (id: string) => {
    if (!editor.isDestroyed)
      editor.view.dispatch(
        editor.state.tr.setMeta(imageUploadKey, { remove: id }).setMeta("addToHistory", false),
      );
  };
  const insert = (id: string, src: string, alt: string) => {
    if (!editor.isEditable) throw new Error("请等待文章保存完成。");
    // 使用事务当前的位置，保留用户上传期间新增的文字、光标及滚动位置。
    const tr = uploadImageTransaction(editor.state, id, src, alt);
    const restoreFocus = active.current?.element.contains(document.activeElement);
    committing.current = true;
    try {
      editor.view.dispatch(tr);
      editor.view.dispatch(closeHistory(editor.state.tr));
    } finally {
      committing.current = false;
    }
    if (restoreFocus) editor.commands.focus(null, { scrollIntoView: false });
  };

  useEffect(() => {
    const request = ({ transaction }: { transaction: Editor["state"]["tr"] }) => {
      const fileRequest = transaction.getMeta(IMAGE_UPLOAD_REQUEST);
      const urlRequest = transaction.getMeta(IMAGE_URL_REQUEST);
      if ((!fileRequest && !urlRequest) || !editor.isEditable || editor.view.composing) return;
      if (active.current) {
        active.current.element.querySelector<HTMLButtonElement>("button")?.focus();
        return;
      }
      if (fileRequest) {
        choice.current = target(editor, fileRequest.position);
        // 在菜单触发的同一事务中打开原生选择器，保持用户激活状态。
        input.current?.click();
      } else {
        const anchor = target(editor);
        editor.view.dispatch(
          editor.state.tr.setMeta(imageUploadKey, { add: anchor }).setMeta("addToHistory", false),
        );
        setUrl("");
        setUrlError("");
        setUrlTarget(anchor.id);
      }
    };
    editor.on("transaction", request);
    return () => {
      editor.off("transaction", request);
    };
  }, [editor]);

  useEffect(() => {
    const check = () => {
      const current = active.current;
      if (current && !committing.current && !uploadAnchor(editor.state, current.id))
        current.task.cancel();
    };
    editor.on("transaction", check);
    return () => {
      editor.off("transaction", check);
      const current = active.current;
      active.current = null;
      if (current) {
        current.task.cancel();
        URL.revokeObjectURL(current.preview);
      }
    };
  }, [editor]);

  const closeUrl = () => {
    if (urlTarget) removeAnchor(urlTarget);
    setUrlTarget(null);
    editor.commands.focus(null, { scrollIntoView: false });
  };
  const current = display?.upload;
  const snapshot = display?.snapshot;
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        aria-label="上传文章图片"
        onChange={(event) => {
          const file = event.target.files?.[0],
            anchor = choice.current;
          event.target.value = "";
          choice.current = null;
          if (!file || !anchor || active.current || !editor.isEditable) return;
          const element = document.createElement("span");
          element.className = "post-image-upload-anchor";
          element.contentEditable = "false";
          const preview = URL.createObjectURL(file);
          const changed = () => {
            const upload = active.current;
            if (!upload || upload.id !== anchor.id) return;
            if (["done", "cancelled"].includes(upload.task.snapshot.status)) {
              const restoreFocus = upload.element.contains(document.activeElement);
              active.current = null;
              removeAnchor(upload.id);
              URL.revokeObjectURL(upload.preview);
              onPendingChange(false);
              setDisplay(null);
              if (restoreFocus && !editor.isDestroyed)
                editor.commands.focus(null, { scrollIntoView: false });
            } else setDisplay({ upload, snapshot: { ...upload.task.snapshot } });
          };
          const task = new ImageUploadTask(
            file,
            uploadEditorImage,
            async (src, signal) => {
              await waitForComposition(editor.view, signal);
              signal.throwIfAborted();
              insert(anchor.id, src, file.name);
            },
            changed,
          );
          active.current = { id: anchor.id, task, element, preview };
          onPendingChange(true);
          editor.view.dispatch(
            editor.state.tr
              .setMeta(imageUploadKey, { add: { ...anchor, element } })
              .setMeta("addToHistory", false),
          );
          void task.start();
        }}
      />
      {current &&
        snapshot &&
        createPortal(
          <span className="post-image-upload-inline" data-state={snapshot.status}>
            {/* 本地预览只存在于界面，不进入正文或保存请求。 */}
            {/* oxlint-disable-next-line next/no-img-element -- blob 本地预览不能经服务端优化或进入正文。 */}
            <img src={current.preview} alt="正在上传的图片预览" />
            <span className="post-image-upload-feedback">
              <ImagePlus size={20} aria-hidden="true" />
              <span className="post-image-upload-name">{current.task.file.name}</span>
              <output>
                {snapshot.status === "error"
                  ? "图片上传失败"
                  : snapshot.progress === null
                    ? "准备上传…"
                    : `上传中 ${snapshot.progress}%`}
              </output>
              {snapshot.status === "uploading" && (
                <progress
                  aria-label="图片上传进度"
                  max={100}
                  value={snapshot.progress ?? undefined}
                />
              )}
              {snapshot.error && <span role="alert">{snapshot.error}</span>}
              <span className="post-image-upload-actions">
                {snapshot.status === "error" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void current.task.start()}
                  >
                    <RotateCcw size={15} />
                    {snapshot.uploadedUrl ? "重试插入" : "重试上传"}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => current.task.cancel()}
                >
                  <X size={15} />
                  {snapshot.status === "uploading" ? "取消上传" : "移除"}
                </Button>
              </span>
            </span>
          </span>,
          current.element,
        )}
      {urlTarget && (
        <Popover
          open
          onOpenChange={(open) => {
            if (!open) closeUrl();
          }}
        >
          <PopoverContent
            className="post-link-popover"
            anchor={{
              getBoundingClientRect: () => {
                const position =
                  uploadAnchor(editor.state, urlTarget)?.position ?? editor.state.selection.from;
                return posToDOMRect(editor.view, position, position);
              },
            }}
            side="bottom"
            align="start"
            finalFocus={false}
          >
            <PopoverTitle>插入网络图片</PopoverTitle>
            <label className="post-editor-field" htmlFor="post-upload-image-url">
              图片 URL
              <Input
                id="post-upload-image-url"
                type="url"
                value={url}
                maxLength={2000}
                placeholder="https://example.com/image.png"
                aria-invalid={Boolean(urlError)}
                aria-describedby={urlError ? "post-image-url-error" : undefined}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setUrlError("");
                }}
              />
            </label>
            {urlError && (
              <p id="post-image-url-error" role="alert" className="admin-post-error">
                {urlError}
              </p>
            )}
            <div className="admin-form-actions">
              <Button type="button" variant="ghost" onClick={closeUrl}>
                取消
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const src = url.trim();
                  if (!/^https?:\/\//i.test(src) || !safeContentUrl(src, true)) {
                    setUrlError("请填写完整的 HTTP 或 HTTPS 图片 URL。");
                    return;
                  }
                  try {
                    insert(urlTarget, src, "");
                    closeUrl();
                  } catch (error) {
                    setUrlError(error instanceof Error ? error.message : "图片无法插入。");
                  }
                }}
              >
                插入
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
