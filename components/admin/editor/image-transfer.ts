import type { EditorView } from "@tiptap/pm/view";

import { Extension } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import { DOMParser as ProseMirrorParser, Fragment, Slice } from "@tiptap/pm/model";
import { Plugin, type EditorState } from "@tiptap/pm/state";

import { draftContentSchema, serializeDocument } from "@/lib/posts/document";

import { imageUploadKey, type ImageUploadAnchor } from "./image-upload-state";

export const IMAGE_TRANSFER_REQUEST = "article-image-transfer";
export const IMAGE_TRANSFER_FEEDBACK = "article-image-transfer-feedback";
const markerPrefix = "article-upload:";
export type TransferredImage = { id: string; file: File };
export type ImageTransferRequest = { entries: TransferredImage[]; anchors: ImageUploadAnchor[] };

export function transferImageFiles(data: Pick<DataTransfer, "files" | "items"> | null) {
  if (!data) return [];
  // files 与 items 是同一批数据的两种表示，不能合并两者造成双份上传。
  const files = Array.from(data.files);
  return (
    files.length
      ? files
      : Array.from(data.items).flatMap((item) => {
          const file = item.kind === "file" ? item.getAsFile() : null;
          return file ? [file] : [];
        })
  ).filter((file) => file.type.startsWith("image/"));
}

const marker = (state: EditorState, id: string) =>
  state.schema.nodes.paragraph.create(
    null,
    state.schema.nodes.image.create({ src: "about:blank", title: markerPrefix + id }),
  );

function hasClipboardBody(fragment: Fragment, ids: Set<string>): boolean {
  let meaningful = false;
  fragment.forEach((node) => {
    if (node.type.name === "image" && ids.has(String(node.attrs.title).slice(markerPrefix.length)))
      return;
    if (node.isText || node.isLeaf || ["table", "codeBlock"].includes(node.type.name))
      meaningful = true;
    else meaningful ||= hasClipboardBody(node.content, ids);
  });
  return meaningful;
}

export function imageTransferTransaction(
  state: EditorState,
  position: number,
  entries: TransferredImage[],
  clipboard = Slice.empty,
) {
  const ids = new Set(entries.map((entry) => entry.id));
  const anchors: ImageUploadAnchor[] = entries.map(({ id }) => ({ id, position }));
  const tr = closeHistory(state.tr);
  if (hasClipboardBody(clipboard.content, ids)) {
    const found = new Set<string>();
    clipboard.content.nodesBetween(0, clipboard.content.size, (node) => {
      if (node.type.name === "image" && String(node.attrs.title).startsWith(markerPrefix))
        found.add(String(node.attrs.title).slice(markerPrefix.length));
    });
    const extra = entries.filter(({ id }) => !found.has(id)).map(({ id }) => marker(state, id));
    const template = extra.length
      ? new Slice(clipboard.content.append(Fragment.fromArray(extra)), clipboard.openStart, 0)
      : clipboard;
    // 只在临时事务中使用标记节点，分离图片位置与文字；派发前全部移除，绝不写入 blob 或占位节点。
    tr.replaceRange(position, position, template);
    const locations: { id: string; position: number; from: number; to: number }[] = [];
    tr.doc.descendants((node, pos, parent) => {
      const id = String(node.attrs.title ?? "").slice(markerPrefix.length);
      if (
        node.type.name !== "image" ||
        !String(node.attrs.title).startsWith(markerPrefix) ||
        !ids.has(id)
      )
        return;
      const wholeParagraph = parent?.type.name === "paragraph" && parent.childCount === 1;
      locations.push({
        id,
        position: pos,
        from: wholeParagraph ? pos - 1 : pos,
        to: wholeParagraph ? pos + 2 : pos + 1,
      });
    });
    if (locations.length !== entries.length)
      throw new Error("无法识别粘贴图片的位置，原正文已保留，请重新粘贴。");
    const mappingStart = tr.mapping.maps.length;
    for (const location of locations.toReversed()) tr.delete(location.from, location.to);
    for (const anchor of anchors)
      anchor.position = tr.mapping
        .slice(mappingStart)
        .map(locations.find((location) => location.id === anchor.id)!.position, 1);
    const from = state.doc.content.findDiffStart(tr.doc.content);
    const end = state.doc.content.findDiffEnd(tr.doc.content);
    if (from !== null && end && from < end.b)
      for (const anchor of anchors) anchor.pastedRange = { from, to: end.b };
    draftContentSchema.parse(serializeDocument(tr.doc.toJSON()));
  }
  return tr
    .setMeta(imageUploadKey, { addMany: anchors })
    .setMeta(IMAGE_TRANSFER_REQUEST, { entries, anchors } satisfies ImageTransferRequest);
}

function pastedTemplate(
  view: EditorView,
  event: ClipboardEvent,
  entries: TransferredImage[],
  fallback: Slice,
) {
  const html = event.clipboardData?.getData("text/html") ?? "";
  if (!/<img[\s>]/i.test(html)) {
    const text = event.clipboardData?.getData("text/plain").trim();
    if (text && (/^file:\/\//i.test(text) || entries.some(({ file }) => file.name === text)))
      return Slice.empty;
    let imageFallback = false;
    fallback.content.nodesBetween(0, fallback.content.size, (node) => {
      if (node.type.name === "image") imageFallback = true;
    });
    if (imageFallback && !fallback.content.textBetween(0, fallback.content.size, "", "").trim())
      return Slice.empty;
    return fallback;
  }
  const container = view.dom.ownerDocument.implementation
    .createHTMLDocument("clipboard")
    .createElement("div");
  container.innerHTML = html;
  Array.from(container.querySelectorAll("img"))
    .slice(0, entries.length)
    .forEach((image, index) => {
      image.src = "about:blank";
      image.title = markerPrefix + entries[index].id;
    });
  const parser =
    view.someProp("clipboardParser") ??
    view.someProp("domParser") ??
    ProseMirrorParser.fromSchema(view.state.schema);
  return parser.parseSlice(container, {
    preserveWhitespace: true,
    context: view.state.selection.$from,
  });
}

const feedback = (view: EditorView, message: string) =>
  view.dispatch(
    view.state.tr.setMeta(IMAGE_TRANSFER_FEEDBACK, message).setMeta("addToHistory", false),
  );

function receive(
  view: EditorView,
  files: File[],
  position: number,
  clipboard?: (entries: TransferredImage[]) => Slice,
) {
  const entries = files.map((file) => ({ id: crypto.randomUUID(), file }));
  try {
    const tr = imageTransferTransaction(view.state, position, entries, clipboard?.(entries));
    view.dispatch(tr);
    if (tr.docChanged) view.dispatch(closeHistory(view.state.tr));
  } catch {
    feedback(view, "这次粘贴或拖入的格式无法插入，原正文已保留，请调整后重试。");
  }
}

export function imageTransferPlugin() {
  return new Plugin({
    props: {
      handleDOMEvents: {
        paste: (view, event) => {
          if (!transferImageFiles(event.clipboardData).length) return false;
          if (view.editable && !view.composing) return false;
          event.preventDefault();
          feedback(
            view,
            view.composing ? "请先完成当前中文输入，再粘贴图片。" : "请等待保存完成后再粘贴图片。",
          );
          return true;
        },
        drop: (view, event) => {
          if (view.dragging || !event.dataTransfer?.types.includes("Files")) return false;
          if (view.editable && !view.composing && transferImageFiles(event.dataTransfer).length)
            return false;
          event.preventDefault();
          feedback(
            view,
            view.composing
              ? "请先完成当前中文输入，再拖入图片。"
              : view.editable
                ? "仅支持拖入图片文件。"
                : "请等待保存完成后再拖入图片。",
          );
          return true;
        },
      },
      handlePaste: (view, event, slice) => {
        const files = transferImageFiles(event.clipboardData);
        if (!files.length) return false;
        receive(view, files, view.state.selection.from, (entries) =>
          pastedTemplate(view, event, entries, slice),
        );
        // 文件与 HTML 兜底只由本处理器消费一次，避免默认图片解析再插入一份。
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        // 内容块移动、修饰键复制均由 ProseMirror 原有拖拽处理，不再次上传已有图片。
        if (moved || view.dragging) return false;
        const files = transferImageFiles(event.dataTransfer);
        if (!files.length) return false;
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        if (position === undefined) {
          feedback(view, "请把图片拖到正文中的位置。");
          return true;
        }
        receive(view, files, position);
        return true;
      },
    },
  });
}

export const ImageTransfer = Extension.create({
  name: "articleImageTransfer",
  addProseMirrorPlugins() {
    return [imageTransferPlugin()];
  },
});
