"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getCategoriesAction } from "@/app/actions/category";
import { type Category, type CategoryListReq } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppleCard } from "@/components/ui/glass-card";
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

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newPageSize.toString());
    params.set("page", "1"); // Reset to page 1
    router.push(`?${params.toString()}`);
  };

  const openDelete = (id: string) => {
    NiceModal.show(DeleteAlert, {
      id,
      onSuccess: () => mutate(),
    });
  };

  const showCategoryModal = (category?: Category) => {
    NiceModal.show(CategoryDialog, {
      category,
      onSuccess: () => mutate(),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text">
          分类管理
        </h2>
        <p className="text-text-secondary">管理博客文章的分类体系</p>
      </div>

      <AppleCard
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
              placeholder="搜索分类..."
              defaultValue={name}
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className={`
              border border-border bg-surface text-text
              hover:bg-accent/5 hover:text-accent
            `}
          >
            搜索
          </Button>
        </form>
        <Button
          onClick={() => {
            showCategoryModal();
          }}
          className={`
            bg-accent text-white
            hover:bg-accent/90
          `}
        >
          <Plus className="mr-2 h-4 w-4" />
          新增分类
        </Button>
      </AppleCard>

      <AppleCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-text-secondary">名称</TableHead>
              <TableHead className="text-text-secondary">Slug</TableHead>
              <TableHead className="text-text-secondary">文章数</TableHead>
              <TableHead className="text-text-secondary">创建时间</TableHead>
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
              data?.lists?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-text">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-accent text-accent"
                    >
                      {category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text">
                    {category.blogCount}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatSimpleDateWithTime(new Date(category.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showCategoryModal(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(category.id)}
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
      </AppleCard>

      <AppleCard className="p-2">
        {data && (
          <DataTablePagination
            currentPage={page}
            total={data.total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </AppleCard>
    </div>
  );
}
