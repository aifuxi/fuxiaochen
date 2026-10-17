"use client";

import type { Editor } from "@tiptap/core";
import type { ReactNode, RefObject } from "react";

import { CellSelection } from "@tiptap/pm/tables";
import { useEditorState } from "@tiptap/react";
import {
  Columns3,
  Ellipsis,
  Equal,
  Merge,
  PaintBucket,
  Plus,
  Rows3,
  Split,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { CONTENT_BACKGROUNDS } from "@/lib/posts/content-palette";

import { equalizeTable } from "./editor-commands";
import { activeTable, insertTableAxis, selectTableAxis } from "./table-actions";

export function CellColorMenu({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        aria-label="单元格背景颜色"
        title="单元格背景颜色"
        render={<Button type="button" variant="ghost" className="post-editor-icon" />}
      >
        <PaintBucket size={18} />
      </PopoverTrigger>
      <PopoverContent
        className="post-color-menu"
        finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
      >
        <PopoverTitle className="post-editor-menu-caption">单元格背景颜色</PopoverTitle>
        <div className="post-color-swatches">
          {[{ name: "清除", value: null }, ...CONTENT_BACKGROUNDS].map((item) => (
            <Button
              key={item.name}
              type="button"
              variant="ghost"
              className="post-color-swatch"
              style={{ backgroundColor: item.value ?? undefined }}
              aria-label={`${item.name}单元格背景`}
              title={`${item.name}单元格背景`}
              disabled={disabled}
              onClick={() => {
                editor.chain().focus().setCellAttribute("backgroundColor", item.value).run();
                setOpen(false);
              }}
            >
              {item.value === null ? <span className="post-color-none" /> : null}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const operations = [
  { title: "在上方插入行", command: "addRowBefore", icon: Rows3 },
  { title: "在下方插入行", command: "addRowAfter", icon: Rows3 },
  { title: "在左侧插入列", command: "addColumnBefore", icon: Columns3 },
  { title: "在右侧插入列", command: "addColumnAfter", icon: Columns3 },
  { title: "合并单元格", command: "mergeCells", icon: Merge },
  { title: "拆分单元格", command: "splitCell", icon: Split },
  { title: "切换标题行", command: "toggleHeaderRow", icon: Rows3 },
  { title: "切换标题列", command: "toggleHeaderColumn", icon: Columns3 },
  { title: "删除行", command: "deleteRow", icon: Rows3 },
  { title: "删除列", command: "deleteColumn", icon: Columns3 },
  { title: "删除表格", command: "deleteTable", icon: Trash2 },
] as const;

export function TableMenuItems({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const available = useEditorState({
    editor,
    selector: ({ editor: instance }) => {
      const table = activeTable(instance.state);
      return operations.map((item) => {
        if (item.command.startsWith("addColumn") && table && table.map.width >= 100) return false;
        if (item.command.startsWith("addRow") && table && table.map.height >= 10_000) return false;
        return instance.can()[item.command]();
      });
    },
  });
  return (
    <>
      {operations.map((item, index) => (
        <MenuItem
          key={item.command}
          disabled={disabled || !available[index]}
          destructive={item.command.startsWith("delete")}
          onClick={() => editor.chain().focus()[item.command]().run()}
        >
          <item.icon size={16} />
          {item.title}
        </MenuItem>
      ))}
      <MenuSeparator className="ds-menu-separator" />
      <MenuItem disabled={disabled} onClick={() => equalizeTable(editor)}>
        <Equal size={16} />
        均分列宽
      </MenuItem>
    </>
  );
}

export function TableTools({
  editor,
  disabled,
  children,
}: {
  editor: Editor;
  disabled: boolean;
  children: ReactNode;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => {
      const selection = instance.state.selection;
      return {
        row: selection instanceof CellSelection && selection.isRowSelection(),
        col: selection instanceof CellSelection && selection.isColSelection(),
        merge: instance.can().mergeCells(),
        split: instance.can().splitCell(),
        header: instance.isActive("tableHeader"),
      };
    },
  });
  const label =
    state.row && state.col
      ? "删除表格"
      : state.row
        ? "删除行"
        : state.col
          ? "删除列"
          : "清空单元格";
  const HeaderIcon = state.col && !state.row ? Columns3 : Rows3;
  return (
    <div role="toolbar" aria-label="表格工具">
      <Button
        type="button"
        variant="ghost"
        className="post-editor-icon"
        disabled={disabled}
        aria-label={state.col && !state.row ? "切换标题列" : "切换标题行"}
        title={state.col && !state.row ? "切换标题列" : "切换标题行"}
        aria-pressed={state.header}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const chain = editor.chain().focus();
          chain[state.col && !state.row ? "toggleHeaderColumn" : "toggleHeaderRow"]().run();
        }}
      >
        <HeaderIcon size={18} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="post-editor-icon"
        disabled={disabled || (!state.split && !state.merge)}
        aria-label={state.split ? "拆分单元格" : "合并单元格"}
        title={state.split ? "拆分单元格" : "合并单元格"}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus()[state.split ? "splitCell" : "mergeCells"]().run()}
      >
        {state.split ? <Split size={18} /> : <Merge size={18} />}
      </Button>
      <span className="post-editor-toolbar-divider" aria-hidden="true" />
      <CellColorMenu editor={editor} disabled={disabled} />
      <span className="post-editor-toolbar-divider" aria-hidden="true" />
      {children}
      <span className="post-editor-toolbar-divider" aria-hidden="true" />
      <Menu>
        <MenuTrigger
          disabled={disabled}
          aria-label="更多表格操作"
          title="更多表格操作"
          render={<Button type="button" variant="ghost" className="post-editor-icon" />}
        >
          <Ellipsis size={18} />
        </MenuTrigger>
        <MenuContent
          className="post-editor-command-menu"
          finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
        >
          <TableMenuItems editor={editor} disabled={disabled} />
        </MenuContent>
      </Menu>
      <Button
        type="button"
        variant="ghost"
        className="post-editor-icon"
        disabled={disabled}
        aria-label={label}
        title={label}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const chain = editor.chain().focus();
          if (state.row && state.col) chain.deleteTable();
          else if (state.row) chain.deleteRow();
          else if (state.col) chain.deleteColumn();
          else chain.deleteSelection();
          chain.run();
        }}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  );
}

type Layout = {
  left: number;
  top: number;
  width: number;
  height: number;
  columns: number[];
  rows: number[];
  scroll: number;
};
export function TableControls({
  editor,
  host,
  disabled,
}: {
  editor: Editor;
  host: RefObject<HTMLDivElement | null>;
  disabled: boolean;
}) {
  const snapshot = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      doc: instance.state.doc,
      selection: instance.state.selection,
    }),
  });
  const [layout, setLayout] = useState<Layout | null>(null);
  const table = activeTable(editor.state);
  const position = table?.pos;
  useEffect(() => {
    if (position === undefined || disabled) {
      return undefined;
    }
    const node = editor.view.nodeDOM(position);
    const element =
      node instanceof HTMLElement
        ? node.matches("table")
          ? node
          : node.querySelector("table")
        : null;
    const wrapper = element?.closest<HTMLElement>(".tableWrapper");
    if (!element || !wrapper || !host.current) {
      return undefined;
    }
    let frame = 0;
    const measure = () => {
      const parent = host.current?.getBoundingClientRect();
      if (!parent) return;
      const rect = element.getBoundingClientRect(),
        outer = wrapper.getBoundingClientRect();
      const padding = Number.parseFloat(getComputedStyle(wrapper).paddingLeft) || 0;
      setLayout({
        left: outer.left + padding - parent.left,
        top: rect.top - parent.top,
        width: wrapper.clientWidth - padding,
        height: rect.height,
        columns: Array.from(element.querySelectorAll("colgroup > col")).map(
          (col) => col.getBoundingClientRect().width,
        ),
        rows: Array.from(element.querySelectorAll("tr")).map(
          (row) => row.getBoundingClientRect().height,
        ),
        scroll: wrapper.scrollLeft,
      });
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(wrapper);
    const mutations = new MutationObserver(update);
    mutations.observe(editor.view.dom, {
      subtree: true,
      childList: true,
      characterData: true,
      // 表格总宽不变时，拖动列边界仍会改变 col 的内联尺寸。
      attributes: true,
      attributeFilter: ["style", "colwidth", "colspan", "rowspan"],
    });
    wrapper.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      wrapper.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [editor, host, disabled, position]);
  if (!layout || !table || disabled) return null;
  const selection = snapshot.selection;
  const selectedRect =
    selection instanceof CellSelection
      ? table.map.rectBetween(
          selection.$anchorCell.pos - table.start,
          selection.$headCell.pos - table.start,
        )
      : null;
  const columns =
    layout.columns.length === table.map.width
      ? layout.columns
      : Array.from({ length: table.map.width }, () => layout.width / table.map.width);
  const rowOffsets = layout.rows.reduce<number[]>(
    (all, height) => [...all, all[all.length - 1] + height],
    [0],
  );
  const colOffsets = columns.reduce<number[]>(
    (all, width) => [...all, all[all.length - 1] + width],
    [0],
  );
  return (
    <ContextMenu disabled={disabled}>
      <ContextMenuTrigger
        className="post-table-frame"
        style={{ left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
      >
        <div className="post-table-column-strip" aria-label="选择表格列">
          {columns.map((width, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              className="post-table-axis"
              style={{ left: colOffsets[index] - layout.scroll, width }}
              aria-label={`选择第 ${index + 1} 列`}
              aria-pressed={Boolean(
                selectedRect &&
                selection instanceof CellSelection &&
                selection.isColSelection() &&
                index >= selectedRect.left &&
                index < selectedRect.right,
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(event) => selectTableAxis(editor, "column", index, event.shiftKey)}
              onContextMenu={() => selectTableAxis(editor, "column", index)}
            />
          ))}
        </div>
        <div className="post-table-row-strip" aria-label="选择表格行">
          {layout.rows.map((height, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              className="post-table-axis"
              style={{ top: rowOffsets[index], height }}
              aria-label={`选择第 ${index + 1} 行`}
              aria-pressed={Boolean(
                selectedRect &&
                selection instanceof CellSelection &&
                selection.isRowSelection() &&
                index >= selectedRect.top &&
                index < selectedRect.bottom,
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(event) => selectTableAxis(editor, "row", index, event.shiftKey)}
              onContextMenu={() => selectTableAxis(editor, "row", index)}
            />
          ))}
        </div>
        <div className="post-table-column-insert">
          {colOffsets.map((offset, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              tabIndex={-1}
              className="post-table-insert"
              style={{ left: offset - layout.scroll }}
              aria-label={`在第 ${index + 1} 个列边界插入列`}
              title="插入列"
              disabled={columns.length >= 100}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertTableAxis(editor, "column", index)}
            >
              <Plus size={14} />
            </Button>
          ))}
        </div>
        <div className="post-table-row-insert">
          {rowOffsets.map((offset, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              tabIndex={-1}
              className="post-table-insert"
              style={{ top: offset }}
              aria-label={`在第 ${index + 1} 个行边界插入行`}
              title="插入行"
              disabled={layout.rows.length >= 10_000}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertTableAxis(editor, "row", index)}
            >
              <Plus size={14} />
            </Button>
          ))}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="post-editor-command-menu"
        aria-label="表格行列操作"
        finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
      >
        <TableMenuItems editor={editor} disabled={disabled} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
