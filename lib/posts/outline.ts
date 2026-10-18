import type { Node } from "@tiptap/pm/model";

export type HeadingEntry = { id: string; title: string; level: number; position: number };

// 按文档位置生成视图锚点，同名标题也能独立定位；不改动保存内容。
export function headingEntries(document: Node): HeadingEntry[] {
  const entries: HeadingEntry[] = [];
  document.descendants((node, position) => {
    if (node.type.name === "heading")
      entries.push({
        id: `post-heading-${position}`,
        title: node.textContent || "未命名标题",
        level: node.attrs.level,
        position,
      });
  });
  return entries;
}
