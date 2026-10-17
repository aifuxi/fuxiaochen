import { getSchema } from "@tiptap/core";
import { history, undo, redo } from "@tiptap/pm/history";
import { EditorState } from "@tiptap/pm/state";
import assert from "node:assert/strict";
import { test } from "node:test";

import { waitForComposition } from "../components/admin/editor/composition";
import {
  ImageUploadTask,
  imageUploadKey,
  imageUploadPlugin,
  uploadAnchor,
  uploadImageTransaction,
} from "../components/admin/editor/image-upload-state";
import { installTouchImageResize } from "../components/admin/editor/touch-image-resize";
import { contentExtensions } from "../lib/posts/content-extensions";
import { serializeDocument } from "../lib/posts/document";

const file = new File(["test-image"], "测试图片.png", { type: "image/png" });
const url = "https://images.example/test.png";
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
};

void test("断网失败后重试只插入一次，连续点击重试只发一个请求", async () => {
  const first = deferred<string>(),
    retry = deferred<string>();
  let requests = 0;
  const inserted: string[] = [];
  const task = new ImageUploadTask(
    file,
    () => (++requests === 1 ? first.promise : retry.promise),
    (src) => {
      inserted.push(src);
    },
    () => {},
  );
  const attempt = task.start();
  await task.start();
  assert.equal(requests, 1);
  first.reject(new Error("网络已断开"));
  await attempt;
  assert.equal(task.snapshot.status, "error");
  assert.equal(inserted.length, 0);
  const again = task.start();
  await task.start();
  retry.resolve(url);
  await again;
  await task.start();
  assert.equal(requests, 2);
  assert.deepEqual(inserted, [url]);
});

void test("取消后晚到的成功、进度及重试都不会插图；新任务仍能正常上传", async () => {
  const pending = deferred<string>();
  let signal!: AbortSignal, progress!: (value: number) => void;
  const inserted: string[] = [];
  const task = new ImageUploadTask(
    file,
    (_file, current, report) => {
      signal = current;
      progress = report;
      return pending.promise;
    },
    (src) => {
      inserted.push(src);
    },
    () => {},
  );
  const attempt = task.start();
  task.cancel();
  assert.equal(signal.aborted, true);
  progress(100);
  pending.resolve(url);
  await attempt;
  await task.start();
  assert.equal(task.snapshot.status, "cancelled");
  assert.equal(inserted.length, 0);
  const replacement = new ImageUploadTask(
    file,
    async () => url,
    (src) => {
      inserted.push(src);
    },
    () => {},
  );
  await replacement.start();
  assert.deepEqual(inserted, [url]);
});

void test("上传成功而插入失败时复用 URL，不重新上传文件", async () => {
  let uploads = 0,
    inserts = 0;
  const task = new ImageUploadTask(
    file,
    async () => {
      uploads++;
      return url;
    },
    () => {
      if (++inserts === 1) throw new Error("正文暂不可编辑");
    },
    () => {},
  );
  await task.start();
  assert.equal(task.snapshot.status, "error");
  assert.equal(task.snapshot.uploadedUrl, url);
  await task.start();
  assert.equal(task.snapshot.status, "done");
  assert.equal(uploads, 1);
  assert.equal(inserts, 2);
});

const schema = getSchema(contentExtensions());
const paragraph = (text: string) =>
  schema.nodes.paragraph.create(null, text ? schema.text(text) : null);
const stateWithAnchor = (replace = false) => {
  const doc = schema.nodes.doc.create(
    null,
    replace
      ? [
          schema.nodes.paragraph.create(null, schema.nodes.image.create({ src: url })),
          paragraph("后文"),
        ]
      : [paragraph("保留正文"), paragraph("继续输入")],
  );
  let state = EditorState.create({ schema, doc, plugins: [history(), imageUploadPlugin()] });
  state = state.apply(
    state.tr
      .setMeta(imageUploadKey, {
        add: { id: "test", position: replace ? 1 : 8, replaceSrc: replace ? url : undefined },
      })
      .setMeta("addToHistory", false),
  );
  return state;
};

void test("上传锚点随输入和撤销重做移动，不进入正文或历史", () => {
  let state = stateWithAnchor();
  const before = serializeDocument(state.doc.toJSON());
  assert.doesNotMatch(before, /test|upload|blob:/);
  const original = uploadAnchor(state, "test")!.position;
  state = state.apply(state.tr.insertText("新增中文", 1));
  assert.equal(uploadAnchor(state, "test")?.position, original + 4);
  assert.equal(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
    true,
  );
  assert.equal(uploadAnchor(state, "test")?.position, original);
  assert.equal(serializeDocument(state.doc.toJSON()), before);
  assert.equal(
    redo(state, (tr) => {
      state = state.apply(tr);
    }),
    true,
  );
  assert.match(state.doc.textContent, /新增中文保留正文/);
});

void test("图片独占段落，文字中插入保留两侧内容且可单独撤销", () => {
  let state = stateWithAnchor();
  state = state.apply(
    state.tr
      .setMeta(imageUploadKey, { add: { id: "middle", position: 3 } })
      .setMeta("addToHistory", false),
  );
  const before = state.doc;
  state = state.apply(uploadImageTransaction(state, "middle", url, "替代文字"));
  assert.equal(state.doc.textContent, before.textContent);
  const blocks = Array.from({ length: state.doc.childCount }, (_, index) => state.doc.child(index));
  const images = blocks.filter((block) => block.firstChild?.type.name === "image");
  assert.equal(images.length, 1);
  assert.equal(images[0].childCount, 1);
  assert.equal(images[0].attrs.textAlign, "center");
  assert.equal(uploadAnchor(state, "middle"), undefined);
  assert.equal(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
    true,
  );
  assert.equal(state.doc.eq(before), true);
  // 撤销只恢复文档，不重新开启已经完成的上传任务。
  assert.equal(uploadAnchor(state, "middle"), undefined);
});

void test("整篇替换和删除目标图使锚点失效，晚到的上传不能恢复旧内容", () => {
  let state = stateWithAnchor();
  state = state.apply(state.tr.replaceWith(0, state.doc.content.size, paragraph("新的正文")));
  assert.equal(uploadAnchor(state, "test"), undefined);
  assert.equal(state.doc.textContent, "新的正文");
  state = stateWithAnchor(true);
  state = state.apply(state.tr.delete(1, 2));
  assert.equal(uploadAnchor(state, "test"), undefined);
  assert.equal(state.doc.textContent, "后文");
});

void test("替换上传时在图片前输入会映射到原图，更换原图后不覆盖新图", () => {
  let state = stateWithAnchor(true);
  state = state.apply(state.tr.insertText("前文", 1));
  assert.equal(uploadAnchor(state, "test")?.position, 3);
  state = state.apply(
    state.tr.setNodeMarkup(3, undefined, { src: "https://images.example/new.png" }),
  );
  assert.equal(uploadAnchor(state, "test"), undefined);
});

void test("组合输入期间等待提交，取消解除等待且不插图", async (t) => {
  const originalFrame = Object.getOwnPropertyDescriptor(globalThis, "requestAnimationFrame");
  const originalCancel = Object.getOwnPropertyDescriptor(globalThis, "cancelAnimationFrame");
  Object.defineProperty(globalThis, "requestAnimationFrame", {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      queueMicrotask(() => callback(0));
      return 1;
    },
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    configurable: true,
    value: () => {},
  });
  t.after(() => {
    if (originalFrame) Object.defineProperty(globalThis, "requestAnimationFrame", originalFrame);
    else Reflect.deleteProperty(globalThis, "requestAnimationFrame");
    if (originalCancel) Object.defineProperty(globalThis, "cancelAnimationFrame", originalCancel);
    else Reflect.deleteProperty(globalThis, "cancelAnimationFrame");
  });
  const dom = new EventTarget();
  const view = { composing: true, dom };
  let inserted = 0;
  const task = new ImageUploadTask(
    file,
    async () => url,
    async (_src, signal) => {
      await waitForComposition(view, signal);
      signal.throwIfAborted();
      inserted++;
    },
    () => {},
  );
  const attempt = task.start();
  await Promise.resolve();
  assert.equal(inserted, 0);
  view.composing = false;
  dom.dispatchEvent(new Event("compositionend"));
  await attempt;
  assert.equal(inserted, 1);
  view.composing = true;
  const cancelled = new ImageUploadTask(
    file,
    async () => url,
    async (_src, signal) => {
      await waitForComposition(view, signal);
      signal.throwIfAborted();
      inserted++;
    },
    () => {},
  );
  const pending = cancelled.start();
  await Promise.resolve();
  cancelled.cancel();
  await pending;
  view.composing = false;
  dom.dispatchEvent(new Event("compositionend"));
  await Promise.resolve();
  assert.equal(inserted, 1);
});

const touch = (type: string, x: number, y: number) => {
  const event = new Event(type, { cancelable: true });
  const points = [{ identifier: 1, clientX: x, clientY: y }];
  Object.assign(event, { touches: type === "touchend" ? [] : points, changedTouches: points });
  return event;
};

// 传输和事件边界测试，不把合成 TouchEvent 记为真实设备触屏验收。
void test("触屏缩放仅在 touchend 提交一次，touchcancel 还原且卸载后不再响应", (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "Element");
  class TestElement extends EventTarget {
    ownerDocument = new EventTarget();
    dataset: Record<string, string> = { resizeHandle: "bottom-right" };
    style = { width: "200px", height: "auto", aspectRatio: "200 / 100" };
    get offsetWidth() {
      return parseFloat(this.style.width);
    }
    get offsetHeight() {
      const [width, height] = this.style.aspectRatio.split(" / ").map(Number);
      return (this.offsetWidth * height) / width;
    }
    closest() {
      return this;
    }
    contains() {
      return true;
    }
  }
  Object.defineProperty(globalThis, "Element", { configurable: true, value: TestElement });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "Element", original);
    else Reflect.deleteProperty(globalThis, "Element");
  });
  const container = new TestElement(),
    viewport = new TestElement();
  const sizes: number[][] = [];
  let restores = 0;
  const remove = installTouchImageResize(
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Node 最小 DOM 替身仅用于事件生命周期断言，不替代真实设备验收。
    container as unknown as HTMLElement,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- 替身仅提供缩放适配器实际读取的几何属性。
    viewport as unknown as HTMLElement,
    () => true,
    (width, height) => {
      sizes.push([width, height]);
    },
    () => {
      restores++;
      viewport.style.width = "200px";
    },
  );
  container.dispatchEvent(touch("touchstart", 0, 0));
  container.ownerDocument.dispatchEvent(touch("touchmove", 60, 30));
  assert.equal(viewport.offsetWidth, 260);
  assert.deepEqual(sizes, []);
  container.ownerDocument.dispatchEvent(touch("touchend", 60, 30));
  container.ownerDocument.dispatchEvent(touch("touchend", 60, 30));
  assert.deepEqual(sizes, [[260, 130]]);
  container.dispatchEvent(touch("touchstart", 0, 0));
  container.ownerDocument.dispatchEvent(touch("touchmove", 40, 20));
  container.ownerDocument.dispatchEvent(touch("touchcancel", 40, 20));
  assert.equal(restores, 1);
  assert.equal(viewport.offsetWidth, 200);
  remove();
  container.dispatchEvent(touch("touchstart", 0, 0));
  container.ownerDocument.dispatchEvent(touch("touchmove", 80, 40));
  assert.equal(viewport.offsetWidth, 200);
  assert.deepEqual(sizes, [[260, 130]]);
});
