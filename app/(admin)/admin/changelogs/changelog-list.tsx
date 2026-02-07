"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getChangelogsAction } from "@/app/actions/changelog";
import { type Changelog } from "@/types/changelog";
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
import { ChangelogDialog } from "./changelog-dialog";
import { DeleteAlert } from "./delete-alert";

export default function ChangelogManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedChangelog, setSelectedChangelog] = useState<
    Changelog | undefined
  >(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const version = searchParams.get("version") || undefined;

  // Fetch data using SWR
  const { data, error, isLoading, mutate } = useSWR(
    { page, pageSize, version },
    async (params) => {
      const res = await getChangelogsAction(params);
      if (res.success) {
        return res.data;
      }
      throw new Error(res.error);
    },
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("version", query);
    } else {
      params.delete("version");
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

  const handleEdit = (changelog: Changelog) => {
    setSelectedChangelog(changelog);
    setIsDialogOpen(true);
  };

  const handleDelete = (changelog: Changelog) => {
    setSelectedChangelog(changelog);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedChangelog(undefined);
    setIsDialogOpen(true);
  };

  const onSuccess = () => {
    mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-color)]">
          更新日志管理
        </h1>
        <p className="text-[var(--text-color-secondary)]">管理系统更新日志</p>
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
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-[var(--text-color-secondary)]" />
            <Input
              name="query"
              placeholder="搜索版本号..."
              defaultValue={version}
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className={`
              border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
              hover:bg-[var(--accent-color)]/5 hover:text-[var(--accent-color)]
            `}
          >
            搜索
          </Button>
        </form>
        <Button
          onClick={handleCreate}
          className={`
            bg-[var(--accent-color)] text-white
            hover:bg-[var(--accent-color)]/90
          `}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建日志
        </Button>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[var(--text-color-secondary)]">
                版本
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                发布日期
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                内容预览
              </TableHead>
              <TableHead className="text-right text-[var(--text-color-secondary)]">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-red-500"
                >
                  加载失败: {error.message}
                </TableCell>
              </TableRow>
            ) : data?.lists?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.lists?.map((changelog) => (
                <TableRow
                  key={changelog.id}
                  className={`
                    border-[var(--glass-border)]
                    hover:bg-[var(--glass-bg)]
                  `}
                >
                  <TableCell className="font-medium text-[var(--text-color)]">
                    {changelog.version}
                  </TableCell>
                  <TableCell className="text-[var(--text-color-secondary)]">
                    {changelog.date
                      ? format(new Date(changelog.date), "yyyy-MM-dd")
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-[var(--text-color-secondary)]">
                    {changelog.content}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(changelog)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(changelog)}
                        className={`
                          text-[var(--text-color-secondary)]
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
        {data && (
          <DataTablePagination
            currentPage={page}
            total={data.total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </GlassCard>

      <ChangelogDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        changelog={selectedChangelog}
        onSuccess={onSuccess}
      />

      <DeleteAlert
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        id={selectedChangelog?.id || ""}
        onSuccess={onSuccess}
      />
    </div>
  );
}
