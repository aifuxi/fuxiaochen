"use client";

import type { Editor } from "@tiptap/core";

import { NodeSelection } from "@tiptap/pm/state";
import { useEditorState } from "@tiptap/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
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
  GripVertical,
} from "lucide-react";
import { useRef, useState, type ReactNode, type KeyboardEvent, type CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
} from "@/components/ui/menu";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "@/components/ui/popover";
import { CONTENT_COLORS, highlightColor, textColor } from "@/lib/posts/content-palette";

import {
  insertActions,
  blockTransaction,
  copyBlock,
  selectedBlock,
  equalizeTable,
  blockTypeName,
  type InsertHandlers,
  type BlockAction,
} from "./editor-commands";

type MenuProps = { editor: Editor; disabled: boolean; handlers: InsertHandlers };
type InsertAction = ReturnType<typeof insertActions>[number];

function runType(editor: Editor, action: InsertAction) {
  editor.chain().focus().clearNodes().run();
  action.run(editor);
}

// 基础类型使用飞书的紧凑网格；图片、表格等插入项保持可读的分组行。
function CommandItems({
  editor,
  disabled,
  handlers,
  convert = false,
  onRun,
}: MenuProps & {
  convert?: boolean;
  onRun?: (action: InsertAction) => void;
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) =>
      blockTypeName(instance.state.doc.nodeAt(selectedBlock(instance))),
  });
  const actions = insertActions(handlers);
  const order = [
    convert ? "正文" : null,
    "一级标题",
    "二级标题",
    "三级标题",
    "有序列表",
    "无序列表",
    "任务列表",
    "代码块",
    "引用",
    convert ? null : "分隔线",
    "四级标题",
    "五级标题",
    "六级标题",
  ];
  const execute = (action: InsertAction) => {
    if (!editor.isEditable) return;
    if (onRun) onRun(action);
    else if (convert) runType(editor, action);
    else action.run(editor);
  };
  return (
    <>
      {!convert && <p className="post-editor-menu-caption">基础</p>}
      <fieldset className="post-editor-type-grid" aria-label={convert ? "转换类型" : "基础内容"}>
        {order.flatMap((title) => {
          const action = actions.find((item) => item.title === title);
          return action
            ? [
                <MenuItem
                  key={action.title}
                  className="post-editor-type-option"
                  disabled={disabled}
                  aria-label={action.title}
                  title={action.title}
                  data-active={convert && active === action.title}
                  onClick={() => execute(action)}
                >
                  <action.icon size={18} aria-hidden="true" />
                  <span className="sr-only">{action.title}</span>
                </MenuItem>,
              ]
            : [];
        })}
      </fieldset>
      {!convert && <p className="post-editor-menu-caption">常用</p>}
      {(convert ? ["高亮块"] : ["图片", "表格", "高亮块"])
        .flatMap((title) => actions.filter((item) => item.title === title))
        .map((item) => (
          <MenuItem key={item.title} disabled={disabled} onClick={() => execute(item)}>
            <item.icon size={16} aria-hidden="true" />
            {item.title}
          </MenuItem>
        ))}
    </>
  );
}

export function CommandMenu({
  editor,
  disabled,
  handlers,
  children,
  convert = false,
  onOpenChange,
}: MenuProps & {
  children: ReactNode;
  convert?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const insertionSelection = useRef<{
    doc: Editor["state"]["doc"];
    selection: Editor["state"]["selection"];
  } | null>(null);
  return (
    <Menu
      onOpenChange={(open) => {
        onOpenChange?.(open);
        if (convert) return;
        if (open) {
          const { doc, selection } = editor.state;
          const position = selectedBlock(editor);
          const node = doc.nodeAt(position);
          if (node?.type.name !== "paragraph" || node.content.size) return;
          insertionSelection.current = { doc, selection };
          editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(doc, position)));
        } else {
          const previous = insertionSelection.current;
          // 空行菜单与飞书一样选中整行；取消时恢复输入点，执行命令后不覆盖新选区。
          if (previous?.doc === editor.state.doc && editor.state.selection instanceof NodeSelection)
            editor.view.dispatch(editor.state.tr.setSelection(previous.selection));
          insertionSelection.current = null;
        }
      }}
    >
      <MenuTrigger
        render={<Button type="button" variant="ghost" className="post-editor-icon" />}
        disabled={disabled}
        aria-label={convert ? "转换文字类型" : "插入内容"}
      >
        {children}
      </MenuTrigger>
      <MenuContent
        className="post-editor-command-menu"
        side={convert ? "bottom" : "left"}
        align="start"
        collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "end" }}
        finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
      >
        <CommandItems editor={editor} disabled={disabled} handlers={handlers} convert={convert} />
      </MenuContent>
    </Menu>
  );
}

function Submenu({
  title,
  icon,
  disabled,
  children,
}: {
  title: string;
  icon: ReactNode;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <MenuSubmenu>
      <MenuSubmenuTrigger className="ds-menu-item post-editor-submenu-trigger" disabled={disabled}>
        {icon}
        {title}
        <ChevronRight size={14} aria-hidden="true" />
      </MenuSubmenuTrigger>
      <MenuContent
        className="post-editor-command-menu post-editor-submenu"
        side="right"
        align="start"
        collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "end" }}
        finalFocus={false}
      >
        {children}
      </MenuContent>
    </MenuSubmenu>
  );
}

export function BlockMenu({
  editor,
  disabled,
  handlers,
  position,
  children,
  onStatus,
  context = false,
}: MenuProps & {
  position?: () => number;
  children: ReactNode;
  onStatus: (message: string) => void;
  context?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(0);
  const targetDocument = useRef(editor.state.doc);
  const contextPosition = useRef<number | null>(null);
  // 菜单关闭后仍可能保留旧位置；整段替换或撤销会缩短正文，不能读取越界节点。
  const node = target < editor.state.doc.content.size ? editor.state.doc.nodeAt(target) : null;
  const positions: number[] = [];
  editor.state.doc.forEach((_, pos) => positions.push(pos));
  const index = positions.indexOf(target);
  const ready = () => {
    if (editor.isEditable && editor.state.doc === targetDocument.current) return true;
    onStatus("正文已变化，请重新打开内容块菜单。");
    return false;
  };
  const changeOpen = (next: boolean) => {
    if (next) {
      if (disabled || !editor.isEditable) return;
      const selected = context
        ? (contextPosition.current ?? selectedBlock(editor))
        : (position?.() ?? selectedBlock(editor));
      if (
        selected < 0 ||
        selected >= editor.state.doc.content.size ||
        !editor.state.doc.nodeAt(selected)
      )
        return;
      setTarget(selected);
      targetDocument.current = editor.state.doc;
      // 类型入口选择整个内容块，后续格式、剪切和转换始终作用于同一个目标。
      editor.view.dispatch(
        editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, selected)),
      );
    }
    setOpen(next);
  };
  const act = (action: BlockAction) => {
    if (!ready()) return;
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
  const convert = (action: InsertAction) => {
    if (ready()) runType(editor, action);
  };
  const insert = (where: "before" | "after", action: InsertAction) => {
    if (!ready()) return;
    const at = target + (where === "after" ? (node?.nodeSize ?? 0) : 0);
    if (action.title === "图片" || action.title === "表格") {
      if (action.title === "图片") handlers.image(editor, at);
      else handlers.table(editor, at);
      return;
    }
    const transaction = blockTransaction(editor.state, target, where);
    if (!transaction) return;
    editor.view.dispatch(transaction);
    // 新段落的选择由事务给出；媒体弹窗则直接保留边界位置，取消不改正文。
    action.run(editor);
  };
  const contents = (
    <>
      {node && !node.isAtom && node.type.name !== "table" && (
        <>
          <CommandItems
            editor={editor}
            disabled={disabled}
            handlers={handlers}
            convert
            onRun={convert}
          />
          <MenuSeparator className="ds-menu-separator" />
          <Submenu title="缩进和对齐" icon={<AlignLeft size={16} />} disabled={disabled}>
            <AlignmentItems editor={editor} disabled={disabled} />
          </Submenu>
          <Submenu title="颜色" icon={<Palette size={16} />} disabled={disabled}>
            <ColorOptions editor={editor} disabled={disabled} menu />
          </Submenu>
          <MenuSeparator className="ds-menu-separator" />
        </>
      )}
      <MenuItem disabled={disabled} onClick={() => void clipboard(true)}>
        <Scissors size={16} />
        剪切
      </MenuItem>
      <MenuItem disabled={disabled} onClick={() => void clipboard(false)}>
        <Copy size={16} />
        复制
      </MenuItem>
      <MenuItem disabled={disabled} onClick={() => act("duplicate")}>
        <CopyPlus size={16} />
        创建副本
      </MenuItem>
      <MenuItem disabled={disabled} destructive onClick={() => act("delete")}>
        <Trash2 size={16} />
        删除内容块
      </MenuItem>
      <MenuSeparator className="ds-menu-separator" />
      <Submenu title="在上方添加" icon={<Plus size={16} />} disabled={disabled}>
        <MenuItem disabled={disabled} onClick={() => insert("before", insertActions(handlers)[0])}>
          正文
        </MenuItem>
        <CommandItems
          editor={editor}
          disabled={disabled}
          handlers={handlers}
          onRun={(action) => insert("before", action)}
        />
      </Submenu>
      <Submenu title="在下方添加" icon={<Plus size={16} />} disabled={disabled}>
        <MenuItem disabled={disabled} onClick={() => insert("after", insertActions(handlers)[0])}>
          正文
        </MenuItem>
        <CommandItems
          editor={editor}
          disabled={disabled}
          handlers={handlers}
          onRun={(action) => insert("after", action)}
        />
      </Submenu>
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
    </>
  );
  if (context)
    return (
      <ContextMenu open={open} onOpenChange={changeOpen} disabled={disabled}>
        <ContextMenuTrigger
          className="post-editor-context-area"
          onContextMenu={(event) => {
            const hit =
              event.clientX || event.clientY
                ? editor.view.posAtCoords({ left: event.clientX, top: event.clientY })
                : null;
            const resolved = hit ? editor.state.doc.resolve(hit.pos) : editor.state.selection.$from;
            contextPosition.current = resolved.depth ? resolved.before(1) : selectedBlock(editor);
          }}
          onKeyDown={(event) => {
            if (event.key === "F10" && event.shiftKey) {
              event.preventDefault();
              contextPosition.current = selectedBlock(editor);
              const point = editor.view.coordsAtPos(editor.state.selection.from);
              // 跨平台提供标准键盘上下文入口，菜单定位仍交给 Base UI。
              event.currentTarget.dispatchEvent(
                new MouseEvent("contextmenu", {
                  bubbles: true,
                  cancelable: true,
                  clientX: point.left + 2,
                  clientY: point.top + 2,
                }),
              );
            }
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            const hit = editor.view.posAtCoords({ left: touch.clientX, top: touch.clientY });
            const resolved = hit ? editor.state.doc.resolve(hit.pos) : editor.state.selection.$from;
            contextPosition.current = resolved.depth ? resolved.before(1) : selectedBlock(editor);
          }}
        >
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent
          className="post-editor-command-menu"
          aria-label="内容块操作"
          finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
        >
          {contents}
        </ContextMenuContent>
      </ContextMenu>
    );
  return (
    <Menu open={open} onOpenChange={changeOpen}>
      <MenuTrigger
        render={<Button type="button" variant="ghost" className="post-editor-block-type" />}
        disabled={disabled}
        aria-label="内容块操作"
        title="内容块操作"
      >
        {children}
      </MenuTrigger>
      <Button
        type="button"
        variant="ghost"
        className="post-editor-grip"
        aria-label="拖动或操作内容块"
        disabled={disabled}
        title="拖动排序，点击操作内容块"
        onClick={() => changeOpen(!open)}
      >
        <GripVertical size={13} />
      </Button>
      <MenuContent
        className="post-editor-command-menu"
        side="left"
        align="start"
        collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "end" }}
        finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
      >
        {contents}
      </MenuContent>
    </Menu>
  );
}

function AlignmentItems({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) =>
      ["left", "center", "right"].filter((value) => instance.isActive({ textAlign: value })),
  });
  return (
    <>
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
    </>
  );
}

export function AlignmentMenu({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  return (
    <Menu>
      <MenuTrigger
        render={<Button type="button" variant="ghost" className="post-editor-icon" />}
        disabled={disabled}
        aria-label="段落对齐"
      >
        <AlignLeft size={17} />
      </MenuTrigger>
      <MenuContent
        className="post-editor-command-menu"
        finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
      >
        <AlignmentItems editor={editor} disabled={disabled} />
      </MenuContent>
    </Menu>
  );
}

function ColorOptions({
  editor,
  disabled,
  menu = false,
  onApplied,
}: {
  editor: Editor;
  disabled: boolean;
  menu?: boolean;
  onApplied?: () => void;
}) {
  const control = ({
    label,
    pressed,
    style,
    children,
    apply,
  }: {
    label: string;
    pressed?: boolean;
    style?: CSSProperties;
    children?: ReactNode;
    apply: () => void;
  }) => {
    const onClick = () => {
      if (editor.isEditable) {
        apply();
        onApplied?.();
      }
    };
    return menu ? (
      <MenuItem
        key={label}
        className="post-color-swatch"
        aria-label={label}
        title={label}
        disabled={disabled}
        style={style}
        data-active={pressed}
        onClick={onClick}
      >
        {children}
      </MenuItem>
    ) : (
      <Button
        key={label}
        type="button"
        variant="ghost"
        className="post-color-swatch"
        aria-label={label}
        title={label}
        disabled={disabled}
        style={style}
        aria-pressed={pressed}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  };
  return (
    <div className="post-color-options">
      <p>字体颜色</p>
      <div className="post-color-swatches">
        {control({
          label: "默认文字颜色",
          children: "A",
          apply: () => editor.chain().focus().unsetColor().run(),
        })}
        {CONTENT_COLORS.map((item) =>
          control({
            label: `${item.name}文字`,
            children: "A",
            style: { color: textColor(item.key) },
            pressed: editor.isActive("textStyle", { color: textColor(item.key) }),
            apply: () => editor.chain().focus().setColor(textColor(item.key)).run(),
          }),
        )}
      </div>
      <p>背景颜色</p>
      <div className="post-color-swatches">
        {control({
          label: "清除背景高亮",
          children: <Eraser size={16} />,
          apply: () => editor.chain().focus().unsetHighlight().run(),
        })}
        {CONTENT_COLORS.map((item) =>
          control({
            label: `${item.name}高亮`,
            style: { backgroundColor: highlightColor(item.key) },
            pressed: editor.isActive("highlight", { color: highlightColor(item.key) }),
            apply: () =>
              editor
                .chain()
                .focus()
                .setHighlight({ color: highlightColor(item.key) })
                .run(),
          }),
        )}
      </div>
      {editor.isActive("callout") && (
        <>
          <p>高亮块颜色</p>
          <div className="post-color-swatches">
            {CONTENT_COLORS.map((item) =>
              control({
                label: `${item.name}高亮块`,
                style: { backgroundColor: highlightColor(item.key) },
                apply: () =>
                  editor.chain().focus().updateAttributes("callout", { tone: item.key }).run(),
              }),
            )}
          </div>
        </>
      )}
      {menu ? (
        <MenuItem
          disabled={disabled}
          onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()}
        >
          <Eraser size={16} />
          恢复默认
        </MenuItem>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className="post-color-reset"
          disabled={disabled}
          onClick={() => {
            editor.chain().focus().unsetColor().unsetHighlight().run();
            onApplied?.();
          }}
        >
          恢复默认
        </Button>
      )}
    </div>
  );
}

export function ColorMenu({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={<Button type="button" variant="ghost" className="post-editor-icon" />}
        aria-label="文字颜色与高亮"
      >
        <Palette size={17} />
      </PopoverTrigger>
      <PopoverContent
        className="post-color-menu"
        finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
      >
        <PopoverTitle className="sr-only">文字颜色与高亮</PopoverTitle>
        <ColorOptions editor={editor} disabled={disabled} onApplied={() => setOpen(false)} />
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
