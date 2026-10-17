"use client";

import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { NodeViewProps } from "@tiptap/react";
import type { PointerEvent, KeyboardEvent } from "react";

import { ResizableNodeView } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import { DecorationSet } from "@tiptap/pm/view";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Check, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArticleImage } from "@/lib/posts/image";
import {
  croppedImageStyle,
  boundedImageSize,
  fullImageCrop,
  imageCrop,
  IMAGE_ACTION_META,
  IMAGE_UI_META,
  type ImageCrop,
} from "@/lib/posts/image-layout";

const directions = [
  "top-left",
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
];
const directionNames = ["左上角", "上边", "右上角", "右边", "右下角", "下边", "左下角", "左边"];
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const moveCrop = (direction: string, start: ImageCrop, dx: number, dy: number) => {
  let left = start.left,
    top = start.top,
    right = start.left + start.width,
    bottom = start.top + start.height;
  if (direction === "move") {
    left = clamp(left + dx, 0, 1 - start.width);
    top = clamp(top + dy, 0, 1 - start.height);
    return { ...start, left, top };
  }
  if (direction.includes("left")) left = clamp(left + dx, 0, right - 0.01);
  if (direction.includes("right")) right = clamp(right + dx, left + 0.01, 1);
  if (direction.includes("top")) top = clamp(top + dy, 0, bottom - 0.01);
  if (direction.includes("bottom")) bottom = clamp(bottom + dy, top + 0.01, 1);
  return { left, top, width: right - left, height: bottom - top };
};

function ImageView({ node, editor, getPos, updateAttributes, selected }: NodeViewProps) {
  const shell = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLSpanElement>(null);
  const nativeImage = useRef<HTMLImageElement | null>(null);
  const resize = useRef<ResizableNodeView | null>(null);
  const latestNode = useRef(node);
  useEffect(() => {
    latestNode.current = node;
  }, [node]);
  const captionInput = useRef<HTMLInputElement>(null);
  const cropFrame = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [cropping, setCropping] = useState(false);
  const [captionOpen, setCaptionOpen] = useState(false);
  const [captionFocused, setCaptionFocused] = useState(false);
  const [draft, setDraft] = useState<ImageCrop>(fullImageCrop);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const drag = useRef<{ x: number; y: number; crop: ImageCrop; direction: string } | null>(null);
  const [availableWidth, setAvailableWidth] = useState(320);
  const savedCrop = imageCrop(node.attrs.crop) ?? fullImageCrop;
  const originalWidth = natural.width || node.attrs.width || 320;
  const originalHeight = natural.height || node.attrs.height || 240;
  const displayWidth =
    node.attrs.width || Math.min(originalWidth * savedCrop.width, availableWidth);
  const displayHeight =
    node.attrs.height ||
    (displayWidth * originalHeight * savedCrop.height) / (originalWidth * savedCrop.width);
  const sourceWidth = displayWidth / savedCrop.width;
  const sourceHeight = displayHeight / savedCrop.height;
  const applyDisplay = useCallback(
    (next: ProseMirrorNode) => {
      const image = nativeImage.current;
      const viewport = resize.current?.element;
      if (!image || !viewport) return;
      const currentCrop = imageCrop(next.attrs.crop) ?? fullImageCrop;
      const width =
        next.attrs.width ||
        Math.min((image.naturalWidth || 320) * currentCrop.width, editor.view.dom.clientWidth);
      const height =
        next.attrs.height ||
        (width * (image.naturalHeight || 240) * currentCrop.height) /
          ((image.naturalWidth || 320) * currentCrop.width);
      viewport.style.width = `${width}px`;
      viewport.style.height = "auto";
      viewport.style.aspectRatio = `${width} / ${height}`;
      Object.assign(image.style, croppedImageStyle(currentCrop));
      image.alt = next.attrs.alt ?? "";
      image.title = next.attrs.title ?? "";
      if (image.getAttribute("src") !== next.attrs.src) image.src = next.attrs.src;
    },
    [editor],
  );
  useEffect(() => {
    const host = shell.current;
    if (!host) return undefined;
    const viewport = document.createElement("span");
    viewport.className = "article-image-viewport";
    const image = document.createElement("img");
    image.draggable = false;
    viewport.append(image);
    nativeImage.current = image;
    // 使用安装版本公开的 ResizableNodeView；尺寸同步和图注由本站视图负责。
    const view = new ResizableNodeView({
      element: viewport,
      editor,
      node: latestNode.current,
      getPos,
      onResize: (width, height) => {
        viewport.style.width = `${width}px`;
        viewport.style.height = "auto";
        viewport.style.aspectRatio = `${width} / ${height}`;
      },
      onCommit: (width, height) => {
        const position = getPos();
        if (position === undefined || !editor.isEditable) return;
        editor
          .chain()
          .setNodeSelection(position)
          .updateAttributes("image", {
            width: clamp(Math.round(width), 1, 10_000),
            height: clamp(Math.round(height), 1, 10_000),
          })
          .run();
      },
      onUpdate: (next) => {
        applyDisplay(next);
        return true;
      },
      options: {
        directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
        min: { width: 50, height: 50 },
        preserveAspectRatio: true,
      },
    });
    resize.current = view;
    host.append(view.dom);
    const loaded = () => {
      setNatural({ width: image.naturalWidth, height: image.naturalHeight });
      applyDisplay(latestNode.current);
    };
    image.addEventListener("load", loaded);
    applyDisplay(latestNode.current);
    const observer = new ResizeObserver(() => {
      setAvailableWidth(editor.view.dom.clientWidth);
      applyDisplay(latestNode.current);
    });
    observer.observe(editor.view.dom);
    return () => {
      observer.disconnect();
      image.removeEventListener("load", loaded);
      view.destroy();
      view.dom.remove();
      nativeImage.current = null;
      resize.current = null;
    };
  }, [editor, getPos, applyDisplay]);
  useEffect(() => {
    resize.current?.update(node, [], DecorationSet.empty);
  }, [node]);
  useEffect(() => {
    const action = ({ transaction }: { transaction: Parameters<typeof closeHistory>[0] }) => {
      const command = transaction.getMeta(IMAGE_ACTION_META);
      if (!command || command.position !== getPos()) return;
      if (command.action === "crop") {
        setDraft(imageCrop(latestNode.current.attrs.crop) ?? fullImageCrop);
        setCropping(true);
      } else if (command.action === "caption") {
        setCaptionOpen(true);
        requestAnimationFrame(() => captionInput.current?.focus());
      }
    };
    editor.on("transaction", action);
    return () => {
      editor.off("transaction", action);
    };
  }, [editor, getPos]);
  useEffect(() => {
    editor.view.dispatch(editor.state.tr.setMeta(IMAGE_UI_META, cropping || captionFocused));
    return () => {
      if (!editor.isDestroyed) editor.view.dispatch(editor.state.tr.setMeta(IMAGE_UI_META, false));
    };
  }, [editor, cropping, captionFocused]);
  const finishCrop = useCallback(
    (apply: boolean, focus = true) => {
      const position = getPos();
      if (
        apply &&
        position !== undefined &&
        editor.isEditable &&
        editor.state.doc.nodeAt(position)?.attrs.src === node.attrs.src
      ) {
        const current = draftRef.current;
        const full =
          current.left === 0 && current.top === 0 && current.width === 1 && current.height === 1;
        editor.view.dispatch(closeHistory(editor.state.tr));
        editor
          .chain()
          .setNodeSelection(position)
          .updateAttributes("image", {
            crop: full ? null : current,
            ...boundedImageSize(sourceWidth * current.width, sourceHeight * current.height),
          })
          .run();
        editor.view.dispatch(closeHistory(editor.state.tr));
      }
      setCropping(false);
      if (focus)
        requestAnimationFrame(() => {
          // 先卸载裁剪控件，再恢复图片选区，避免浏览器把已移除控件的选区落回段落。
          const currentPosition = getPos();
          if (
            !editor.isDestroyed &&
            currentPosition !== undefined &&
            editor.state.doc.nodeAt(currentPosition)?.type.name === "image"
          )
            editor
              .chain()
              .setNodeSelection(currentPosition)
              .focus(null, { scrollIntoView: false })
              .run();
        });
    },
    [editor, getPos, node.attrs.src, sourceWidth, sourceHeight],
  );
  useEffect(() => {
    if (!cropping) return undefined;
    cropFrame.current?.querySelector("button")?.focus({ preventScroll: true });
    const outside = (event: globalThis.PointerEvent) => {
      if (event.target instanceof globalThis.Node && !root.current?.contains(event.target))
        finishCrop(true, false);
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [cropping, finishCrop]);
  const cropKeys = (event: KeyboardEvent<HTMLElement>) => {
    const cancelHistory = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z";
    if (!["Enter", "Escape"].includes(event.key) && !cancelHistory) return false;
    event.preventDefault();
    event.stopPropagation();
    finishCrop(event.key === "Enter");
    return true;
  };
  const startDrag = (event: PointerEvent<HTMLElement>, direction: string) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, crop: draftRef.current, direction };
  };
  const sourceRatio =
    natural.width && natural.height ? natural.width / natural.height : sourceWidth / sourceHeight;
  return (
    <NodeViewWrapper
      as="span"
      className="post-image-node"
      ref={root}
      contentEditable={false}
      data-selected={selected}
    >
      <span
        ref={shell}
        className="post-image-shell"
        style={cropping ? { display: "none" } : undefined}
      />
      {cropping && (
        <div className="post-image-crop" style={{ width: sourceWidth, aspectRatio: sourceRatio }}>
          <div className="post-image-crop-actions" role="toolbar" aria-label="裁剪图片">
            <Button
              type="button"
              variant="ghost"
              className="post-editor-icon"
              aria-label="取消裁剪"
              onClick={() => finishCrop(false)}
            >
              <X size={17} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="post-editor-icon"
              aria-label="完成裁剪"
              onClick={() => finishCrop(true)}
            >
              <Check size={17} />
            </Button>
          </div>
          {/* 原始图片保持不变，遮罩只表示待保存的相对裁剪区域。 */}
          {/* oxlint-disable-next-line nextjs/no-img-element -- NodeView 需要直接读取原始图片几何尺寸。 */}
          <img src={node.attrs.src} alt={node.attrs.alt ?? ""} draggable={false} />
          <div
            ref={cropFrame}
            className="post-image-crop-frame"
            onPointerMove={(event) => {
              if (!drag.current || !cropFrame.current) return;
              const rect = cropFrame.current.getBoundingClientRect();
              setDraft(
                moveCrop(
                  drag.current.direction,
                  drag.current.crop,
                  (event.clientX - drag.current.x) / rect.width,
                  (event.clientY - drag.current.y) / rect.height,
                ),
              );
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <div
              className="post-image-crop-selection"
              style={{
                left: `${draft.left * 100}%`,
                top: `${draft.top * 100}%`,
                width: `${draft.width * 100}%`,
                height: `${draft.height * 100}%`,
              }}
            >
              <Button
                type="button"
                variant="ghost"
                className="post-image-crop-move"
                aria-label="移动裁剪区域"
                onPointerDown={(event) => startDrag(event, "move")}
                onKeyDown={cropKeys}
              />
              {directions.map((direction, index) => (
                <Button
                  key={direction}
                  type="button"
                  variant="ghost"
                  className="post-image-crop-handle"
                  data-direction={direction}
                  aria-label={`裁剪${directionNames[index]}`}
                  onPointerDown={(event) => startDrag(event, direction)}
                  onKeyDown={(event) => {
                    if (cropKeys(event)) return;
                    const step = event.shiftKey ? 0.1 : 0.01;
                    if (!event.key.startsWith("Arrow")) return;
                    event.preventDefault();
                    event.stopPropagation();
                    setDraft(
                      moveCrop(
                        direction,
                        draftRef.current,
                        event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0,
                        event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0,
                      ),
                    );
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {!cropping && (captionOpen || node.attrs.caption !== null) && (
        <Input
          ref={captionInput}
          className="post-image-caption"
          aria-label="图片描述"
          placeholder="输入图片描述"
          value={node.attrs.caption ?? ""}
          maxLength={2000}
          disabled={!editor.isEditable}
          onFocus={() => setCaptionFocused(true)}
          onBlur={() => setCaptionFocused(false)}
          onContextMenu={(event) => event.stopPropagation()}
          onChange={(event) => {
            if (editor.isEditable) updateAttributes({ caption: event.target.value });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              captionInput.current?.blur();
              requestAnimationFrame(() => {
                const position = getPos();
                if (position !== undefined && !editor.isDestroyed)
                  editor
                    .chain()
                    .setNodeSelection(position)
                    .focus(null, { scrollIntoView: false })
                    .run();
              });
            }
          }}
        />
      )}
    </NodeViewWrapper>
  );
}

export const EditorImage = ArticleImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
