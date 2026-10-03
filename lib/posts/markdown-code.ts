import type { Root, RootContent } from "mdast";

// Markdown 转 HTML 会给代码追加换行；保留源节点的值，复制时不改变原文。
function visit(node: Root | RootContent) {
  if (node.type === "code") {
    node.data = {
      ...node.data,
      hProperties: {
        ...node.data?.hProperties,
        "data-code-source": node.value,
        "data-code-language": node.lang ?? "",
      },
    };
  }
  if ("children" in node) node.children.forEach(visit);
}

export function remarkCodeSource() {
  return visit;
}
