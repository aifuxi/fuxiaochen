"use client";

import * as React from "react";

import { type ColumnDef } from "@tanstack/react-table";
import { Delete } from "lucide-react";
import { useImmer } from "use-immer";

import { AdminContentLayout } from "@/app/admin/components/admin-content-layout";

import { type Category, type GetCategoriesRequest } from "@/types/category";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { IllustrationNoContent } from "@/components/illustrations";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";

import { useGetCategories } from "./api";
import { CreateCategoryButton } from "./components/create-category-button";
import { DeleteCategoryButton } from "./components/delete-category-button";
import { CategoryListPageHeader } from "./components/header";
import { UpdateCategoryButton } from "./components/update-category-button";

export default function Page() {
  const [queries, updateQueries] = useImmer<
    GetCategoriesRequest & { filtered: boolean }
  >({
    name: "",
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
    filtered: false,
  });

  const { data, isLoading, mutate } = useGetCategories(queries);

  const columns: ColumnDef<Category>[] = [
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
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            <UpdateCategoryButton id={record.id} onSuccess={mutate} />
            <DeleteCategoryButton id={record.id} onSuccess={mutate} />
          </div>
        );
      },
    },
  ];

  return (
    <AdminContentLayout
      header={
        <CategoryListPageHeader
          extra={<CreateCategoryButton onSuccess={mutate} />}
        />
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
        data={data?.categories ?? []}
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
