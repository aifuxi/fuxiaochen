import { Extension } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import { Plugin, PluginKey, type EditorState, type Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { draftContentSchema, serializeDocument } from "@/lib/posts/document";

export type ImageUploadAnchor = {
  id: string;
  position: number;
  replaceSrc?: string;
  element?: HTMLElement;
  pastedRange?: { from: number; to: number };
};
type UploadAction =
  | { add: ImageUploadAnchor }
  | { addMany: ImageUploadAnchor[] }
  | { attach: ImageUploadAnchor[] }
  | { remove: string }
  | { commit: { id: string; position: number; before?: number; after?: number } };
export const imageUploadKey = new PluginKey<readonly ImageUploadAnchor[]>("article-image-uploads");

export function mapUploadAnchors(
  anchors: readonly ImageUploadAnchor[],
  tr: Transaction,
): readonly ImageUploadAnchor[] {
  const action: UploadAction | undefined = tr.getMeta(imageUploadKey);
  const commit = action && "commit" in action ? action.commit : undefined;
  const committedIndex = anchors.findIndex((anchor) => anchor.id === commit?.id);
  const mapped = anchors.flatMap((anchor, index) => {
    let pastedRange = anchor.pastedRange;
    if (pastedRange) {
      const from = tr.mapping.mapResult(pastedRange.from, 1);
      const to = tr.mapping.mapResult(pastedRange.to, -1);
      if (from.pos >= to.pos && (from.deleted || to.deleted)) return [];
      pastedRange = { from: from.pos, to: to.pos };
    }
    // 同一位置的多图可乱序完成；按粘贴／拖入顺序保留各自位置，不被兄弟任务的段落替换误删。
    if (
      commit?.before !== undefined &&
      !anchor.replaceSrc &&
      anchor.position === commit.position &&
      anchor.id !== commit.id
    )
      return [
        {
          ...anchor,
          pastedRange,
          position: index < committedIndex ? commit.before : commit.after!,
        },
      ];
    const result = tr.mapping.mapResult(anchor.position, 1);
    // 整段删除、导入替换或原图片移除后，晚到的请求不能复活内容。
    if (result.deletedAcross || (anchor.replaceSrc && result.deletedAfter)) return [];
    if (anchor.replaceSrc && tr.doc.nodeAt(result.pos)?.attrs.src !== anchor.replaceSrc) return [];
    return [{ ...anchor, pastedRange, position: result.pos }];
  });
  if (action && "add" in action) return [...mapped, action.add];
  if (action && "addMany" in action) return [...mapped, ...action.addMany];
  if (action && "attach" in action)
    return mapped.map((anchor) => ({
      ...anchor,
      ...action.attach.find((item) => item.id === anchor.id),
    }));
  if (action && "remove" in action) return mapped.filter((anchor) => anchor.id !== action.remove);
  if (commit) return mapped.filter((anchor) => anchor.id !== commit.id);
  return mapped;
}

export function imageUploadPlugin() {
  return new Plugin<readonly ImageUploadAnchor[]>({
    key: imageUploadKey,
    state: { init: () => [], apply: (tr, anchors) => mapUploadAnchors(anchors, tr) },
    props: {
      decorations: (state) =>
        DecorationSet.create(
          state.doc,
          (imageUploadKey.getState(state) ?? []).flatMap((anchor) =>
            anchor.element
              ? [
                  Decoration.widget(anchor.position, anchor.element, {
                    key: anchor.id,
                    side: 1,
                    stopEvent: () => true,
                    ignoreSelection: true,
                  }),
                ]
              : [],
          ),
        ),
    },
  });
}

export const ImageUploadAnchors = Extension.create({
  name: "articleImageUploads",
  addProseMirrorPlugins() {
    return [imageUploadPlugin()];
  },
});

export const uploadAnchor = (state: EditorState, id: string) =>
  imageUploadKey.getState(state)?.find((anchor) => anchor.id === id);

export function uploadImageTransaction(state: EditorState, id: string, src: string, alt: string) {
  const anchor = uploadAnchor(state, id);
  if (!anchor) throw new Error("原插入位置已变化，请取消后重新选择位置。");
  const tr = closeHistory(state.tr);
  let before: number | undefined, after: number | undefined;
  if (anchor.replaceSrc) {
    const node = tr.doc.nodeAt(anchor.position);
    if (node?.type.name !== "image" || node.attrs.src !== anchor.replaceSrc)
      throw new Error("原图片已变化，请重新选择。");
    tr.setNodeMarkup(anchor.position, undefined, {
      ...node.attrs,
      src,
      alt,
      width: null,
      height: null,
      crop: null,
    });
  } else {
    // 飞书图片独占内容块；从文字中插入时拆分段落，不能覆盖选区或吞掉两侧文字。
    const image = state.schema.nodes.image.create({ src, alt });
    tr.replaceRangeWith(
      anchor.position,
      anchor.position,
      state.schema.nodes.paragraph.create({ textAlign: "center" }, image),
    );
    tr.doc.descendants((node, position) => {
      if (node === image) {
        before = position - 1;
        after = position + 2;
        return false;
      }
      return before === undefined;
    });
    if (before === undefined) throw new Error("图片无法插入当前位置，请重新选择。");
  }
  draftContentSchema.parse(serializeDocument(tr.doc.toJSON()));
  return tr.setMeta(imageUploadKey, { commit: { id, position: anchor.position, before, after } });
}

export type UploadSnapshot = {
  status: "uploading" | "error" | "done" | "cancelled";
  progress: number | null;
  error: string;
  uploadedUrl: string;
};

// 一次用户选图对应一个任务；重复重试、取消和晚到的成功响应都受同一个令牌约束。
export class ImageUploadTask {
  snapshot: UploadSnapshot = { status: "error", progress: null, error: "", uploadedUrl: "" };
  private controller: AbortController | null = null;
  constructor(
    readonly file: File,
    private upload: (
      file: File,
      signal: AbortSignal,
      progress: (value: number) => void,
    ) => Promise<string>,
    private insert: (url: string, signal: AbortSignal) => void | Promise<void>,
    private changed: () => void,
  ) {}
  async start() {
    if (this.controller || ["done", "cancelled"].includes(this.snapshot.status)) return;
    const controller = new AbortController();
    this.controller = controller;
    this.snapshot = { ...this.snapshot, status: "uploading", error: "", progress: null };
    this.changed();
    try {
      const url =
        this.snapshot.uploadedUrl ||
        (await this.upload(this.file, controller.signal, (progress) => {
          if (!controller.signal.aborted) {
            this.snapshot = { ...this.snapshot, progress };
            this.changed();
          }
        }));
      controller.signal.throwIfAborted();
      this.snapshot = { ...this.snapshot, uploadedUrl: url };
      await this.insert(url, controller.signal);
      controller.signal.throwIfAborted();
      this.snapshot = { ...this.snapshot, status: "done" };
    } catch (error) {
      if (!controller.signal.aborted)
        this.snapshot = {
          ...this.snapshot,
          status: "error",
          error: error instanceof Error ? error.message : "图片上传失败，请重试。",
        };
    } finally {
      if (this.controller === controller) this.controller = null;
      this.changed();
    }
  }
  cancel() {
    if (["done", "cancelled"].includes(this.snapshot.status)) return;
    this.snapshot = { ...this.snapshot, status: "cancelled" };
    this.controller?.abort();
    this.controller = null;
    this.changed();
  }
}
