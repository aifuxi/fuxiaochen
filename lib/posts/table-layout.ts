import type { Node } from "@tiptap/pm/model";

// 与 Tiptap 列宽协议一致：0 表示该列尚未指定宽度，合并单元格按 colspan 展开。
export function tableColumns(table: Node): number[] {
  const widths: number[] = [];
  table.firstChild?.forEach((cell) => {
    for (let index = 0; index < cell.attrs.colspan; index++)
      widths.push(cell.attrs.colwidth?.[index] ?? 0);
  });
  return widths;
}
