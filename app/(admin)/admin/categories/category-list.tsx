"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { format } from "date-fns";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";

import { getCategoriesAction } from "@/app/actions/category";

import { type Category, type CategoryListReq } from "@/types/category";

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

import { CategoryDialog } from "./category-dialog";
import { DeleteAlert } from "./delete-alert";

const fetcher = async (params: CategoryListReq) => {
  const res = await getCategoriesAction(params);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

export default function CategoryManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
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
            分类管理
          </h2>
          <p className="text-gray-400">管理博客文章的分类体系</p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(undefined);
            setDialogOpen(true);
          }}
          className={`
            bg-neon-cyan text-black
            hover:bg-cyan-400
          `}
        >
          <Plus className="mr-2 h-4 w-4" />
          新增分类
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              name="query"
              placeholder="搜索分类..."
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
            <TableRow
              className={`
                border-white/10
                hover:bg-white/5
              `}
            >
              <TableHead className="text-neon-cyan">名称</TableHead>
              <TableHead className="text-neon-cyan">Slug</TableHead>
              <TableHead className="text-neon-cyan">描述</TableHead>
              <TableHead className="text-neon-cyan">文章数</TableHead>
              <TableHead className="text-neon-cyan">创建时间</TableHead>
              <TableHead className="text-right text-neon-cyan">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-400"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data?.lists?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-400"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.lists?.map((category) => (
                <TableRow
                  key={category.id}
                  className={`
                    border-white/10
                    hover:bg-white/5
                  `}
                >
                  <TableCell className="font-medium text-white">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-neon-purple text-neon-purple"
                    >
                      {category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-gray-400">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {category.blogCount}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {format(new Date(category.createdAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(category)}
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
                        onClick={() => openDelete(category.id)}
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

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
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
