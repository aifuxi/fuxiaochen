import type { CellContext, RowData } from "@tanstack/react-table";

import { RowActions, type RowActionsProps } from "@/components/ui/menu";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    getRowActions?: (item: TData) => RowActionsProps;
    editRow?: (item: TData) => void;
    disableActions?: boolean;
    postClock?: number | null;
  }
}

export function AdminRowActionsCell<TData>({ row, table }: CellContext<TData, unknown>) {
  const actions = table.options.meta?.getRowActions?.(row.original);
  return actions ? <RowActions {...actions} /> : null;
}
