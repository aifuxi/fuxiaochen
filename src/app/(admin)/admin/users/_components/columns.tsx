"use client";

import { type User } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

import { localFormatDistanceToNow } from "@/utils/date";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "昵称",
  },
  {
    accessorKey: "email",
    header: "邮箱",
  },
  {
    accessorKey: "role",
    header: "角色",
  },
  {
    accessorKey: "banned",
    header: "状态",
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => {
      return localFormatDistanceToNow(row.original.createdAt);
    },
  },
];
