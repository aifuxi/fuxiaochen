"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTable } from "@/components/data-table";

import { columns } from "./_components/columns";
import { CreateTagSheet } from "./_components/create-tag-sheet";
import { UpdateTagSheet } from "./_components/update-tag-sheet";
import { useGetTags } from "./api";
import { useCreateTagSheet } from "./hooks/use-create-tag-sheet";
import { useQueryTags } from "./hooks/use-query-tags";

export default function Page() {
  const { queryStates, name, handleNameChange, handlePageChange } =
    useQueryTags();
  const { data, isLoading } = useGetTags({
    page: queryStates.page,
    pageSize: queryStates.pageSize,
    name: queryStates.name,
  });
  const { openSheet } = useCreateTagSheet();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-y-6 py-9">
      <CreateTagSheet />
      <UpdateTagSheet />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">标签</h2>
        <Button onClick={openSheet}>创建标签</Button>
      </div>
      <div className="flex items-center gap-6">
        <Input
          placeholder="搜索名称"
          className="w-[360px]"
          value={name}
          onChange={(v) => handleNameChange(v.target.value)}
        />
      </div>

      <DataTable
        data={data?.data?.tags ?? []}
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
