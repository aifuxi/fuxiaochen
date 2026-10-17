"use client";

import type { Editor } from "@tiptap/core";

import { NodeSelection } from "@tiptap/pm/state";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
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
  Type,
} from "lucide-react";
import { useRef, useState, type ReactNode, type KeyboardEvent, type CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent } from "@/components/ui/context-menu";
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
import {
  CONTENT_BACKGROUNDS,
  CONTENT_COLORS,
  highlightColor,
  textColor,
} from "@/lib/posts/content-palette";
import { isImageParagraph } from "@/lib/posts/prose";

import {
  insertActions,
  blockTransaction,
  copyBlock,
  selectedBlock,
  blockTypeName,
  type InsertHandlers,
  type BlockAction,
} from "./editor-commands";
import { selectContextCell } from "./table-actions";
import { TableMenuItems } from "./table-controls";

type MenuProps = { editor: Editor; disabled: boolean; handlers: InsertHandlers };
type InsertAction = ReturnType<typeof insertActions>[number];
type RecentColor = { kind: "color" | "highlight"; value: string | null };
// 最近颜色是编辑 UI 状态，按 Editor 隔离，并由文字栏和表格栏共用。
const recentColors = new WeakMap<Editor, RecentColor>();
const defaultRecentColor: RecentColor = { kind: "highlight", value: highlightColor("yellow") };

function textBlockType(editor: Editor) {
  const { $from } = editor.state.selection;
  // 表格选区从单元格边界开始，类型入口仍表示其中的文字块。
  const firstCell =
    editor.state.selection instanceof CellSelection
      ? editor.state.selection.$anchorCell.nodeAfter
      : null;
  if (firstCell) return blockTypeName(firstCell.firstChild);
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (["listItem", "taskItem", "blockquote", "callout"].includes(node.type.name))
      return blockTypeName(node);
  }
  return $from.parent.isTextblock
    ? blockTypeName($from.parent)
    : blockTypeName(editor.state.doc.nodeAt(selectedBlock(editor)));
}

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
  presentation = "grid",
}: MenuProps & {
  convert?: boolean;
  onRun?: (action: InsertAction) => void;
  presentation?: "grid" | "list";
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => textBlockType(instance),
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
  if (presentation === "list") {
    const entry = (title: string) => {
      const action = actions.find((item) => item.title === title)!;
      return (
        <MenuItem
          key={title}
          disabled={disabled}
          data-active={active === title}
          onClick={() => execute(action)}
        >
          <action.icon size={18} aria-hidden="true" />
          {title}
          {active === title && (
            <Check className="post-editor-current-check" size={16} aria-hidden="true" />
          )}
        </MenuItem>
      );
    };
    return (
      <>
        {["正文", "一级标题", "二级标题", "三级标题"].map(entry)}
        <Submenu title="其他标题" icon={<Type size={18} />} disabled={disabled}>
          {["四级标题", "五级标题", "六级标题"].map(entry)}
        </Submenu>
        {["有序列表", "无序列表", "任务列表", "代码块"].map(entry)}
        <MenuSeparator className="ds-menu-separator" />
        {["引用", "高亮块"].map(entry)}
      </>
    );
  }
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
  const currentType = useEditorState({
    editor,
    selector: ({ editor: instance }) => textBlockType(instance),
  });
  const TypeIcon = insertActions(handlers).find((item) => item.title === currentType)?.icon ?? Type;
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
        render={
          <Button
            type="button"
            variant="ghost"
            className={convert ? "post-editor-type-trigger" : "post-editor-icon"}
          />
        }
        disabled={disabled}
        aria-label={convert ? "转换文字类型" : "插入内容"}
      >
        {convert ? (
          <>
            <TypeIcon size={18} aria-hidden="true" />
            <ChevronDown size={12} aria-hidden="true" />
          </>
        ) : (
          children
        )}
      </MenuTrigger>
      <MenuContent
        className="post-editor-command-menu"
        side={convert ? "bottom" : "left"}
        align="start"
        collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "end" }}
        finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
      >
        <CommandItems
          editor={editor}
          disabled={disabled}
          handlers={handlers}
          convert={convert}
          presentation={convert ? "list" : "grid"}
        />
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
  onOpenChange,
}: MenuProps & {
  position?: () => number;
  children: ReactNode;
  onStatus: (message: string) => void;
  context?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(0);
  const targetDocument = useRef(editor.state.doc);
  const contextPosition = useRef<number | null>(null);
  const contextTable = useRef(false);
  const [tableContext, setTableContext] = useState(false);
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
      const selectedNode = editor.state.doc.nodeAt(selected)!;
      const isTable = selectedNode.type.name === "table";
      setTableContext(isTable);
      onOpenChange?.(true);
      if (isTable) {
        if (!context || !contextTable.current) {
          const map = TableMap.get(selectedNode);
          editor.view.dispatch(
            editor.state.tr.setSelection(
              CellSelection.create(
                editor.state.doc,
                selected + 1 + map.map[0],
                selected + 1 + map.map[map.map.length - 1],
              ),
            ),
          );
        }
        setOpen(true);
        return;
      }
      // 类型入口选择整个内容块，后续格式、剪切和转换始终作用于同一个目标。
      editor.view.dispatch(
        editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, selected)),
      );
    }
    if (!next) onOpenChange?.(false);
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
      {tableContext && (
        <>
          <TableMenuItems editor={editor} disabled={disabled} />
          <MenuSeparator className="ds-menu-separator" />
        </>
      )}
      {!tableContext && node && !node.isAtom && !isImageParagraph(node) && (
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
            contextTable.current = selectContextCell(editor, event.clientX, event.clientY);
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
  const current = useEditorState({
    editor,
    selector: ({ editor: instance }) =>
      instance.isActive({ textAlign: "center" })
        ? "center"
        : instance.isActive({ textAlign: "right" })
          ? "right"
          : "left",
  });
  const Icon = current === "center" ? AlignCenter : current === "right" ? AlignRight : AlignLeft;
  return (
    <Menu>
      <MenuTrigger
        render={<Button type="button" variant="ghost" className="post-editor-type-trigger" />}
        disabled={disabled}
        aria-label="段落对齐"
      >
        <Icon size={18} />
        <ChevronDown size={12} aria-hidden="true" />
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
    recent,
  }: {
    label: string;
    pressed?: boolean;
    style?: CSSProperties;
    children?: ReactNode;
    apply: () => void;
    recent?: RecentColor;
  }) => {
    const onClick = () => {
      if (editor.isEditable) {
        if (recent) recentColors.set(editor, recent);
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
          recent: { kind: "color", value: null },
          apply: () => editor.chain().focus().unsetColor().run(),
        })}
        {CONTENT_COLORS.map((item) =>
          control({
            label: `${item.name}文字`,
            children: "A",
            style: { color: textColor(item.key) },
            pressed: editor.isActive("textStyle", { color: textColor(item.key) }),
            recent: { kind: "color", value: textColor(item.key) },
            apply: () => editor.chain().focus().setColor(textColor(item.key)).run(),
          }),
        )}
      </div>
      <p>背景颜色</p>
      <div className="post-color-swatches">
        {control({
          label: "清除背景高亮",
          children: <Eraser size={16} />,
          recent: { kind: "highlight", value: null },
          apply: () => editor.chain().focus().unsetHighlight().run(),
        })}
        {CONTENT_BACKGROUNDS.map((item) =>
          control({
            label: `${item.name}高亮`,
            style: { backgroundColor: item.value },
            pressed: editor.isActive("highlight", { color: item.value }),
            recent: { kind: "highlight", value: item.value },
            apply: () => editor.chain().focus().setHighlight({ color: item.value }).run(),
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
  const recent = useEditorState({
    editor,
    selector: ({ editor: instance }) => recentColors.get(instance) ?? defaultRecentColor,
  });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <span className="post-color-split">
        <Button
          type="button"
          variant="ghost"
          className="post-editor-icon post-color-recent"
          disabled={disabled}
          aria-label="应用最近颜色"
          title="应用最近颜色"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            const chain = editor.chain().focus();
            if (recent.kind === "color") {
              if (recent.value) chain.setColor(recent.value);
              else chain.unsetColor();
            } else if (recent.value) chain.setHighlight({ color: recent.value });
            else chain.unsetHighlight();
            chain.run();
          }}
        >
          <span
            className="post-color-sample"
            style={
              recent.kind === "color"
                ? { color: recent.value ?? undefined }
                : { backgroundColor: recent.value ?? undefined }
            }
          >
            A
          </span>
        </Button>
        <PopoverTrigger
          disabled={disabled}
          render={<Button type="button" variant="ghost" className="post-editor-color-arrow" />}
          aria-label="文字颜色与高亮"
        >
          <ChevronDown size={12} />
        </PopoverTrigger>
      </span>
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
  anchor,
}: {
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
  disabled: boolean;
  finalFocus?: () => HTMLElement;
  anchor?: React.ComponentProps<typeof PopoverContent>["anchor"];
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
    <Popover
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <PopoverContent
        className="post-table-picker"
        anchor={anchor}
        side="left"
        align="start"
        sideOffset={8}
        collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "end" }}
        finalFocus={finalFocus ?? false}
      >
        <div className="post-table-picker-heading">
          <PopoverTitle className="post-editor-menu-caption">插入支持富文本的表格</PopoverTitle>
          <output aria-live="polite">
            {choice.rows} × {choice.cols}
          </output>
        </div>
        <p className="sr-only">选择行列数量，使用方向键调整，Enter 插入。</p>
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
        {error && (
          <p className="admin-post-error" role="alert">
            {error}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
