"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Pen, Plus } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { IllustrationNoContent } from "@/components/illustrations";

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  PATHS,
  PLACEHOLDER_TEXT,
} from "@/constants";
import { type Snippet, useGetSnippets } from "@/features/snippet";
import { cn } from "@/lib/utils";

import {
  AdminContentLayout,
  DateTableCell,
  DeleteSnippetButton,
  SnippetListPageHeader,
  ToggleSnippetPublishSwitch,
} from "../../components";

export function AdminSnippetListPage({ isAdmin: _ }: { isAdmin: boolean }) {
  const router = useRouter();
  const [queries, updateQueries] = useQueryStates({
    title: parseAsString.withDefault(""),
    pageIndex: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX),
    pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  });

  const { data, isLoading, mutate } = useGetSnippets(queries);

  const columns: ColumnDef<Snippet>[] = [
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
      accessorKey: "title",
      header: "标题",
      cell: ({ row }) => {
        return row.original.title;
      },
    },
    {
      accessorKey: "tags",
      header: "标签",
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap gap-2">
            {row.original.tags.length
              ? row.original.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))
              : PLACEHOLDER_TEXT}
          </div>
        );
      },
    },
    {
      accessorKey: "published",
      header: "发布状态",
      cell: ({ row }) => {
        return (
          <ToggleSnippetPublishSwitch
            id={row.original.id}
            published={row.original.published}
            onSuccess={() => {
              mutate();
            }}
          />
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
        return (
          <div className="flex items-center gap-2">
            <Link
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
              )}
              href={`${PATHS.SITE_SNIPPET}/${row.original.slug}`}
              target="_blank"
            >
              <Eye />
            </Link>
            <Button
              size={"icon"}
              variant="outline"
              onClick={() => {
                handleGoToEdit(row.original.id);
              }}
            >
              <Pen />
            </Button>
            <DeleteSnippetButton
              id={row.original.id}
              onSuccess={() => {
                mutate();
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <AdminContentLayout
      header={
        <SnippetListPageHeader
          extra={
            <Button onClick={handleGoToCreate}>
              <Plus />
              创建片段
            </Button>
          }
        />
      }
    >
      <div className="flex items-center gap-4">
        <Input
          placeholder="请输入标题"
          value={queries.title}
          inputSize="lg"
          onChange={(v) => {
            updateQueries({
              title: v.target.value,
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
        data={data?.snippets ?? []}
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
  function handleGoToCreate() {
    router.push(PATHS.ADMIN_SNIPPET_CREATE);
  }

  function handleGoToEdit(id: string) {
    router.push(`${PATHS.ADMIN_SNIPPET_EDIT}/${id}`);
  }
}
