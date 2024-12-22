import { type Tag } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

import { CreateTimeTooltip } from "@/components/create-time-tooltip";

import { TagActions } from "./tag-actions";

export const columns: ColumnDef<Tag>[] = [
  {
    accessorKey: "name",
    header: "名称",
  },
  {
    accessorKey: "slug",
    header: "别名",
  },
  {
    accessorKey: "description",
    header: "描述",
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => {
      return <CreateTimeTooltip date={row.original.createdAt} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <TagActions tag={row.original} />;
    },
  },
];
