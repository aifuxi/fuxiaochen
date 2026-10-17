import type { Editor } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";

import { Fragment, DOMSerializer } from "@tiptap/pm/model";
import { Selection, type EditorState } from "@tiptap/pm/state";
import { TableMap } from "@tiptap/pm/tables";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Minus,
  Table2,
  ImagePlus,
  PanelTop,
} from "lucide-react";

export type InsertHandlers = {
  image: (editor: Editor, position?: number) => void;
  table: (editor: Editor, position?: number) => void;
};

// 所有入口共用命令，避免斜杠菜单、选区和块菜单产生不同的文档结构。
export function insertActions(handlers: InsertHandlers) {
  const headings = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6];
  const names = ["一级标题", "二级标题", "三级标题", "四级标题", "五级标题", "六级标题"];
  return [
    {
      title: "正文",
      keywords: "text paragraph zhengwen",
      icon: Type,
      run: (editor: Editor) => editor.chain().focus().setParagraph().run(),
    },
    ...([1, 2, 3, 4, 5, 6] as const).map((level, index) => ({
      title: names[index],
      keywords: `heading h${level} biaoti`,
      icon: headings[index],
      run: (editor: Editor) => editor.chain().focus().setHeading({ level }).run(),
    })),
    {
      title: "有序列表",
      keywords: "ordered list liebiao",
      icon: ListOrdered,
      run: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "无序列表",
      keywords: "bullet list liebiao",
      icon: List,
      run: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "任务列表",
      keywords: "task check todo renwu",
      icon: ListChecks,
      run: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
    },
    {
      title: "代码块",
      keywords: "code daima",
      icon: Code2,
      run: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "引用",
      keywords: "quote blockquote yinyong",
      icon: Quote,
      run: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "高亮块",
      keywords: "callout highlight gaoliang",
      icon: PanelTop,
      run: (editor: Editor) => editor.chain().focus().toggleCallout().run(),
    },
    {
      title: "分隔线",
      keywords: "divider hr fengexian",
      icon: Minus,
      run: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
    },
    { title: "表格", keywords: "table biaoge", icon: Table2, run: handlers.table },
    { title: "图片", keywords: "image photo tupian", icon: ImagePlus, run: handlers.image },
  ];
}

export function selectedBlock(editor: Editor) {
  const { $from } = editor.state.selection;
  return $from.depth ? $from.before(1) : $from.pos;
}

export function blockTypeName(node: Node | null | undefined) {
  if (!node) return "正文";
  if (node.type.name === "heading")
    return ["一级标题", "二级标题", "三级标题", "四级标题", "五级标题", "六级标题"][
      node.attrs.level - 1
    ];
  const names: Record<string, string> = {
    bulletList: "无序列表",
    orderedList: "有序列表",
    taskList: "任务列表",
    codeBlock: "代码块",
    blockquote: "引用",
    callout: "高亮块",
    table: "表格",
    horizontalRule: "分隔线",
  };
  return names[node.type.name] ?? "正文";
}

export type BlockAction = "duplicate" | "delete" | "up" | "down" | "before" | "after";

export function blockTransaction(state: EditorState, target: number, action: BlockAction) {
  const nodes: { pos: number; size: number }[] = [];
  state.doc.forEach((node, pos) => nodes.push({ pos, size: node.nodeSize }));
  const index = nodes.findIndex((node) => node.pos === target);
  const node = state.doc.nodeAt(target);
  if (!node || index < 0) return null;
  const tr = state.tr;
  let next = target;
  if (action === "duplicate") {
    next += node.nodeSize;
    tr.insert(next, node);
  } else if (action === "before" || action === "after") {
    next += action === "after" ? node.nodeSize : 0;
    tr.insert(next, state.schema.nodes.paragraph.create());
  } else if (action === "delete") {
    tr.delete(target, target + node.nodeSize);
  } else {
    const adjacent = nodes[index + (action === "up" ? -1 : 1)];
    if (!adjacent) return null;
    next = action === "up" ? adjacent.pos : target + adjacent.size;
    tr.delete(target, target + node.nodeSize).insert(next, node);
  }
  tr.setSelection(Selection.near(tr.doc.resolve(Math.min(next + 1, tr.doc.content.size))));
  return tr.scrollIntoView();
}

export async function copyBlock(editor: Editor, position: number) {
  const node = editor.state.doc.nodeAt(position);
  if (!node) throw new Error("当前内容块已变化，请重新选择。");
  const container = document.createElement("div");
  container.append(DOMSerializer.fromSchema(editor.schema).serializeFragment(Fragment.from(node)));
  const text = node.textBetween(0, node.content.size, "\n", (leaf) => String(leaf.attrs.alt ?? ""));
  if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([container.innerHTML], { type: "text/html" }),
      }),
    ]);
  } else {
    await navigator.clipboard.writeText(text);
  }
  return node;
}

export function equalizeTable(editor: Editor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const table = $from.node(depth);
    if (table.type.name !== "table") continue;
    const position = $from.before(depth);
    const element = editor.view.nodeDOM(position);
    const available = element instanceof HTMLElement ? element.getBoundingClientRect().width : 600;
    const width = Math.max(60, Math.floor(available / TableMap.get(table).width));
    const tr = editor.state.tr;
    table.descendants((node, offset) => {
      if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
        tr.setNodeMarkup(position + 1 + offset, undefined, {
          ...node.attrs,
          colwidth: Array.from({ length: node.attrs.colspan }, () => width),
        });
        return false;
      }
      return true;
    });
    editor.view.dispatch(tr);
    return true;
  }
  return false;
}
