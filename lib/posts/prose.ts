import type { Node } from "@tiptap/pm/model";

// 用文档结构区分独立图片与行内图片，不向保存内容添加样式属性。
export function isImageParagraph(node: Node): boolean {
  return (
    node.type.name === "paragraph" &&
    node.childCount === 1 &&
    node.firstChild?.type.name === "image"
  );
}
