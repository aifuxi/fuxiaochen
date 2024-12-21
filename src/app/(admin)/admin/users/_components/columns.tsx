"use client";

import { Role, type User } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { CreateTimeTooltip } from "@/components/create-time-tooltip";

import { BannedSwitch } from "./banned-switch";
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
    cell: ({ row }) => {
      const { role } = row.original;
      if (role === Role.ADMIN) {
        return <Badge variant="default">管理员</Badge>;
      }
      if (role === Role.USER) {
        return <Badge variant="outline">普通用户</Badge>;
      }
    },
  },
  {
    accessorKey: "banned",
    header: "状态",
    cell: ({ row }) => {
      const { banned, id } = row.original;
      return <BannedSwitch banned={banned} id={id} />;
    },
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
      return (
        <UserActions userId={row.original.id} email={row.original.email} />
      );
    },
  },
];
