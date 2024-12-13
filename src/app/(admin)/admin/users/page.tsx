"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { useGetUsers } from "./api";

export default function Page() {
  const { data } = useGetUsers({
    page: 1,
    pageSize: 10,
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-y-6 pt-9">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">用户</h2>
        <Button>创建用户</Button>
      </div>

      <div className="flex items-center gap-6">
        <Input placeholder="搜索" className="w-[360px]" />
      </div>

      <DataTable data={data?.data?.users ?? []} columns={columns} />
    </div>
  );
}
