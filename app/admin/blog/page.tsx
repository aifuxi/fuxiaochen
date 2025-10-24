"use client";

import * as React from "react";

import Link from "next/link";

import { type ColumnDef } from "@tanstack/react-table";
import { Delete, Eye, LoaderCircle, Pen, Plus } from "lucide-react";
import { useImmer } from "use-immer";

import { AdminContentLayout } from "@/app/admin/components/admin-content-layout";

import { type Blog, type GetBlogsRequest } from "@/types/blog";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { IllustrationNoContent } from "@/components/illustrations";

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  PATHS,
  PLACEHOLDER_TEXT,
} from "@/constants";
import { cn } from "@/lib/utils";

import { useGetBlogMetaData, useGetBlogs } from "./api";
import { DeleteBlogButton } from "./components/delete-blog-button";
import { BlogListPageHeader } from "./components/header";
import { TagField } from "./components/tag-field";
import { ToggleBlogPublishSwitch } from "./components/toggle-blog-publish-switch";

export default function Page() {
  const [queries, updateQueries] = useImmer<
    GetBlogsRequest & { filtered: boolean }
  >({
    title: "",
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
    filtered: false,
  });

  const { data, isLoading, mutate } = useGetBlogs(queries);

  const {
    categoriesData,
    tagsData,
    loading: metaLoading,
  } = useGetBlogMetaData();

  const columns: ColumnDef<Blog>[] = [
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
      accessorKey: "category",
      header: "分类",
      cell: ({ row }) => {
        return row.original.category?.name ?? PLACEHOLDER_TEXT;
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
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
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
          <ToggleBlogPublishSwitch
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
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Link
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
              )}
              href={`${PATHS.BLOG}/${row.original.slug}`}
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
            <DeleteBlogButton
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
        <BlogListPageHeader
          extra={
            <Button onClick={handleGoToCreate}>
              <Plus />
              创建博客
            </Button>
          }
        />
      }
    >
      <div className="flex items-center gap-4">
        <Input
          placeholder="请输入标题"
          className="w-64"
          value={queries.title}
          onChange={(v) => {
            updateQueries((draft) => {
              draft.title = v.target.value;
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

        {metaLoading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <>
            <Select
              value={queries.category}
              onValueChange={(v) => {
                updateQueries((draft) => {
                  draft.category = v;
                  draft.pageIndex = DEFAULT_PAGE_INDEX;
                  draft.filtered = true;
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择分类..." />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.categories?.map((el) => (
                  <SelectItem key={el.id} value={el.id}>
                    {el.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TagField
              tags={tagsData?.tags ?? []}
              value={queries.tags?.map((el) => el.trim()) ?? []}
              onChange={(v) => {
                updateQueries((draft) => {
                  draft.tags = v;
                  draft.pageIndex = DEFAULT_PAGE_INDEX;
                  draft.filtered = true;
                });
              }}
            />
          </>
        )}

        {queries.filtered && (
          <Button
            variant="secondary"
            onClick={() => {
              updateQueries((draft) => {
                draft.title = "";
                draft.pageIndex = DEFAULT_PAGE_INDEX;
                draft.category = "";
                draft.tags = [];
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
        data={data?.blogs ?? []}
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
  function handleGoToCreate() {
    window.open(PATHS.ADMIN_BLOG_CREATE, "_blank");
  }

  function handleGoToEdit(id: string) {
    window.open(`${PATHS.ADMIN_BLOG_EDIT}/${id}`, "_blank");
  }
}
