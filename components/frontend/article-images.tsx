"use client";

import type { ReactNode } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize,
  Ratio,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";

import type { ImageCrop } from "@/lib/posts/image-layout";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";
import { croppedImageStyle } from "@/lib/posts/image-layout";

import "./article-images.css";

export type PreviewImage = {
  src: string;
  alt: string;
  caption: string | null;
  crop: ImageCrop | null;
};

const ImagePreviewContext = createContext<
  ((index: number, source: HTMLAnchorElement) => void) | null
>(null);

export function ArticleImageLink({
  src,
  index,
  label,
  children,
}: {
  src: string;
  index: number;
  label: string;
  children: ReactNode;
}) {
  const open = useContext(ImagePreviewContext);
  return (
    <a
      className="site-article-image-link"
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      data-image-index={index}
      aria-label={label}
      onClick={(event) => {
        if (
          !open ||
          event.button !== 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        event.preventDefault();
        open(index, event.currentTarget);
      }}
    >
      {children}
    </a>
  );
}

function ImagePreview({
  image,
  index,
  total,
  previous,
  next,
}: {
  image: PreviewImage;
  index: number;
  total: number;
  previous: () => void;
  next: () => void;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [failed, setFailed] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  // 原位重置图片状态，保持工具栏 DOM 和键盘焦点，重复 URL 也各自从适配尺寸开始。
  if (currentImage !== image) {
    setCurrentImage(image);
    setNatural({ width: 0, height: 0 });
    setZoom(null);
    setRotation(0);
    setFailed(false);
  }
  const observeCanvas = useCallback((element: HTMLDivElement | null) => {
    canvas.current = element;
    if (!element) return undefined;
    const update = () => setBounds({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
      canvas.current = null;
    };
  }, []);
  const rotated = rotation % 180 !== 0;
  const width = natural.width * (image.crop?.width ?? 1);
  const height = natural.height * (image.crop?.height ?? 1);
  const fit =
    width && height && bounds.width && bounds.height
      ? Math.max(
          0.01,
          Math.min(
            1,
            (bounds.width - 32) / (rotated ? height : width),
            (bounds.height - 32) / (rotated ? width : height),
          ),
        )
      : 1;
  const scale = zoom ?? fit;
  const ready = width > 0 && !failed;
  const displayWidth = (rotated ? height : width) * scale;
  const displayHeight = (rotated ? width : height) * scale;
  useLayoutEffect(() => {
    const element = canvas.current;
    if (!element) return;
    element.scrollLeft = Math.max(0, (displayWidth + 32 - bounds.width) / 2);
    element.scrollTop = Math.max(0, (displayHeight + 32 - bounds.height) / 2);
  }, [displayWidth, displayHeight, bounds.width, bounds.height]);
  const resize = (value: number) => {
    setZoom(Math.max(0.1, Math.min(5, value)));
  };
  return (
    <>
      {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- 放大的图片保留键盘滚动入口。 */}
      <section
        className="site-image-preview-canvas"
        tabIndex={0}
        aria-label="图片预览画布"
        ref={observeCanvas}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0 || !ready) return;
          const element = event.currentTarget;
          if (
            element.scrollWidth <= element.clientWidth &&
            element.scrollHeight <= element.clientHeight
          )
            return;
          event.preventDefault();
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            left: element.scrollLeft,
            top: element.scrollTop,
          };
          element.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          event.currentTarget.scrollLeft = drag.current.left + drag.current.x - event.clientX;
          event.currentTarget.scrollTop = drag.current.top + drag.current.y - event.clientY;
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <div className="site-image-preview-center">
          <div
            className="site-image-preview-extent"
            style={
              ready
                ? {
                    width: displayWidth,
                    height: displayHeight,
                  }
                : undefined
            }
          >
            <span
              className="site-image-preview-frame"
              style={
                ready
                  ? {
                      width: width * scale,
                      height: height * scale,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    }
                  : undefined
              }
            >
              {/* oxlint-disable-next-line next/no-img-element -- 原图预览读取真实自然尺寸，不转码或重采样裁剪资源。 */}
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                draggable={false}
                data-crop={image.crop ? JSON.stringify(image.crop) : undefined}
                style={{
                  ...croppedImageStyle(image.crop),
                  visibility: ready ? "visible" : "hidden",
                }}
                onLoad={(event) =>
                  setNatural({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                }
                onError={() => setFailed(true)}
              />
            </span>
          </div>
        </div>
        {!ready && (
          <output className="site-image-preview-status">
            {failed ? "图片加载失败，可打开原图查看" : "图片加载中…"}
          </output>
        )}
      </section>
      {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
      <div className="site-image-preview-footer">
        {image.caption && <p className="site-image-preview-caption">{image.caption}</p>}
        <div className="site-image-preview-toolbar" aria-label="图片工具栏">
          <div className="site-image-preview-group">
            <Button
              variant="ghost"
              aria-label="上一张图片"
              focusableWhenDisabled
              disabled={index === 0}
              onClick={previous}
            >
              <ChevronLeft aria-hidden="true" size={20} />
            </Button>
            <span className="site-image-preview-count" aria-live="polite">
              {index + 1} / {total}
            </span>
            <Button
              variant="ghost"
              aria-label="下一张图片"
              focusableWhenDisabled
              disabled={index === total - 1}
              onClick={next}
            >
              <ChevronRight aria-hidden="true" size={20} />
            </Button>
          </div>
          <div className="site-image-preview-group">
            <Button
              variant="ghost"
              aria-label="缩小图片"
              focusableWhenDisabled
              disabled={!ready || scale <= 0.1}
              onClick={() => resize(scale - 0.1)}
            >
              <ZoomOut aria-hidden="true" size={20} />
            </Button>
            <span className="site-image-preview-count" aria-live="polite">
              {ready ? `${Math.round(scale * 100)}%` : "—"}
            </span>
            <Button
              variant="ghost"
              aria-label="放大图片"
              focusableWhenDisabled
              disabled={!ready || scale >= 5}
              onClick={() => resize(scale + 0.1)}
            >
              <ZoomIn aria-hidden="true" size={20} />
            </Button>
          </div>
          <div className="site-image-preview-group">
            <Button
              variant="ghost"
              aria-label="适应窗口"
              title="适应窗口"
              focusableWhenDisabled
              disabled={!ready}
              onClick={() => {
                setZoom(null);
              }}
            >
              <Maximize aria-hidden="true" size={20} />
            </Button>
            <Button
              variant="ghost"
              aria-label="原始尺寸"
              title="原始尺寸"
              focusableWhenDisabled
              disabled={!ready}
              onClick={() => resize(1)}
            >
              <Ratio aria-hidden="true" size={20} />
            </Button>
            <Button
              variant="ghost"
              aria-label="旋转图片"
              title="旋转图片"
              focusableWhenDisabled
              disabled={!ready}
              onClick={() => {
                setRotation((value) => (value + 90) % 360);
              }}
            >
              <RotateCw aria-hidden="true" size={20} />
            </Button>
            <a
              className="site-image-preview-original"
              href={image.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="在新标签页查看原图"
              title="查看原图"
            >
              <ExternalLink aria-hidden="true" size={20} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export function ArticleImages({
  images,
  children,
}: {
  images: PreviewImage[];
  children: ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const source = useRef<HTMLAnchorElement | null>(null);
  const current = index === null ? undefined : images[index];
  return (
    <>
      <ImagePreviewContext
        value={(next, target) => {
          source.current = target;
          setIndex(next);
        }}
      >
        <div className="site-markdown article-prose">{children}</div>
      </ImagePreviewContext>
      <Dialog
        open={Boolean(current)}
        onOpenChange={(open) => {
          if (!open) setIndex(null);
        }}
      >
        <DialogPortal>
          <DialogBackdrop className="site-image-preview-backdrop" />
          <DialogViewport className="site-image-preview-viewport">
            <DialogPopup
              className="site-image-preview"
              finalFocus={source}
              onKeyDown={(event) => {
                if (index === null || event.altKey || event.ctrlKey || event.metaKey) return;
                if (event.key === "ArrowLeft" && index > 0) {
                  event.preventDefault();
                  setIndex(index - 1);
                }
                if (event.key === "ArrowRight" && index < images.length - 1) {
                  event.preventDefault();
                  setIndex(index + 1);
                }
              }}
            >
              <DialogTitle className="sr-only">图片预览</DialogTitle>
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    className="site-image-preview-close"
                    aria-label="关闭图片预览"
                  />
                }
              >
                <X aria-hidden="true" size={22} />
              </DialogClose>
              {current && index !== null && (
                <ImagePreview
                  image={current}
                  index={index}
                  total={images.length}
                  previous={() => setIndex(Math.max(0, index - 1))}
                  next={() => setIndex(Math.min(images.length - 1, index + 1))}
                />
              )}
            </DialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>
    </>
  );
}
