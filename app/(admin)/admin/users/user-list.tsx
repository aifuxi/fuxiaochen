"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { format } from "date-fns";
import { Edit, Loader2, Search, Trash2 } from "lucide-react";
import useSWR from "swr";

import { getUsersAction } from "@/app/actions/user";

import { type User, type UserListReq } from "@/types/user";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Pagination } from "@/components/cyberpunk/pagination";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;

  const { data, isLoading, mutate } = useSWR(
    { page, pageSize, name },
    fetcher,
  );

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            用户管理
          </h2>
          <p className="text-gray-400">管理系统用户及权限</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              name="query"
              placeholder="搜索用户..."
              defaultValue={name}
              className={`
                border-white/10 bg-white/5 pl-10 text-white
                focus:border-neon-cyan/50
              `}
            />
          </div>
        </form>
      </div>

      <div className="rounded-md border border-neon-cyan/20 bg-black/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className={`
              border-white/10
              hover:bg-white/5
            `}>
              <TableHead className="text-neon-cyan">用户</TableHead>
              <TableHead className="text-neon-cyan">邮箱</TableHead>
              <TableHead className="text-neon-cyan">角色</TableHead>
              <TableHead className="text-neon-cyan">注册时间</TableHead>
              <TableHead className="text-right text-neon-cyan">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data?.lists?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.lists?.map((user) => (
                <TableRow
                  key={user.id}
                  className={`
                    border-white/10
                    hover:bg-white/5
                  `}
                >
                  <TableCell className="font-medium text-white">
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
                  <TableCell className="text-gray-400">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`
                        ${
                          user.role === "admin"
                            ? "border-neon-purple text-neon-purple"
                            : "border-gray-500 text-gray-400"
                        }
                      `}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(user)}
                        className={`
                          text-gray-400
                          hover:bg-neon-cyan/10 hover:text-neon-cyan
                        `}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(user.id)}
                        className={`
                          text-gray-400
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
      </div>

      <div className="flex justify-end">
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          total={data?.total || 0}
          onPageChange={handlePageChange}
        />
      </div>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSuccess={() => mutate()}
      />

      <DeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        id={deletingId}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
