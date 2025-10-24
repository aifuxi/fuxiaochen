"use client";

import * as React from "react";

import { type ColumnDef } from "@tanstack/react-table";
import { Delete } from "lucide-react";
import { useImmer } from "use-immer";

import { AdminContentLayout } from "@/app/admin/components/admin-content-layout";

import { type GetUsersRequest, type UserOmitPassword } from "@/types/user";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import { useGetUsers } from "./api";
import { DeleteUserButton } from "./components/delete-user-button";
import { FilterRoleTag } from "./components/filter-role-tag";
import { UserListPageHeader } from "./components/header";
import { UpdateUserButton } from "./components/update-user-button";

export default function Page() {
  const [queries, updateQueries] = useImmer<
    GetUsersRequest & { filtered?: boolean }
  >({
    name: "",
    email: "",
    roles: [],
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
    filtered: false,
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
      id: "actions",
      header: "操作",
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

  const { isLoading, data, mutate } = useGetUsers({
    ...queries,
    roles: queries.roles ?? [],
  });

  return (
    <AdminContentLayout header={<UserListPageHeader />}>
      <div className="flex items-center gap-4">
        <Input
          placeholder="请输入邮箱"
          className="w-64"
          value={queries.email}
          onChange={(v) => {
            updateQueries((draft) => {
              draft.email = v.target.value;
              draft.pageIndex = DEFAULT_PAGE_INDEX;
              draft.filtered = true;
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
          className="w-64"
          value={queries.name}
          onChange={(v) => {
            updateQueries((draft) => {
              draft.name = v.target.value;
              draft.pageIndex = DEFAULT_PAGE_INDEX;
              draft.filtered = true;
            });
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              mutate();
            }
          }}
        />
        <FilterRoleTag
          value={queries.roles ?? []}
          onChange={(v) => {
            updateQueries((draft) => {
              draft.roles = v.length ? v : [];
              draft.pageIndex = DEFAULT_PAGE_INDEX;
              draft.filtered = true;
            });
          }}
        />

        {queries.filtered && (
          <Button
            variant="secondary"
            onClick={() => {
              updateQueries({
                name: "",
                email: "",
                roles: [],
                pageIndex: DEFAULT_PAGE_INDEX,
                pageSize: DEFAULT_PAGE_SIZE,
                filtered: false,
              });
            }}
          >
            重置
            <Delete />
          </Button>
        )}
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
