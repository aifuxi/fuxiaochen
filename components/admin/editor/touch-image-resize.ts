import { boundedImageSize } from "@/lib/posts/image-layout";

// 3.31.4 的公开 ResizableNodeView 未监听 touchend/touchcancel，且不清理 touchmove。
// 只适配它缺失的触屏生命周期；鼠标缩放继续使用官方实现，不读取私有成员。
export function installTouchImageResize(
  container: HTMLElement,
  viewport: HTMLElement,
  editable: () => boolean,
  commit: (width: number, height: number) => void,
  restore: () => void,
) {
  let gesture: {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    direction: string;
  } | null = null;
  const owner = container.ownerDocument;
  const detach = () => {
    owner.removeEventListener("touchmove", move);
    owner.removeEventListener("touchend", end);
    owner.removeEventListener("touchcancel", cancel);
    container.dataset.resizeState = "false";
  };
  const move = (event: TouchEvent) => {
    if (!gesture) return;
    const touch = Array.from(event.touches).find((item) => item.identifier === gesture?.id);
    if (!touch) return;
    event.preventDefault();
    const ratio = gesture.width / gesture.height;
    const dx = (touch.clientX - gesture.x) * (gesture.direction.includes("left") ? -1 : 1);
    const dy = (touch.clientY - gesture.y) * (gesture.direction.includes("top") ? -1 : 1);
    const delta = Math.abs(dx) >= Math.abs(dy * ratio) ? dx : dy * ratio;
    const width = Math.max(50, 50 * ratio, gesture.width + delta);
    const size = boundedImageSize(width, width / ratio);
    viewport.style.width = `${size.width}px`;
    viewport.style.height = "auto";
    viewport.style.aspectRatio = `${size.width} / ${size.height}`;
  };
  const end = (event: TouchEvent) => {
    if (
      !gesture ||
      !Array.from(event.changedTouches).some((touch) => touch.identifier === gesture?.id)
    )
      return;
    gesture = null;
    detach();
    if (editable()) commit(viewport.offsetWidth, viewport.offsetHeight);
    else restore();
  };
  const cancel = () => {
    if (!gesture) return;
    gesture = null;
    detach();
    restore();
  };
  const start = (event: TouchEvent) => {
    const handle =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-resize-handle]")
        : null;
    if (!handle || !container.contains(handle)) return;
    // 阻止进入安装版本未完成的 touch 分支，避免结束后仍然监听整页移动。
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!editable() || gesture || event.touches.length !== 1) return;
    const touch = event.touches[0];
    gesture = {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      width: viewport.offsetWidth,
      height: viewport.offsetHeight,
      direction: handle.dataset.resizeHandle ?? "bottom-right",
    };
    if (!gesture.width || !gesture.height) {
      gesture = null;
      return;
    }
    container.dataset.resizeState = "true";
    owner.addEventListener("touchmove", move, { passive: false });
    owner.addEventListener("touchend", end);
    owner.addEventListener("touchcancel", cancel);
  };
  container.addEventListener("touchstart", start, { capture: true, passive: false });
  return () => {
    cancel();
    detach();
    container.removeEventListener("touchstart", start, { capture: true });
  };
}
