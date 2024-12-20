"use client";

import { type User } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

import { localFormatDistanceToNow } from "@/utils/date";

import { UserActions } from "./user-actions";

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
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <UserActions userId={row.original.id} email={row.original.email} />
      );
    },
  },
];
