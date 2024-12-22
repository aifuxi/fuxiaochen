"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { columns } from "./_components/columns";
import { CreateUserSheet } from "./_components/create-user-sheet";
import { DataTable } from "./_components/data-table";
import { UpdateUserSheet } from "./_components/update-user-sheet";
import { useGetUsers } from "./api";
import { useCreateUserSheet } from "./hooks/use-create-user-sheet";
import { useQueryUsers } from "./hooks/use-query-users";

export default function Page() {
  const {
    queryStates,
    email,
    name,
    handleNameChange,
    handleEmailChange,
    handlePageChange,
  } = useQueryUsers();
  const { data, isLoading } = useGetUsers({
    page: queryStates.page,
    pageSize: queryStates.pageSize,
    name: queryStates.name,
    email: queryStates.email,
  });
  const { openSheet } = useCreateUserSheet();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-y-6 py-9">
      <CreateUserSheet />
      <UpdateUserSheet />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">用户</h2>
        <Button onClick={openSheet}>创建用户</Button>
      </div>

      <div className="flex items-center gap-6">
        <Input
          placeholder="搜索昵称"
          className="w-[360px]"
          value={name}
          onChange={(v) => handleNameChange(v.target.value)}
        />
        <Input
          placeholder="搜索邮箱"
          className="w-[360px]"
          value={email}
          onChange={(v) => handleEmailChange(v.target.value)}
        />
      </div>

      <DataTable
        data={data?.data?.users ?? []}
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
