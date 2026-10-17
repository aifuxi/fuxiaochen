"use client";

import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import { Fragment, useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";

import { insertActions, type InsertHandlers } from "./editor-commands";

export const slashKey = new PluginKey("article-slash");
type Action = ReturnType<typeof insertActions>[number];
type MenuProps = SuggestionProps<Action, Action> & { selectedIndex: number };
const commonCommand = (title: string) => ["图片", "表格", "高亮块"].includes(title);

function SlashMenu(props: MenuProps) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const index = props.selectedIndex;
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
  return (
    <div className="post-slash-menu" ref={list}>
      <p>
        插入内容 <span>↑ ↓ 选择 · Enter 插入</span>
      </p>
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- 建议菜单通过编辑器的 aria-activedescendant 保持输入焦点。 */}
      <div id={id} role="listbox" aria-label="插入内容块">
        {props.items.map((item, itemIndex) => (
          <Fragment key={item.title}>
            {(itemIndex === 0 ||
              commonCommand(props.items[itemIndex - 1].title) !== commonCommand(item.title)) && (
              <p className="post-slash-group" aria-hidden="true">
                {commonCommand(item.title) ? "常用" : "基础"}
              </p>
            )}
            <Button
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
          </Fragment>
        ))}
      </div>
      {!props.items.length && <output>没有匹配的内容块</output>}
    </div>
  );
}

export function createSlashExtension(handlers: InsertHandlers) {
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
            insertActions(handlers)
              .filter((item) => `${item.title} ${item.keywords}`.includes(query.toLowerCase()))
              .toSorted((a, b) => Number(commonCommand(a.title)) - Number(commonCommand(b.title))),
          command: ({ editor, range, props }) => {
            editor.chain().focus().deleteRange(range).run();
            props.run(editor);
          },
          render: () => {
            let component: ReactRenderer<unknown, MenuProps> | undefined;
            let latest: SuggestionProps<Action, Action> | undefined;
            let selectedIndex = 0;
            let unmount: (() => void) | undefined;
            return {
              onStart: (props) => {
                latest = props;
                selectedIndex = 0;
                component = new ReactRenderer(SlashMenu, {
                  props: { ...props, selectedIndex },
                  editor: props.editor,
                });
                unmount = props.mount(component.element);
              },
              onUpdate: (props) => {
                if (latest?.query !== props.query) selectedIndex = 0;
                selectedIndex = Math.min(selectedIndex, Math.max(0, props.items.length - 1));
                latest = props;
                component?.updateProps({ ...props, selectedIndex });
              },
              // 键盘处理不能依赖 React 提交后的 ref，否则快速输入再按 Enter 会落回正文换行。
              onKeyDown: ({ event }) => {
                if (!latest || event.isComposing || latest.editor.view.composing) return false;
                if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                  if (latest.items.length)
                    selectedIndex =
                      (selectedIndex + (event.key === "ArrowUp" ? -1 : 1) + latest.items.length) %
                      latest.items.length;
                  component?.updateProps({ ...latest, selectedIndex });
                  return true;
                }
                if (event.key === "Enter") {
                  const action = latest.items[selectedIndex];
                  if (action) latest.command(action);
                  return true;
                }
                return false;
              },
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
