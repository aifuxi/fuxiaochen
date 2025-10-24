"use client";

import * as React from "react";

import { type ColumnDef } from "@tanstack/react-table";
import { Delete } from "lucide-react";
import { useImmer } from "use-immer";

import { AdminContentLayout } from "@/app/admin/components/admin-content-layout";

import { type GetTagsRequest, type Tag } from "@/types/tag";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { IllustrationNoContent } from "@/components/illustrations";

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  PLACEHOLDER_TEXT,
} from "@/constants";

import { useGetTags } from "./api";
import { CreateTagButton } from "./components/create-tag-button";
import { DeleteTagButton } from "./components/delete-tag-button";
import { TagListPageHeader } from "./components/header";
import { UpdateTagButton } from "./components/update-tag-button";

export default function Page() {
  const [queries, updateQueries] = useImmer<
    GetTagsRequest & { filtered: boolean }
  >({
    name: "",
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
    filtered: false,
  });

  const { data, isLoading, mutate } = useGetTags(queries);

  const columns: ColumnDef<Tag>[] = [
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
      header: "名称",
      cell: ({ row }) => {
        return row.original.name;
      },
    },
    {
      accessorKey: "icon",
      header: "浅色图标",
      cell: ({ row }) => {
        return row.original.icon ? (
          <img src={row.original.icon} className="size-10" alt="" />
        ) : (
          PLACEHOLDER_TEXT
        );
      },
    },
    {
      accessorKey: "iconDark",
      header: "深色图标",
      cell: ({ row }) => {
        return row.original.iconDark ? (
          <img src={row.original.iconDark} className="size-10" alt="" />
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
            <UpdateTagButton id={record.id} onSuccess={mutate} />
            <DeleteTagButton id={record.id} onSuccess={mutate} />
          </div>
        );
      },
    },
  ];

  return (
    <AdminContentLayout
      header={
        <TagListPageHeader extra={<CreateTagButton onSuccess={mutate} />} />
      }
    >
      <div className="flex items-center gap-4">
        <Input
          placeholder="请输入名称"
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
        {queries.filtered && (
          <Button
            variant="secondary"
            onClick={() => {
              updateQueries((draft) => {
                draft.name = "";
                draft.pageIndex = DEFAULT_PAGE_INDEX;
                draft.filtered = false;
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
        data={data?.tags ?? []}
        total={data?.total}
        loading={isLoading}
        pagination={{
          pageIndex: queries.pageIndex,
          pageSize: queries.pageSize,
          onPaginationChange(page: number, pageSize: number) {
            updateQueries((draft) => {
              draft.pageIndex = page;
              draft.pageSize = pageSize;
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
