"use client";

import * as React from "react";

import { TagTypeEnum } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { useSetState } from "ahooks";
import { isUndefined } from "es-toolkit";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Book,
  Calendar,
  CodeXml,
  ImageIcon,
  RotateCw,
  ScrollIcon,
  Search,
  TypeIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  PLACEHOLDER_TEXT,
  TAG_TYPES,
  TAG_TYPE_MAP,
} from "@/constants";
import { type GetTagsDTO, type Tag, useGetTags } from "@/features/tag";
import { toSlashDateString } from "@/lib/common";
import { cn } from "@/lib/utils";

import {
  CreateTagButton,
  DeleteTagButton,
  EditTagButton,
} from "../../components";

export const AdminTagListPage = () => {
  const [params, updateParams] = useSetState<GetTagsDTO>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
    order: "desc",
    orderBy: "createdAt",
  });

  const [inputParams, updateInputParams] = useSetState<
    Omit<GetTagsDTO, "pageIndex" | "pageSize">
  >({
    name: undefined,
    type: undefined,
  });

  const getTagsQuery = useGetTags(params);
  const data = React.useMemo(
    () => getTagsQuery.data?.tags ?? [],
    [getTagsQuery],
  );

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
      header: () => (
        <div className="flex items-center space-x-1">
          <TypeIcon className="size-4" />
          <span>名称</span>
        </div>
      ),
      cell: ({ row }) => {
        return row.original.name;
      },
    },
    {
      accessorKey: "type",
      header: () => (
        <div className="flex items-center space-x-1">
          <TypeIcon className="size-4" />
          <span>类型</span>
        </div>
      ),
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
      header: () => (
        <div className="flex items-center space-x-1">
          <ImageIcon className="size-4" />
          <span>浅色图标</span>
        </div>
      ),
      cell: ({ row }) => {
        return row.original.icon ? (
          <img src={row.original.icon} className="size-6" alt="" />
        ) : (
          PLACEHOLDER_TEXT
        );
      },
    },
    {
      accessorKey: "iconDark",
      header: () => (
        <div className="flex items-center space-x-1">
          <ImageIcon className="size-4" />
          <span>深色图标</span>
        </div>
      ),
      cell: ({ row }) => {
        return row.original.iconDark ? (
          <img src={row.original.iconDark} className="size-6" alt="" />
        ) : (
          PLACEHOLDER_TEXT
        );
      },
    },
    {
      accessorKey: "_count.blogs",
      header: () => (
        <div className="flex items-center space-x-1">
          <Book className="size-4" />
          <span>博客</span>
        </div>
      ),
      cell({ row }) {
        return row.original._count.blogs || PLACEHOLDER_TEXT;
      },
    },
    {
      accessorKey: "_count.snippets",
      header: () => (
        <div className="flex items-center space-x-1">
          <CodeXml className="size-4" />
          <span>片段</span>
        </div>
      ),
      cell({ row }) {
        return row.original._count.snippets || PLACEHOLDER_TEXT;
      },
    },
    {
      accessorKey: "_count.notes",
      header: () => (
        <div className="flex items-center space-x-1">
          <ScrollIcon className="size-4" />
          <span>笔记</span>
        </div>
      ),
      cell({ row }) {
        return row.original._count.snippets || PLACEHOLDER_TEXT;
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            handleOrderChange("createdAt");
          }}
        >
          <Calendar className="size-4" />
          <span className="mx-1">创建时间</span>
          {params.order === "asc" && params.orderBy == "createdAt" && (
            <ArrowUpNarrowWide className="size-4" />
          )}
          {params.order === "desc" && params.orderBy == "createdAt" && (
            <ArrowDownNarrowWide className="size-4" />
          )}
        </Button>
      ),
      cell({ row }) {
        return toSlashDateString(row.original.createdAt);
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            handleOrderChange("updatedAt");
          }}
        >
          <Calendar className="size-4" />
          <span className="mx-1">更新时间</span>
          {params.order === "asc" && params.orderBy == "updatedAt" && (
            <ArrowUpNarrowWide className="size-4" />
          )}
          {params.order === "desc" && params.orderBy == "updatedAt" && (
            <ArrowDownNarrowWide className="size-4" />
          )}
        </Button>
      ),
      cell({ row }) {
        return toSlashDateString(row.original.updatedAt);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            <EditTagButton
              id={record.id}
              refreshAsync={getTagsQuery.refreshAsync}
            />
            <DeleteTagButton
              id={record.id}
              refreshAsync={getTagsQuery.refreshAsync}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-y-6 p-6">
      <div className="grid grid-cols-4 gap-4 px-1">
        <Input
          placeholder="请输入名称"
          value={inputParams.name}
          onChange={(v) => {
            updateInputParams({
              name: v.target.value,
            });
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Select
          onValueChange={(v: TagTypeEnum) => {
            updateInputParams({
              type: v,
            });
          }}
          value={inputParams.type}
        >
          <SelectTrigger
            className={cn({
              "text-muted-foreground": isUndefined(inputParams.type),
            })}
          >
            <SelectValue placeholder="请选择类型" />
          </SelectTrigger>
          <SelectContent>
            {TAG_TYPES.map((el) => (
              <SelectItem key={el} value={el}>
                {TAG_TYPE_MAP[el]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-4">
          <Button onClick={handleSearch}>
            <Search className="mr-2 size-4" />
            搜索
          </Button>
          <Button onClick={handleReset}>
            <RotateCw className="mr-2 size-4" />
            重置
          </Button>
          <CreateTagButton refreshAsync={getTagsQuery.refreshAsync} />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        total={getTagsQuery.data?.total}
        loading={getTagsQuery.loading}
        params={{ ...params }}
        updateParams={updateParams}
        noResult={
          <div className="grid place-content-center gap-4 py-16">
            <IllustrationNoContent />
            <p>暂无内容</p>
            <CreateTagButton refreshAsync={getTagsQuery.refreshAsync} />
          </div>
        }
      />
    </div>
  );

  function handleSearch() {
    updateParams({
      name: inputParams.name,
      type: inputParams.type,
    });
  }

  function handleReset() {
    updateInputParams({
      name: "",
      type: undefined,
    });
    updateParams({
      name: "",
      type: undefined,
      pageIndex: DEFAULT_PAGE_INDEX,
      order: "desc",
      orderBy: "createdAt",
    });
  }

  function handleOrderChange(orderBy: GetTagsDTO["orderBy"]) {
    updateParams((prev) => {
      if (prev.orderBy !== orderBy) {
        return { orderBy: orderBy, order: "asc" };
      } else {
        if (prev.order === "desc") {
          return { orderBy: undefined, order: undefined };
        } else if (prev.order === "asc") {
          return { order: "desc" };
        } else {
          return { order: "asc" };
        }
      }
    });
  }
};
