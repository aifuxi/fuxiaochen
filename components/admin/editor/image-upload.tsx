"use client";

import type { Editor } from "@tiptap/core";

import { posToDOMRect } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import { NodeSelection } from "@tiptap/pm/state";
import { ImagePlus, X, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTitle } from "@/components/ui/popover";
import { safeContentUrl } from "@/lib/posts/content-url";

import { uploadEditorImage } from "../use-media";
import { waitForComposition } from "./composition";
import {
  IMAGE_TRANSFER_REQUEST,
  IMAGE_TRANSFER_FEEDBACK,
  type ImageTransferRequest,
} from "./image-transfer";
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
  const active = useRef(new Map<string, ActiveUpload>());
  const committing = useRef(new Set<string>());
  const [displays, setDisplays] = useState<{ upload: ActiveUpload; snapshot: UploadSnapshot }[]>(
    [],
  );
  const [feedback, setFeedback] = useState("");
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

  const removeAnchor = useCallback(
    (id: string) => {
      if (!editor.isDestroyed)
        editor.view.dispatch(
          editor.state.tr.setMeta(imageUploadKey, { remove: id }).setMeta("addToHistory", false),
        );
    },
    [editor],
  );
  const insert = useCallback(
    (id: string, src: string, alt: string) => {
      if (!editor.isEditable) throw new Error("请等待文章保存完成。");
      // 使用事务当前的位置，保留用户上传期间新增的文字、光标及滚动位置。
      const tr = uploadImageTransaction(editor.state, id, src, alt);
      const restoreFocus = active.current.get(id)?.element.contains(document.activeElement);
      committing.current.add(id);
      try {
        editor.view.dispatch(tr);
        editor.view.dispatch(closeHistory(editor.state.tr));
      } finally {
        committing.current.delete(id);
      }
      if (restoreFocus) editor.commands.focus(null, { scrollIntoView: false });
    },
    [editor],
  );

  const beginUploads = useCallback(
    ({ entries, anchors }: ImageTransferRequest, attached = false) => {
      if (!entries.length || !editor.isEditable) return;
      setFeedback("");
      const uploads = entries.map(({ id, file }) => {
        const element = document.createElement("span");
        element.className = "post-image-upload-anchor";
        element.contentEditable = "false";
        const preview = URL.createObjectURL(file);
        const changed = () => {
          const upload = active.current.get(id);
          if (!upload) return;
          if (["done", "cancelled"].includes(upload.task.snapshot.status)) {
            const restoreFocus = upload.element.contains(document.activeElement);
            active.current.delete(id);
            removeAnchor(id);
            URL.revokeObjectURL(upload.preview);
            if (restoreFocus && !editor.isDestroyed)
              editor.commands.focus(null, { scrollIntoView: false });
          }
          onPendingChange(active.current.size > 0);
          setDisplays(
            Array.from(active.current.values(), (pendingUpload) => ({
              upload: pendingUpload,
              snapshot: { ...pendingUpload.task.snapshot },
            })),
          );
        };
        const task = new ImageUploadTask(
          file,
          uploadEditorImage,
          async (src, signal) => {
            await waitForComposition(editor.view, signal);
            signal.throwIfAborted();
            insert(id, src, file.name);
          },
          changed,
        );
        const upload = { id, task, element, preview };
        active.current.set(id, upload);
        return upload;
      });
      onPendingChange(true);
      const decorated = anchors.map((anchor) => ({
        ...anchor,
        element: active.current.get(anchor.id)!.element,
      }));
      editor.view.dispatch(
        editor.state.tr
          .setMeta(imageUploadKey, attached ? { attach: decorated } : { addMany: decorated })
          .setMeta("addToHistory", false),
      );
      for (const upload of uploads) void upload.task.start();
    },
    [editor, insert, onPendingChange, removeAnchor],
  );

  useEffect(() => {
    const request = ({ transaction }: { transaction: Editor["state"]["tr"] }) => {
      const message: string | undefined = transaction.getMeta(IMAGE_TRANSFER_FEEDBACK);
      if (message) setFeedback(message);
      const transferred: ImageTransferRequest | undefined =
        transaction.getMeta(IMAGE_TRANSFER_REQUEST);
      if (transferred) {
        beginUploads(transferred, true);
        return;
      }
      const fileRequest = transaction.getMeta(IMAGE_UPLOAD_REQUEST);
      const urlRequest = transaction.getMeta(IMAGE_URL_REQUEST);
      if ((!fileRequest && !urlRequest) || !editor.isEditable || editor.view.composing) return;
      if (fileRequest) {
        const anchor = target(editor, fileRequest.position);
        const running = Array.from(active.current.values()).find((upload) => {
          const pending = uploadAnchor(editor.state, upload.id);
          return anchor.replaceSrc && pending?.replaceSrc && pending.position === anchor.position;
        });
        if (running) {
          running.element.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
          return;
        }
        choice.current = anchor;
        if (input.current) input.current.multiple = !anchor.replaceSrc;
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
  }, [editor, beginUploads]);

  useEffect(() => {
    const uploads = active.current;
    const check = () => {
      for (const current of Array.from(uploads.values()))
        if (!committing.current.has(current.id) && !uploadAnchor(editor.state, current.id))
          current.task.cancel();
    };
    editor.on("transaction", check);
    return () => {
      editor.off("transaction", check);
      const remaining = Array.from(uploads.values());
      uploads.clear();
      for (const upload of remaining) {
        upload.task.cancel();
        URL.revokeObjectURL(upload.preview);
      }
    };
  }, [editor]);

  const closeUrl = () => {
    if (urlTarget) removeAnchor(urlTarget);
    setUrlTarget(null);
    editor.commands.focus(null, { scrollIntoView: false });
  };
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        aria-label="上传文章图片"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          const anchor = choice.current;
          event.target.value = "";
          choice.current = null;
          if (!anchor || !editor.isEditable) return;
          const images = files.filter((file) => file.type.startsWith("image/"));
          const entries = (anchor.replaceSrc ? images.slice(0, 1) : images).map((file, index) => ({
            id: index ? crypto.randomUUID() : anchor.id,
            file,
          }));
          beginUploads({ entries, anchors: entries.map(({ id }) => ({ ...anchor, id })) });
        }}
      />
      {displays.map(({ upload: current, snapshot }) =>
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
                {/* 重试隐藏时保留占位，避免双击重试的第二次点击落到取消按钮。 */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={snapshot.status !== "error"}
                  aria-hidden={snapshot.status !== "error"}
                  style={{ visibility: snapshot.status === "error" ? "visible" : "hidden" }}
                  onClick={() => void current.task.start()}
                >
                  <RotateCcw size={15} />
                  {snapshot.uploadedUrl ? "重试插入" : "重试上传"}
                </Button>
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
          current.id,
        ),
      )}
      {feedback && <output className="post-editor-action-status">{feedback}</output>}
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
