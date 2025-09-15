"use client";

import * as React from "react";

import { type ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { IllustrationNoContent } from "@/components/illustrations";

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  PLACEHOLDER_TEXT,
  ROLE_LABEL_MAP,
} from "@/constants";
import { type UserOmitPassword, useGetUsers } from "@/features/user";

import {
  AdminContentLayout,
  CreateUserButton,
  DateTableCell,
  DeleteUserButton,
  UpdateUserButton,
  UserListPageHeader,
} from "../../components";

export function AdminUserListPage() {
  const [queries, updateQueries] = useQueryStates({
    name: parseAsString.withDefault("").withOptions({
      clearOnDefault: false,
    }),
    email: parseAsString.withDefault("").withOptions({
      clearOnDefault: false,
    }),
    pageIndex: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX).withOptions({
      clearOnDefault: false,
    }),
    pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE).withOptions({
      clearOnDefault: false,
    }),
  });

  const columns: ColumnDef<UserOmitPassword>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "用户名",
      cell: ({ row }) => {
        return row.original.name;
      },
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => {
        return row.original.email;
      },
    },
    {
      accessorKey: "role",
      header: "角色",
      cell: ({ row }) => {
        return row.original.role ? (
          <Badge
            variant={row.original.role === "admin" ? "default" : "outline"}
          >
            {ROLE_LABEL_MAP[row.original.role as keyof typeof ROLE_LABEL_MAP]}
          </Badge>
        ) : (
          PLACEHOLDER_TEXT
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell({ row }) {
        return <DateTableCell date={row.original.createdAt} />;
      },
    },
    {
      accessorKey: "updatedAt",
      header: "更新时间",
      cell({ row }) {
        return <DateTableCell date={row.original.updatedAt} />;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            <UpdateUserButton id={record.id} onSuccess={() => mutate()} />
            <DeleteUserButton id={record.id} onSuccess={() => mutate()} />
          </div>
        );
      },
    },
  ];

  const { isLoading, data, mutate } = useGetUsers(queries);

  return (
    <AdminContentLayout
      header={
        <UserListPageHeader
          extra={<CreateUserButton onSuccess={() => mutate()} />}
        />
      }
    >
      <div className="flex items-center gap-4">
        <Input
          placeholder="请输入邮箱"
          inputSize="lg"
          value={queries.email}
          onChange={(v) => {
            updateQueries({
              email: v.target.value,
              pageIndex: DEFAULT_PAGE_INDEX,
            });
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              mutate();
            }
          }}
        />
        <Input
          placeholder="请输入用户名"
          inputSize="lg"
          value={queries.name}
          onChange={(v) => {
            updateQueries({
              name: v.target.value,
              pageIndex: DEFAULT_PAGE_INDEX,
            });
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              mutate();
            }
          }}
        />
      </div>
      <DataTable
        columns={columns}
        data={data?.users ?? []}
        total={data?.total}
        loading={isLoading}
        pagination={{
          pageIndex: queries.pageIndex,
          pageSize: queries.pageSize,
          onPaginationChange(page: number, pageSize: number) {
            updateQueries({
              pageIndex: page,
              pageSize,
            });
          },
        }}
        noResult={
          <div className="grid place-content-center gap-4 py-16">
            <IllustrationNoContent />
            <p>暂无数据</p>
          </div>
        }
      />
    </AdminContentLayout>
  );
}
