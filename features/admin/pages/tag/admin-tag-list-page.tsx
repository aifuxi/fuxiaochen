"use client";

import * as React from "react";

import { TagTypeEnum } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { Book, CodeXml, ScrollIcon } from "lucide-react";
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
  TAG_TYPE_MAP,
} from "@/constants";
import { type Tag, useGetTags } from "@/features/tag";

import {
  AdminContentLayout,
  CreateTagButton,
  DateTableCell,
  DeleteTagButton,
  TagListPageHeader,
  UpdateTagButton,
} from "../../components";

export const AdminTagListPage = () => {
  const [queries, updateQueries] = useQueryStates({
    name: parseAsString.withDefault(""),
    pageIndex: parseAsInteger.withDefault(DEFAULT_PAGE_INDEX),
    pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
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
      accessorKey: "type",
      header: "类型",
      cell({ row }) {
        const originalType = row.original.type;
        const typeLabel = TAG_TYPE_MAP[originalType];
        if (!typeLabel) {
          return PLACEHOLDER_TEXT;
        }

        const iconMap = {
          [TagTypeEnum.ALL]: "",
          [TagTypeEnum.BLOG]: <Book className="size-4" />,
          [TagTypeEnum.NOTE]: <ScrollIcon className="size-4" />,
          [TagTypeEnum.SNIPPET]: <CodeXml className="size-4" />,
        };

        return (
          <Badge>
            {iconMap[originalType]}
            {typeLabel}
          </Badge>
        );
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
        data={data?.tags ?? []}
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
};
