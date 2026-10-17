import type { Transaction } from "@tiptap/pm/state";

// 选区可能从上一块的闭合边界开始；不能因此把没有选中文字的上一标题一起对齐。
export function applyTextAlignment(tr: Transaction, alignment: string | null, dispatch = true) {
  let eligible = false;
  for (const range of tr.selection.ranges) {
    const from = range.$from.pos,
      to = range.$to.pos;
    tr.doc.nodesBetween(from, to, (node, position) => {
      if (node.type.name !== "paragraph" && node.type.name !== "heading") return;
      const start = position + 1,
        end = position + node.nodeSize - 1;
      const selected = tr.selection.empty
        ? from >= start && from <= end
        : Math.max(from, start) < Math.min(to, end) ||
          (node.content.size === 0 && from <= position && to >= position + node.nodeSize);
      if (!selected) return;
      eligible = true;
      if (dispatch) tr.setNodeMarkup(position, undefined, { ...node.attrs, textAlign: alignment });
    });
  }
  return eligible;
}
