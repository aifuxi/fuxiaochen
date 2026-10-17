// 上传完成不能在候选词尚未提交时修改正文；取消时同时解除等待与事件监听。
export function waitForComposition(
  view: { readonly composing: boolean; dom: EventTarget },
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  if (!view.composing) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    let frame = 0;
    const clean = () => {
      view.dom.removeEventListener("compositionend", ended);
      signal.removeEventListener("abort", abort);
      cancelAnimationFrame(frame);
    };
    const check = () => {
      if (signal.aborted) {
        abort();
        return;
      }
      if (view.composing) {
        frame = requestAnimationFrame(check);
        return;
      }
      clean();
      resolve();
    };
    const ended = () => {
      frame = requestAnimationFrame(check);
    };
    const abort = () => {
      clean();
      reject(new DOMException("上传已取消", "AbortError"));
    };
    view.dom.addEventListener("compositionend", ended, { once: true });
    signal.addEventListener("abort", abort, { once: true });
  });
}
