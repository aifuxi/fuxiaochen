import type { EditorView } from "@tiptap/pm/view";

import { getSchema } from "@tiptap/core";
import { history, undo, redo } from "@tiptap/pm/history";
import { Slice } from "@tiptap/pm/model";
import { EditorState, TextSelection } from "@tiptap/pm/state";
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  imageTransferPlugin,
  imageTransferTransaction,
  transferImageFiles,
  IMAGE_TRANSFER_FEEDBACK,
} from "../components/admin/editor/image-transfer";
import {
  imageUploadPlugin,
  imageUploadKey,
  uploadAnchor,
  uploadImageTransaction,
} from "../components/admin/editor/image-upload-state";
import { contentExtensions } from "../lib/posts/content-extensions";
import { serializeDocument } from "../lib/posts/document";

const schema = getSchema(contentExtensions());
const file = (name: string) => new File([name], name, { type: "image/png" });
const entries = [
  { id: "first", file: file("第一张.png") },
  { id: "second", file: file("第二张.png") },
];
const paragraph = (text: string) => schema.nodes.paragraph.create(null, schema.text(text));
const initial = () =>
  EditorState.create({
    schema,
    doc: schema.nodes.doc.create(null, [paragraph("原有正文必须保留"), paragraph("后文")]),
    plugins: [history(), imageUploadPlugin()],
  });
const imageOrder = (state: EditorState) => {
  const names: string[] = [];
  state.doc.descendants((node) => {
    if (node.type.name === "image") names.push(node.attrs.alt);
  });
  return names;
};
// 测试只适配接收器读取的公开字段；真实事件由浏览器回归覆盖。
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- 类型参数限定每个公开浏览器契约的边界替身。
function browserBoundary<T>(value: unknown): T {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- 单元测试边界替身，不访问真实浏览器内部状态。
  return value as T;
}
const transferData = (files: File[]) => {
  // 仅替代浏览器 DataTransfer 的传输边界，不伪称系统文件拖放已验证。
  return browserBoundary<DataTransfer>({
    files,
    types: files.length ? ["Files"] : [],
    items: files.map((item) => ({ kind: "file", getAsFile: () => item })),
    getData: () => "",
  });
};

void test("files 与 items 同时存在只读一份，连续粘贴相同文件不全局去重", () => {
  const image = file("相同.png"),
    other = new File(["pdf"], "文档.pdf", { type: "application/pdf" });
  assert.deepEqual(transferImageFiles(transferData([image, other])), [image]);
  assert.deepEqual(transferImageFiles(transferData([image, image])), [image, image]);
  const data = transferData([]);
  Object.defineProperty(data, "items", { value: [{ kind: "file", getAsFile: () => image }] });
  assert.deepEqual(transferImageFiles(data), [image]);
});

void test("纯图片粘贴不改变原选区文字，多图乱序完成仍按原顺序只插入各一张", () => {
  let state = initial();
  state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, 2, 6)));
  const before = state.doc;
  state = state.apply(imageTransferTransaction(state, state.selection.from, entries));
  assert.equal(state.doc.eq(before), true);
  assert.deepEqual(imageOrder(state), []);
  state = state.apply(
    uploadImageTransaction(state, "second", "https://images.example/second.png", "第二张"),
  );
  assert.ok(uploadAnchor(state, "first"));
  state = state.apply(
    uploadImageTransaction(state, "first", "https://images.example/first.png", "第一张"),
  );
  assert.deepEqual(imageOrder(state), ["第一张", "第二张"]);
  assert.equal(state.doc.textContent, before.textContent);
  assert.throws(
    () => uploadImageTransaction(state, "first", "https://images.example/first.png", "第一张"),
    /原插入位置/,
  );
  assert.equal(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
    true,
  );
  assert.deepEqual(imageOrder(state), ["第二张"]);
  assert.equal(
    redo(state, (tr) => {
      state = state.apply(tr);
    }),
    true,
  );
  assert.deepEqual(imageOrder(state), ["第一张", "第二张"]);
});

void test("取消一张不取消兄弟任务，晚到提交不能恢复已取消的图片", () => {
  let state = initial();
  const before = state.doc;
  state = state.apply(imageTransferTransaction(state, 3, entries));
  state = state.apply(
    state.tr.setMeta(imageUploadKey, { remove: "first" }).setMeta("addToHistory", false),
  );
  assert.throws(() =>
    uploadImageTransaction(state, "first", "https://images.example/a.png", "第一张"),
  );
  state = state.apply(
    uploadImageTransaction(state, "second", "https://images.example/b.png", "第二张"),
  );
  assert.deepEqual(imageOrder(state), ["第二张"]);
  assert.equal(state.doc.textContent, before.textContent);
});

void test("原图替换与同位置粘贴独立映射，不把替换目标移到新图片前", () => {
  const original = "https://images.example/original.png";
  let state = EditorState.create({
    schema,
    doc: schema.nodes.doc.create(null, [
      schema.nodes.paragraph.create(
        null,
        schema.nodes.image.create({ src: original, alt: "原图" }),
      ),
      paragraph("原图后文"),
    ]),
    plugins: [history(), imageUploadPlugin()],
  });
  state = state.apply(
    state.tr.setMeta(imageUploadKey, { add: { id: "replace", position: 1, replaceSrc: original } }),
  );
  state = state.apply(imageTransferTransaction(state, 1, entries.slice(0, 1)));
  state = state.apply(
    uploadImageTransaction(state, "first", "https://images.example/new.png", "粘贴图"),
  );
  assert.equal(state.doc.nodeAt(uploadAnchor(state, "replace")!.position)?.attrs.src, original);
  state = state.apply(
    uploadImageTransaction(state, "replace", "https://images.example/replaced.png", "替换图"),
  );
  assert.deepEqual(imageOrder(state), ["粘贴图", "替换图"]);
  assert.equal(state.doc.textContent, "原图后文");
});

const mixedSlice = () =>
  new Slice(
    schema.nodes.doc.create(
      null,
      schema.nodes.paragraph.create(null, [
        schema.text("粘贴前", [schema.marks.bold.create()]),
        schema.nodes.image.create({ src: "about:blank", title: "article-upload:first" }),
        schema.text("粘贴后"),
      ]),
    ).content,
    1,
    1,
  );

void test("图文混合粘贴保留格式及图片前后顺序，派发正文不包含临时图片或重复兜底", () => {
  let state = initial();
  const before = state.doc.textContent;
  state = state.apply(imageTransferTransaction(state, 3, entries.slice(0, 1), mixedSlice()));
  const pending = serializeDocument(state.doc.toJSON());
  assert.doesNotMatch(pending, /about:blank|article-upload|blob:/);
  assert.deepEqual(imageOrder(state), []);
  assert.match(pending, /bold/);
  assert.equal(state.doc.textContent.replace("粘贴前粘贴后", ""), before);
  state = state.apply(
    uploadImageTransaction(state, "first", "https://images.example/a.png", "第一张"),
  );
  assert.deepEqual(imageOrder(state), ["第一张"]);
  const beforeImage = state.doc.content.findDiffStart(initial().doc.content);
  assert.notEqual(beforeImage, null);
  const blocks = Array.from({ length: state.doc.childCount }, (_, i) => state.doc.child(i));
  const imageIndex = blocks.findIndex((node) => node.firstChild?.type.name === "image");
  assert.match(blocks[imageIndex - 1].textContent, /粘贴前$/);
  assert.match(blocks[imageIndex + 1].textContent, /^粘贴后/);
});

void test("撤销混合粘贴使相关上传失效，重做文字不会悄悄重启文件上传", () => {
  let state = initial();
  const before = state.doc;
  state = state.apply(imageTransferTransaction(state, 3, entries.slice(0, 1), mixedSlice()));
  assert.ok(uploadAnchor(state, "first"));
  assert.equal(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
    true,
  );
  assert.equal(state.doc.eq(before), true);
  assert.equal(uploadAnchor(state, "first"), undefined);
  assert.equal(
    redo(state, (tr) => {
      state = state.apply(tr);
    }),
    true,
  );
  assert.match(state.doc.textContent, /粘贴前粘贴后/);
  assert.equal(uploadAnchor(state, "first"), undefined);
  assert.doesNotMatch(serializeDocument(state.doc.toJSON()), /about:blank|article-upload/);
});

void test("非法混合文档在派发前拒绝，原正文和现有任务不变", () => {
  const state = initial();
  const before = serializeDocument(state.doc.toJSON());
  const invalid = new Slice(
    schema.nodes.doc.create(
      null,
      schema.nodes.paragraph.create(null, [
        schema.text("复制文字"),
        schema.nodes.image.create({ src: "javascript:alert(1)" }),
      ]),
    ).content,
    0,
    0,
  );
  assert.throws(() => imageTransferTransaction(state, 3, entries, invalid));
  assert.equal(serializeDocument(state.doc.toJSON()), before);
  assert.deepEqual(imageUploadKey.getState(state), []);
});

function viewFixture() {
  let state = initial();
  const events: string[] = [];
  const view = browserBoundary<EditorView>({
    get state() {
      return state;
    },
    editable: true,
    composing: false,
    dragging: null,
    dispatch: (tr: EditorState["tr"]) => {
      if (tr.getMeta(IMAGE_TRANSFER_FEEDBACK)) events.push(tr.getMeta(IMAGE_TRANSFER_FEEDBACK));
      state = state.apply(tr);
    },
    posAtCoords: () => ({ pos: 3, inside: 0 }),
  });
  return { view, events };
}
function eventWithData(kind: "paste", data: DataTransfer): ClipboardEvent;
function eventWithData(kind: "drop", data: DataTransfer): DragEvent;
function eventWithData(kind: "paste" | "drop", data: DataTransfer): ClipboardEvent | DragEvent {
  const event = new Event(kind, { cancelable: true });
  Object.assign(
    event,
    kind === "paste" ? { clipboardData: data } : { dataTransfer: data, clientX: 20, clientY: 40 },
  );
  return browserBoundary<ClipboardEvent | DragEvent>(event);
}

void test("文件粘贴只消费一次，纯文字和已有正文 HTML 粘贴继续交给原处理器", () => {
  const { view } = viewFixture();
  const plugin = imageTransferPlugin();
  const paste = plugin.props.handlePaste!;
  assert.equal(
    paste.call(plugin, view, eventWithData("paste", transferData([])), Slice.empty),
    false,
  );
  assert.equal(
    paste.call(plugin, view, eventWithData("paste", transferData([entries[0].file])), Slice.empty),
    true,
  );
  assert.equal(imageUploadKey.getState(view.state)?.length, 1);
  assert.deepEqual(imageOrder(view.state), []);
});

void test("外部图片使用落点，编辑器内部移动与修饰键复制均不再次上传", () => {
  const { view } = viewFixture();
  const plugin = imageTransferPlugin(),
    drop = plugin.props.handleDrop!;
  const event = eventWithData("drop", transferData(entries.map((entry) => entry.file)));
  assert.equal(drop.call(plugin, view, event, Slice.empty, true), false);
  view.dragging = { slice: Slice.empty, move: false };
  assert.equal(drop.call(plugin, view, event, Slice.empty, false), false);
  view.dragging = null;
  const before = view.state.doc;
  assert.equal(drop.call(plugin, view, event, Slice.empty, false), true);
  assert.deepEqual(
    imageUploadKey.getState(view.state)?.map((anchor) => anchor.position),
    [3, 3],
  );
  assert.equal(view.state.doc.eq(before), true);
});

void test("保存中、组合输入中及非图片文件拖入被明确拦截，正文不变", () => {
  const { view, events } = viewFixture();
  const plugin = imageTransferPlugin();
  const before = view.state.doc;
  const paste = eventWithData("paste", transferData([entries[0].file]));
  Object.defineProperty(view, "composing", { value: true, configurable: true });
  assert.equal(plugin.props.handleDOMEvents!.paste!.call(plugin, view, paste), true);
  assert.equal(paste.defaultPrevented, true);
  Object.defineProperty(view, "composing", { value: false });
  Object.defineProperty(view, "editable", { value: false, configurable: true });
  const savingPaste = eventWithData("paste", transferData([entries[0].file]));
  const savingDrop = eventWithData("drop", transferData([entries[0].file]));
  assert.equal(plugin.props.handleDOMEvents!.paste!.call(plugin, view, savingPaste), true);
  assert.equal(plugin.props.handleDOMEvents!.drop!.call(plugin, view, savingDrop), true);
  assert.equal(savingPaste.defaultPrevented, true);
  assert.equal(savingDrop.defaultPrevented, true);
  Object.defineProperty(view, "editable", { value: true });
  const drop = eventWithData(
    "drop",
    transferData([new File(["pdf"], "test.pdf", { type: "application/pdf" })]),
  );
  assert.equal(plugin.props.handleDOMEvents!.drop!.call(plugin, view, drop), true);
  assert.equal(drop.defaultPrevented, true);
  assert.equal(view.state.doc.eq(before), true);
  assert.equal(events.length, 4);
});
