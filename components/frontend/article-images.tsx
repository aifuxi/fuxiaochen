"use client";

import type { ComponentProps, ReactNode } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { croppedImageStyle } from "@/lib/posts/image-layout";
import { previewFitScale, previewZoomScale } from "@/lib/posts/image-preview";

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

function PreviewTool({
  label,
  children,
  ...props
}: ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="site-image-preview-tool"
            aria-label={label}
            focusableWhenDisabled
            {...props}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent
        className="site-image-preview-tooltip"
        positionerClassName="site-image-preview-tooltip-positioner"
        sideOffset={8}
      >
        {label}
      </TooltipContent>
    </Tooltip>
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
  const canvas = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const dragged = useRef(false);
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
  const observeCanvas = useCallback((element: HTMLButtonElement | null) => {
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
  const fit = previewFitScale(
    rotated ? height : width,
    rotated ? width : height,
    bounds.width,
    bounds.height,
  );
  const scale = zoom ?? fit;
  const ready = width > 0 && !failed;
  const displayWidth = (rotated ? height : width) * scale;
  const displayHeight = (rotated ? width : height) * scale;
  useLayoutEffect(() => {
    const element = canvas.current;
    if (!element) return;
    element.scrollLeft = Math.max(0, (displayWidth - bounds.width) / 2);
    element.scrollTop = Math.max(0, (displayHeight - bounds.height) / 2);
  }, [displayWidth, displayHeight, bounds.width, bounds.height]);
  const resize = (value: number) => {
    setZoom(previewZoomScale(value));
  };
  return (
    <>
      <DialogClose
        className="site-image-preview-canvas"
        aria-label={`图片预览：${image.alt || `第 ${index + 1} 张图片`}，点击关闭`}
        ref={observeCanvas}
        onClick={(event) => {
          // 拖动结束产生的 click 不关闭预览；普通图片／空白点击与飞书一致关闭。
          if (dragged.current) {
            event.preventDefault();
            event.preventBaseUIHandler();
            dragged.current = false;
          }
        }}
        onPointerDown={(event) => {
          dragged.current = false;
          if (event.button !== 0) return;
          const element = event.currentTarget;
          if (event.pointerType === "mouse") event.preventDefault();
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            left: element.scrollLeft,
            top: element.scrollTop,
          };
          if (event.pointerType === "mouse") element.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          if (Math.hypot(event.clientX - drag.current.x, event.clientY - drag.current.y) >= 4)
            dragged.current = true;
          if (event.pointerType !== "mouse") return;
          event.currentTarget.scrollLeft = drag.current.left + drag.current.x - event.clientX;
          event.currentTarget.scrollTop = drag.current.top + drag.current.y - event.clientY;
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
          dragged.current = true;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <span className="site-image-preview-center">
          <span
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
          </span>
        </span>
        {!ready && (
          <output className="site-image-preview-status">
            {failed ? "图片加载失败，可打开原图查看" : "图片加载中…"}
          </output>
        )}
      </DialogClose>
      <div className="site-image-preview-footer">
        {image.caption && <p className="site-image-preview-caption">{image.caption}</p>}
        <TooltipProvider delay={250}>
          <div className="site-image-preview-toolbar" aria-label="图片工具栏">
            <div className="site-image-preview-group">
              <PreviewTool label="上一张图片" disabled={index === 0} onClick={previous}>
                <ChevronLeft aria-hidden="true" size={24} strokeWidth={1.5} />
              </PreviewTool>
              <span className="site-image-preview-count" aria-live="polite">
                {index + 1}/{total}
              </span>
              <PreviewTool label="下一张图片" disabled={index === total - 1} onClick={next}>
                <ChevronRight aria-hidden="true" size={24} strokeWidth={1.5} />
              </PreviewTool>
            </div>
            <div className="site-image-preview-group">
              <PreviewTool
                label="缩小图片"
                disabled={!ready || scale <= 0.1}
                onClick={() => resize(scale - 0.1)}
              >
                <ZoomOut aria-hidden="true" size={24} strokeWidth={1.5} />
              </PreviewTool>
              <span className="site-image-preview-scale" aria-live="polite">
                {ready ? `${Math.round(scale * 100)}%` : "—"}
              </span>
              <PreviewTool
                label="放大图片"
                disabled={!ready || scale >= 5}
                onClick={() => resize(scale + 0.1)}
              >
                <ZoomIn aria-hidden="true" size={24} strokeWidth={1.5} />
              </PreviewTool>
              <PreviewTool
                label={scale === 1 ? "适应窗口" : "原始尺寸"}
                disabled={!ready}
                onClick={() => {
                  if (scale === 1) setZoom(null);
                  else resize(1);
                }}
              >
                {scale === 1 ? (
                  <Maximize aria-hidden="true" size={24} strokeWidth={1.5} />
                ) : (
                  <span className="site-image-preview-native-size" aria-hidden="true">
                    1:1
                  </span>
                )}
              </PreviewTool>
            </div>
            <div className="site-image-preview-group">
              <PreviewTool
                label="旋转图片"
                disabled={!ready}
                onClick={() => setRotation((value) => (value + 90) % 360)}
              >
                <RotateCw aria-hidden="true" size={24} strokeWidth={1.5} />
              </PreviewTool>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <a
                      className="site-image-preview-original"
                      href={image.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="在新标签页查看原图"
                    >
                      <ExternalLink aria-hidden="true" size={24} strokeWidth={1.5} />
                    </a>
                  }
                />
                <TooltipContent
                  className="site-image-preview-tooltip"
                  positionerClassName="site-image-preview-tooltip-positioner"
                  sideOffset={8}
                >
                  查看原图
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
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
  const [controlsVisible, setControlsVisible] = useState(true);
  const source = useRef<HTMLAnchorElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearIdle = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = null;
  }, []);
  const showControls = () => {
    clearIdle();
    setControlsVisible(true);
  };
  useEffect(() => clearIdle, [clearIdle]);
  const current = index === null ? undefined : images[index];
  return (
    <>
      <ImagePreviewContext
        value={(next, target) => {
          showControls();
          source.current = target;
          setIndex(next);
        }}
      >
        <div className="site-markdown article-prose">{children}</div>
      </ImagePreviewContext>
      <Dialog
        open={Boolean(current)}
        onOpenChange={(open) => {
          if (!open) {
            clearIdle();
            setIndex(null);
          }
        }}
      >
        <DialogPortal>
          <DialogBackdrop className="site-image-preview-backdrop" />
          <DialogViewport className="site-image-preview-viewport">
            <DialogPopup
              className="site-image-preview"
              ref={popup}
              data-controls-visible={controlsVisible}
              initialFocus={() =>
                source.current?.matches(":focus-visible") ? closeButton.current : popup.current
              }
              finalFocus={source}
              onFocusCapture={showControls}
              onKeyDownCapture={(event) => {
                showControls();
                // 媒体预览优先处理 Escape，避免 Tooltip 只关闭气泡而留下预览。
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  clearIdle();
                  setIndex(null);
                }
              }}
              onPointerMove={(event) => {
                showControls();
                if (
                  event.pointerType !== "mouse" ||
                  !window.matchMedia("(hover: hover) and (pointer: fine)").matches
                )
                  return;
                if (
                  event.currentTarget.querySelector(
                    ".site-image-preview-footer:hover, .site-image-preview-footer :focus-visible, .site-image-preview-close:hover, .site-image-preview-close:focus-visible",
                  )
                )
                  return;
                idle.current = setTimeout(() => setControlsVisible(false), 1500);
              }}
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
                ref={closeButton}
                render={
                  <Button
                    variant="ghost"
                    className="site-image-preview-close"
                    aria-label="关闭图片预览"
                  />
                }
              >
                <X aria-hidden="true" size={24} strokeWidth={1.5} />
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
