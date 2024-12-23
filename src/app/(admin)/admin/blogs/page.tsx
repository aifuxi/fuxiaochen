"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTable } from "@/components/data-table";

import { columns } from "./_components/columns";
import { useGetBlogs } from "./api";
import { useQueryBlogs } from "./hooks/use-query-blogs";

export default function Page() {
  const { queryStates, title, handleTitleChange, handlePageChange } =
    useQueryBlogs();
  const { data, isLoading } = useGetBlogs({
    page: queryStates.page,
    pageSize: queryStates.pageSize,
    title: queryStates.title,
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-y-6 py-9">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">文章</h2>
        <Button>创建文章</Button>
      </div>
      <div className="flex items-center gap-6">
        <Input
          placeholder="搜索名称"
          className="w-[360px]"
          value={title}
          onChange={(v) => handleTitleChange(v.target.value)}
        />
      </div>

      <DataTable
        data={data?.data?.blogs ?? []}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: queryStates.page,
          pageSize: queryStates.pageSize,
          total: data?.data?.total ?? 0,
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
}
