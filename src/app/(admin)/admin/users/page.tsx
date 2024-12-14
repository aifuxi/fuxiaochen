"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { useGetUsers } from "./api";
import { type GetUsersRequestType } from "./schema";

export default function Page() {
  const [pagination, setPagination] = useState<GetUsersRequestType>({
    page: 1,
    pageSize: 10,
  });
  const { data } = useGetUsers(pagination);

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-y-6 pt-9">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">用户</h2>
        <Button>创建用户</Button>
      </div>

      <div className="flex items-center gap-6">
        <Input placeholder="搜索" className="w-[360px]" />
      </div>

      <DataTable
        data={data?.data?.users ?? []}
        columns={columns}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: data?.data?.total ?? 0,
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
}
