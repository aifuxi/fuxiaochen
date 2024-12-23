import { type Blog } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

import { CreateTimeTooltip } from "@/components/create-time-tooltip";

import { BlogActions } from "./blog-actions";

export const columns: ColumnDef<Blog>[] = [
  {
    accessorKey: "title",
    header: "标题",
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
      return <BlogActions blog={row.original} />;
    },
  },
];
