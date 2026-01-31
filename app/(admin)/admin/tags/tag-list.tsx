"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowUpDown, Edit, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getTagsAction } from "@/app/actions/tag";
import { type Tag, type TagListReq } from "@/types/tag";
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
import { TagDialog } from "./tag-dialog";

const fetcher = async (params: TagListReq) => {
  const res = await getTagsAction(params);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

interface TagManagementPageProps {
  role?: string;
}

export default function TagManagementPage({ role }: TagManagementPageProps) {
  const isAdmin = role === "admin";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;
  const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
  const order = (searchParams.get("order") as any) || "desc";

  const { data, isLoading, mutate } = useSWR(
    { page, pageSize, name, sortBy, order },
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

  const handleSort = (field: "createdAt" | "updatedAt") => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get("sortBy");
    const currentOrder = params.get("order");

    if (currentSort === field) {
      params.set("order", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("order", "desc");
    }
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const openCreate = () => {
    setEditingTag(undefined);
    setDialogOpen(true);
  };

  const tags = data?.lists || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-wider text-neon-cyan uppercase">
          标签列表
        </h2>
        {isAdmin && (
          <Button
            onClick={openCreate}
            className={`
              bg-neon-cyan text-black
              hover:bg-cyan-400
            `}
          >
            <Plus className="mr-2 h-4 w-4" /> 新建标签
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
            <Input
              name="query"
              placeholder="搜索标签名称..."
              defaultValue={name || ""}
              className={`
                border-white/10 bg-white/5 pl-9
                focus:border-neon-cyan focus:ring-neon-cyan/20
              `}
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className={`
              border border-white/10 bg-white/5 text-gray-300
              hover:bg-white/10
            `}
          >
            搜索
          </Button>
        </form>
      </div>

      <div className="rounded-md border border-white/10 bg-black/40">
        <Table>
          <TableHeader>
            <TableRow
              className={`
                border-white/10
                hover:bg-white/5
              `}
            >
              <TableHead className="text-neon-purple">名称</TableHead>
              <TableHead className="text-neon-purple">Slug</TableHead>
              <TableHead className="text-neon-purple">文章数</TableHead>
              <TableHead
                className="cursor-pointer text-neon-purple"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  创建时间 <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-neon-purple"
                onClick={() => handleSort("updatedAt")}
              >
                <div className="flex items-center gap-1">
                  更新时间 <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right text-neon-purple">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow
                  key={tag.id}
                  className={`
                    border-white/10
                    hover:bg-white/5
                  `}
                >
                  <TableCell className="font-medium text-white">
                    {tag.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">
                    {tag.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-neon-cyan/10 text-neon-cyan"
                    >
                      {tag.blogCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {format(new Date(tag.createdAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {format(new Date(tag.updatedAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(tag)}
                          className={`
                            text-gray-400
                            hover:text-neon-cyan
                          `}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(tag.id)}
                          className={`
                            text-gray-400
                            hover:text-red-500
                          `}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onPageChange={handlePageChange}
      />

      <TagDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tag={editingTag}
        onSuccess={() => mutate()}
      />

      <DeleteAlert
        id={deletingId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
