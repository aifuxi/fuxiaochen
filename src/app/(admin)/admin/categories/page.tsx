"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTable } from "@/components/data-table";

import { columns } from "./_components/columns";
import { CreateCategorySheet } from "./_components/create-category-sheet";
import { UpdateCategorySheet } from "./_components/update-category-sheet";
import { useGetCategories } from "./api";
import { useCreateCategorySheet } from "./hooks/use-create-category-sheet";
import { useQueryCategories } from "./hooks/use-query-categories";

export default function Page() {
  const { queryStates, name, handleNameChange, handlePageChange } =
    useQueryCategories();
  const { data, isLoading } = useGetCategories({
    page: queryStates.page,
    pageSize: queryStates.pageSize,
    name: queryStates.name,
  });
  const { openSheet } = useCreateCategorySheet();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-y-6 py-9">
      <CreateCategorySheet />
      <UpdateCategorySheet />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">分类</h2>
        <Button onClick={openSheet}>创建分类</Button>
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
        data={data?.data?.categories ?? []}
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
