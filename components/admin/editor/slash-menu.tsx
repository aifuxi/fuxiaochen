"use client";

import { Extension, type Editor } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Minus,
  Table2,
  ImagePlus,
} from "lucide-react";
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export const slashKey = new PluginKey("article-slash");
export function insertActions(onImage: (editor: Editor) => void) {
  return [
    {
      title: "正文",
      keywords: "text paragraph zhengwen",
      icon: Type,
      run: (editor: Editor) => editor.chain().focus().setParagraph().run(),
    },
    {
      title: "一级标题",
      keywords: "heading h1 biaoti",
      icon: Heading1,
      run: (editor: Editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      title: "二级标题",
      keywords: "heading h2 biaoti",
      icon: Heading2,
      run: (editor: Editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      title: "三级标题",
      keywords: "heading h3 biaoti",
      icon: Heading3,
      run: (editor: Editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      title: "无序列表",
      keywords: "bullet list liebiao",
      icon: List,
      run: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "有序列表",
      keywords: "ordered list liebiao",
      icon: ListOrdered,
      run: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "任务列表",
      keywords: "task check todo renwu",
      icon: ListChecks,
      run: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
    },
    {
      title: "引用",
      keywords: "quote blockquote yinyong",
      icon: Quote,
      run: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "代码块",
      keywords: "code daima",
      icon: Code2,
      run: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "分隔线",
      keywords: "divider hr fengexian",
      icon: Minus,
      run: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      title: "表格",
      keywords: "table biaoge",
      icon: Table2,
      run: (editor: Editor) =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    { title: "图片", keywords: "image photo tupian", icon: ImagePlus, run: onImage },
  ];
}
type Action = ReturnType<typeof insertActions>[number];
type MenuProps = SuggestionProps<Action, Action>;
type MenuHandle = { onKeyDown: (event: KeyboardEvent) => boolean };

const SlashMenu = forwardRef<MenuHandle, MenuProps>(function SlashMenu(props, ref) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState({ query: props.query, index: 0 });
  const index =
    selection.query === props.query
      ? Math.min(selection.index, Math.max(0, props.items.length - 1))
      : 0;
  useEffect(() => {
    // 搜索后选项数可能不变，仍需刷新当前活动项与滚动位置。
    const query = props.query;
    const dom = props.editor.view.dom;
    dom.setAttribute("aria-controls", id);
    list.current?.setAttribute("data-query", query);
    dom.setAttribute("aria-expanded", "true");
    if (props.items.length) dom.setAttribute("aria-activedescendant", `${id}-${index}`);
    else dom.removeAttribute("aria-activedescendant");
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    return () => {
      dom.removeAttribute("aria-controls");
      dom.removeAttribute("aria-activedescendant");
      dom.removeAttribute("aria-expanded");
    };
  }, [id, index, props.editor, props.items.length, props.query]);
  useImperativeHandle(ref, () => ({
    onKeyDown(event) {
      if (event.isComposing || props.editor.view.composing) return false;
      if (["ArrowUp", "ArrowDown"].includes(event.key)) {
        if (props.items.length)
          setSelection({
            query: props.query,
            index:
              (index + (event.key === "ArrowUp" ? -1 : 1) + props.items.length) %
              props.items.length,
          });
        return true;
      }
      if (event.key === "Enter") {
        if (props.items[index]) props.command(props.items[index]);
        return true;
      }
      return false;
    },
  }));
  return (
    <div className="post-slash-menu" ref={list}>
      <p>
        插入内容 <span>↑ ↓ 选择 · Enter 插入</span>
      </p>
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- 建议菜单通过编辑器的 aria-activedescendant 保持输入焦点。 */}
      <div id={id} role="listbox" aria-label="插入内容块">
        {props.items.map((item, itemIndex) => (
          <Button
            key={item.title}
            type="button"
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- 非聚焦选项需要保留编辑器光标。
            role="option"
            id={`${id}-${itemIndex}`}
            aria-selected={index === itemIndex}
            tabIndex={-1}
            variant="ghost"
            className="post-editor-menu-item"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => props.command(item)}
          >
            <item.icon size={18} aria-hidden="true" />
            {item.title}
          </Button>
        ))}
      </div>
      {!props.items.length && <output>没有匹配的内容块</output>}
    </div>
  );
});

export function createSlashExtension(onImage: (editor: Editor) => void) {
  return Extension.create({
    name: "articleSlash",
    addProseMirrorPlugins() {
      return [
        Suggestion<Action, Action>({
          editor: this.editor,
          pluginKey: slashKey,
          char: "/",
          startOfLine: true,
          container: ".post-block-editor",
          allow: ({ editor, state }) =>
            editor.isEditable && state.selection.$from.parent.type.name === "paragraph",
          items: ({ query }) =>
            insertActions(onImage).filter((item) =>
              `${item.title} ${item.keywords}`.includes(query.toLowerCase()),
            ),
          command: ({ editor, range, props }) => {
            editor.chain().focus().deleteRange(range).run();
            props.run(editor);
          },
          render: () => {
            let component: ReactRenderer<MenuHandle, MenuProps> | undefined;
            let unmount: (() => void) | undefined;
            return {
              onStart: (props) => {
                component = new ReactRenderer(SlashMenu, { props, editor: props.editor });
                unmount = props.mount(component.element);
              },
              onUpdate: (props) => component?.updateProps(props),
              onKeyDown: ({ event }) => component?.ref?.onKeyDown(event) ?? false,
              onExit: () => {
                unmount?.();
                component?.destroy();
              },
            };
          },
        }),
      ];
    },
  });
}
