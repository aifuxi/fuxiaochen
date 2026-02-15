"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import { Edit, Loader2, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getUsersAction } from "@/app/actions/user";
import { type User, type UserListReq } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { formatSimpleDateWithTime } from "@/lib/time";
import { DeleteAlert } from "./delete-alert";
import { UserDialog } from "./user-dialog";

const fetcher = async (params: UserListReq) => {
  const res = await getUsersAction(params);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

export default function UserManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;

  const { data, isLoading, mutate } = useSWR({ page, pageSize, name }, fetcher);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("name", query);
    } else {
      params.delete("name");
    }
    params.set("page", "1"); // Reset to page 1 on search
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newPageSize.toString());
    params.set("page", "1"); // Reset to page 1
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const openEdit = (user: User) => {
    NiceModal.show(UserDialog, {
      user,
      onSuccess: () => mutate(),
    });
  };

  const openDelete = (id: string) => {
    NiceModal.show(DeleteAlert, {
      id,
      onSuccess: () => mutate(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">
            用户管理
          </h2>
          <p className="text-text-secondary">管理系统用户及权限</p>
        </div>
      </div>

      <GlassCard
        className={`
          flex flex-col gap-4 p-4
          sm:flex-row sm:items-center sm:justify-between
        `}
      >
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-3 left-3 z-10 h-4 w-4 text-text-secondary" />
            <Input
              name="query"
              placeholder="搜索用户..."
              defaultValue={name}
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className={`
              border border-glass-border bg-glass-bg text-text
              hover:bg-accent/5 hover:text-accent
            `}
          >
            搜索
          </Button>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-text-secondary">用户</TableHead>
              <TableHead className="text-text-secondary">邮箱</TableHead>
              <TableHead className="text-text-secondary">角色</TableHead>
              <TableHead className="text-text-secondary">注册时间</TableHead>
              <TableHead className="text-right text-text-secondary">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-text-secondary"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data?.lists?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-text-secondary"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.lists?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-text">
                    <div className="flex items-center gap-2">
                      {user.image && (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-6 w-6 rounded-full"
                        />
                      )}
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatSimpleDateWithTime(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(user)}
                        className={`
                          text-text-secondary
                          hover:bg-accent/10 hover:text-accent
                        `}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(user.id)}
                        className={`
                          text-text-secondary
                          hover:bg-red-500/10 hover:text-red-500
                        `}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>

      <GlassCard className="p-2">
        <DataTablePagination
          currentPage={page}
          pageSize={pageSize}
          total={data?.total || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </GlassCard>
    </div>
  );
}
