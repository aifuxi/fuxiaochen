import type { Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";

import { NodeSelection } from "@tiptap/pm/state";
import {
  addColumn,
  addRow,
  CellSelection,
  findTable,
  fixTables,
  TableMap,
} from "@tiptap/pm/tables";

type TableEditor = Pick<Editor, "state" | "isEditable"> & {
  view: Pick<Editor["view"], "dispatch">;
  commands: Pick<Editor["commands"], "focus">;
};

export function activeTable(state: EditorState) {
  const found = findTable(state.selection.$from);
  const selected =
    state.selection instanceof NodeSelection && state.selection.node.type.name === "table"
      ? { node: state.selection.node, pos: state.selection.from }
      : null;
  const table = found ?? selected;
  return table ? { ...table, map: TableMap.get(table.node), start: table.pos + 1 } : null;
}

export function selectTableAxis(
  editor: TableEditor,
  axis: "row" | "column",
  index: number,
  extend = false,
) {
  if (!editor.isEditable) return false;
  const table = activeTable(editor.state);
  if (!table || index < 0 || index >= (axis === "row" ? table.map.height : table.map.width))
    return false;
  const { map, start } = table;
  const previous = editor.state.selection;
  const anchor =
    extend && previous instanceof CellSelection
      ? previous.$anchorCell.pos
      : start + map.map[axis === "row" ? index * map.width : index];
  const head =
    start +
    map.map[axis === "row" ? (index + 1) * map.width - 1 : (map.height - 1) * map.width + index];

  editor.view.dispatch(
    editor.state.tr.setSelection(
      axis === "row"
        ? CellSelection.rowSelection(
            editor.state.doc.resolve(anchor),
            editor.state.doc.resolve(head),
          )
        : CellSelection.colSelection(
            editor.state.doc.resolve(anchor),
            editor.state.doc.resolve(head),
          ),
    ),
  );
  editor.commands.focus();
  return true;
}

export function insertTableAxis(editor: TableEditor, axis: "row" | "column", index: number) {
  if (!editor.isEditable) return false;
  const table = activeTable(editor.state);
  if (!table) return false;
  const { map, node, start } = table;
  const limit = axis === "row" ? map.height : map.width;
  if (index < 0 || index > limit || limit >= (axis === "column" ? 100 : 10_000)) return false;
  const rect = {
    map,
    table: node,
    tableStart: start,
    left: 0,
    right: map.width,
    top: 0,
    bottom: map.height,
  };
  // 公共表格事务按逻辑边界插入，正确延展跨越该边界的合并单元格。
  const tr = (axis === "row" ? addRow : addColumn)(editor.state.tr, rect, index);
  // 跨合并表头新增行时，公共插入算法尚未补齐列宽；在同一历史事务中完成规范化。
  const repaired = fixTables(editor.state.apply(tr));
  for (const step of repaired?.steps ?? []) tr.step(step);
  editor.view.dispatch(tr);
  editor.commands.focus();
  return true;
}

export function selectContextCell(editor: Editor, left: number, top: number) {
  const hit = editor.view.posAtCoords({ left, top });
  if (!hit) return false;
  const position = editor.state.doc.resolve(hit.pos);
  let cellPosition: number | null = null;
  for (let depth = position.depth; depth > 0; depth--) {
    const name = position.node(depth).type.name;
    if (name === "tableCell" || name === "tableHeader") {
      cellPosition = position.before(depth);
      break;
    }
  }
  if (cellPosition === null) return false;
  const current = editor.state.selection;
  if (current instanceof CellSelection) {
    let contains = false;
    current.forEachCell((_, pos) => {
      if (pos === cellPosition) contains = true;
    });
    if (contains) return true;
  }
  editor.view.dispatch(
    editor.state.tr.setSelection(CellSelection.create(editor.state.doc, cellPosition)),
  );
  return true;
}
