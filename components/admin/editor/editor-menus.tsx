"use client";

import type { Editor } from "@tiptap/core";

import { Selection, TextSelection } from "@tiptap/pm/state";
import { useEditorState } from "@tiptap/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  CopyPlus,
  Scissors,
  Trash2,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Check,
  Eraser,
} from "lucide-react";
import { useRef, useState, type ReactNode, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "@/components/ui/popover";
import { CONTENT_COLORS, highlightColor, textColor } from "@/lib/posts/content-palette";

import {
  insertActions,
  blockTransaction,
  copyBlock,
  selectedBlock,
  equalizeTable,
  type InsertHandlers,
  type BlockAction,
} from "./editor-commands";

type MenuProps = { editor: Editor; disabled: boolean; handlers: InsertHandlers };

export function CommandMenu({
  editor,
  disabled,
  handlers,
  children,
  convert = false,
  beforeRun,
}: MenuProps & { children: ReactNode; convert?: boolean; beforeRun?: (title: string) => void }) {
  return (
    <Menu>
      <MenuTrigger
        render={<Button type="button" variant="ghost" className="post-editor-icon" />}
        disabled={disabled}
        aria-label={convert ? "转换文字类型" : "插入内容"}
      >
        {children}
      </MenuTrigger>
      <MenuContent className="post-editor-command-menu" finalFocus={false}>
        <p className="post-editor-menu-caption">{convert ? "转换类型" : "插入内容"}</p>
        {insertActions(handlers)
          .filter((item) => !convert || !["图片", "表格", "分隔线"].includes(item.title))
          .map((item) => (
            <MenuItem
              key={item.title}
              disabled={disabled}
              onClick={() => {
                if (!editor.isEditable) return;
                beforeRun?.(item.title);
                if (convert) editor.chain().focus().clearNodes().run();
                item.run(editor);
              }}
            >
              <item.icon size={16} aria-hidden="true" />
              {item.title}
            </MenuItem>
          ))}
      </MenuContent>
    </Menu>
  );
}

export function BlockMenu({
  editor,
  disabled,
  handlers,
  position,
  children,
  onStatus,
}: MenuProps & {
  position?: () => number;
  children: ReactNode;
  onStatus: (message: string) => void;
}) {
  const [target, setTarget] = useState(0);
  const targetDocument = useRef(editor.state.doc);
  const node = editor.state.doc.nodeAt(target);
  const positions: number[] = [];
  editor.state.doc.forEach((_, pos) => positions.push(pos));
  const index = positions.indexOf(target);
  const act = (action: BlockAction) => {
    if (!editor.isEditable || editor.state.doc !== targetDocument.current) {
      onStatus("正文已变化，请重新打开内容块菜单。");
      return;
    }
    const transaction = blockTransaction(editor.state, target, action);
    if (transaction) editor.view.dispatch(transaction);
    editor.commands.focus();
  };
  const clipboard = async (cut: boolean) => {
    try {
      const copied = await copyBlock(editor, target);
      if (
        cut &&
        editor.isEditable &&
        editor.state.doc === targetDocument.current &&
        editor.state.doc.nodeAt(target)?.eq(copied)
      )
        act("delete");
      else if (cut) {
        onStatus("内容已复制，正文已变化，未执行删除。");
        return;
      }
      onStatus(cut ? "内容块已剪切" : "内容块已复制到剪贴板");
    } catch {
      onStatus("无法访问剪贴板，请使用系统复制快捷键。");
    }
  };
  return (
    <Menu
      onOpenChange={(open) => {
        if (open) {
          setTarget(position?.() ?? selectedBlock(editor));
          targetDocument.current = editor.state.doc;
        }
      }}
    >
      <MenuTrigger
        render={<Button type="button" variant="ghost" className="post-editor-icon" />}
        disabled={disabled}
        aria-label="内容块操作"
      >
        {children}
      </MenuTrigger>
      <MenuContent className="post-editor-command-menu" finalFocus={false}>
        <MenuItem disabled={disabled} onClick={() => void clipboard(false)}>
          <Copy size={16} />
          复制
        </MenuItem>
        <MenuItem disabled={disabled} onClick={() => void clipboard(true)}>
          <Scissors size={16} />
          剪切
        </MenuItem>
        <MenuItem disabled={disabled} onClick={() => act("duplicate")}>
          <CopyPlus size={16} />
          创建副本
        </MenuItem>
        <MenuSeparator className="ds-menu-separator" />
        <MenuItem disabled={disabled || index <= 0} onClick={() => act("up")}>
          <ArrowUp size={16} />
          上移
        </MenuItem>
        <MenuItem
          disabled={disabled || index < 0 || index === positions.length - 1}
          onClick={() => act("down")}
        >
          <ArrowDown size={16} />
          下移
        </MenuItem>
        <MenuItem disabled={disabled} onClick={() => act("before")}>
          <Plus size={16} />
          在上方添加
        </MenuItem>
        <MenuItem disabled={disabled} onClick={() => act("after")}>
          <Plus size={16} />
          在下方添加
        </MenuItem>
        <MenuItem disabled={disabled} destructive onClick={() => act("delete")}>
          <Trash2 size={16} />
          删除内容块
        </MenuItem>
        {node && !node.isAtom && node.type.name !== "table" && (
          <>
            <MenuSeparator className="ds-menu-separator" />
            <p className="post-editor-menu-caption">转换类型</p>
            {insertActions(handlers)
              .filter((item) => !["图片", "表格", "分隔线"].includes(item.title))
              .map((item) => (
                <MenuItem
                  key={item.title}
                  disabled={disabled}
                  onClick={() => {
                    if (!editor.isEditable || editor.state.doc !== targetDocument.current) return;
                    const selection = TextSelection.between(
                      editor.state.doc.resolve(target + 1),
                      editor.state.doc.resolve(target + node.nodeSize - 1),
                    );
                    editor.view.dispatch(editor.state.tr.setSelection(selection));
                    editor.chain().focus().clearNodes().run();
                    item.run(editor);
                  }}
                >
                  <item.icon size={16} />
                  {item.title}
                </MenuItem>
              ))}
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

export function AlignmentMenu({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) =>
      ["left", "center", "right"].filter((value) => instance.isActive({ textAlign: value })),
  });
  return (
    <Menu>
      <MenuTrigger
        render={<Button type="button" variant="ghost" className="post-editor-icon" />}
        disabled={disabled}
        aria-label="段落对齐"
      >
        <AlignLeft size={17} />
      </MenuTrigger>
      <MenuContent className="post-editor-command-menu" finalFocus={false}>
        {[
          { value: "left", title: "左对齐", icon: AlignLeft },
          { value: "center", title: "居中对齐", icon: AlignCenter },
          { value: "right", title: "右对齐", icon: AlignRight },
        ].map((item) => (
          <MenuItem
            key={item.value}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign(item.value).run()}
          >
            <item.icon size={16} />
            {item.title}
            {active.includes(item.value) && <Check size={14} />}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

export function ColorMenu({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const apply = (run: () => void) => {
    if (!editor.isEditable) return;
    run();
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={<Button type="button" variant="ghost" className="post-editor-icon" />}
        aria-label="文字颜色与高亮"
      >
        <Palette size={17} />
      </PopoverTrigger>
      <PopoverContent className="post-color-menu" finalFocus={false}>
        <PopoverTitle className="sr-only">文字颜色与高亮</PopoverTitle>
        <p>字体颜色</p>
        <div className="post-color-swatches">
          <Button
            type="button"
            variant="ghost"
            className="post-color-swatch"
            aria-label="默认文字颜色"
            disabled={disabled}
            onClick={() =>
              apply(() => {
                editor.chain().focus().unsetColor().run();
              })
            }
          >
            A
          </Button>
          {CONTENT_COLORS.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="ghost"
              className="post-color-swatch"
              style={{ color: textColor(item.key) }}
              aria-label={`${item.name}文字`}
              disabled={disabled}
              aria-pressed={editor.isActive("textStyle", { color: textColor(item.key) })}
              onClick={() =>
                apply(() => {
                  editor.chain().focus().setColor(textColor(item.key)).run();
                })
              }
            >
              A
            </Button>
          ))}
        </div>
        <p>背景颜色</p>
        <div className="post-color-swatches">
          <Button
            type="button"
            variant="ghost"
            className="post-color-swatch"
            aria-label="清除背景高亮"
            disabled={disabled}
            onClick={() =>
              apply(() => {
                editor.chain().focus().unsetHighlight().run();
              })
            }
          >
            <Eraser size={16} />
          </Button>
          {CONTENT_COLORS.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="ghost"
              className="post-color-swatch"
              style={{ backgroundColor: highlightColor(item.key) }}
              aria-label={`${item.name}高亮`}
              disabled={disabled}
              aria-pressed={editor.isActive("highlight", { color: highlightColor(item.key) })}
              onClick={() =>
                apply(() => {
                  editor
                    .chain()
                    .focus()
                    .setHighlight({ color: highlightColor(item.key) })
                    .run();
                })
              }
            />
          ))}
        </div>
        {editor.isActive("callout") && (
          <>
            <p>高亮块颜色</p>
            <div className="post-color-swatches">
              {CONTENT_COLORS.map((item) => (
                <Button
                  key={item.key}
                  type="button"
                  variant="ghost"
                  className="post-color-swatch"
                  style={{ backgroundColor: highlightColor(item.key) }}
                  aria-label={`${item.name}高亮块`}
                  disabled={disabled}
                  onClick={() =>
                    apply(() => {
                      editor.chain().focus().updateAttributes("callout", { tone: item.key }).run();
                    })
                  }
                />
              ))}
            </div>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          className="post-color-reset"
          disabled={disabled}
          onClick={() =>
            apply(() => {
              editor.chain().focus().unsetColor().unsetHighlight().run();
            })
          }
        >
          恢复默认
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function TablePicker({
  onClose,
  onInsert,
  disabled,
  finalFocus,
}: {
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
  disabled: boolean;
  finalFocus?: () => HTMLElement;
}) {
  const [choice, setChoice] = useState({ rows: 1, cols: 1 });
  const [error, setError] = useState("");
  const grid = useRef<HTMLDivElement>(null);
  const move = (event: KeyboardEvent<HTMLButtonElement>) => {
    const offsets: Record<string, number[]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const rows = Math.max(1, Math.min(9, choice.rows + offset[0]));
    const cols = Math.max(1, Math.min(9, choice.cols + offset[1]));
    setChoice({ rows, cols });
    grid.current?.querySelectorAll("button")[(rows - 1) * 9 + cols - 1]?.focus();
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="post-table-picker" finalFocus={finalFocus ?? false}>
        <DialogTitle>插入表格</DialogTitle>
        <DialogDescription>选择行列数量，使用方向键调整，Enter 插入。</DialogDescription>
        <div className="post-table-grid" ref={grid}>
          {Array.from({ length: 81 }, (_, index) => {
            const rows = Math.floor(index / 9) + 1,
              cols = (index % 9) + 1;
            return (
              <Button
                key={index}
                type="button"
                variant="ghost"
                disabled={disabled}
                className="post-table-grid-cell"
                data-selected={rows <= choice.rows && cols <= choice.cols}
                tabIndex={rows === choice.rows && cols === choice.cols ? 0 : -1}
                aria-label={`${rows} 行 ${cols} 列`}
                onKeyDown={move}
                onMouseEnter={() => setChoice({ rows, cols })}
                onFocus={() => setChoice({ rows, cols })}
                onClick={() => {
                  try {
                    onInsert(rows, cols);
                  } catch (failure) {
                    setError(failure instanceof Error ? failure.message : "表格无法插入。");
                  }
                }}
              />
            );
          })}
        </div>
        <output aria-live="polite">
          {choice.rows} 行 × {choice.cols} 列
        </output>
        {error && (
          <p className="admin-post-error" role="alert">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TableMenu({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const operations = [
    { title: "在上方插入行", command: "addRowBefore" },
    { title: "在下方插入行", command: "addRowAfter" },
    { title: "在左侧插入列", command: "addColumnBefore" },
    { title: "在右侧插入列", command: "addColumnAfter" },
    { title: "合并单元格", command: "mergeCells" },
    { title: "拆分单元格", command: "splitCell" },
    { title: "切换标题行", command: "toggleHeaderRow" },
    { title: "切换标题列", command: "toggleHeaderColumn" },
    { title: "删除行", command: "deleteRow" },
    { title: "删除列", command: "deleteColumn" },
    { title: "删除表格", command: "deleteTable" },
  ] as const;
  const available = useEditorState({
    editor,
    selector: ({ editor: instance }) => operations.map((item) => instance.can()[item.command]()),
  });
  return (
    <Menu>
      <MenuTrigger
        render={<Button type="button" variant="ghost" className="post-editor-insert" />}
        disabled={disabled}
      >
        表格操作
        <ChevronDown size={14} />
      </MenuTrigger>
      <MenuContent className="post-editor-command-menu" finalFocus={false}>
        {operations.map((item, index) => (
          <MenuItem
            key={item.command}
            disabled={disabled || !available[index]}
            destructive={item.command.startsWith("delete")}
            onClick={() => editor.chain().focus()[item.command]().run()}
          >
            {item.title}
          </MenuItem>
        ))}
        <MenuSeparator className="ds-menu-separator" />
        <MenuItem disabled={disabled} onClick={() => equalizeTable(editor)}>
          均分列宽
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function insertParagraphAfter(editor: Editor, position: number) {
  const transaction = blockTransaction(editor.state, position, "after");
  if (transaction) editor.view.dispatch(transaction);
  else
    editor.view.dispatch(
      editor.state.tr.setSelection(
        Selection.near(editor.state.doc.resolve(editor.state.doc.content.size)),
      ),
    );
}
