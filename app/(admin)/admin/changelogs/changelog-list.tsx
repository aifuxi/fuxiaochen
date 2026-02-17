"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getChangelogsAction } from "@/app/actions/changelog";
import { type Changelog } from "@/types/changelog";
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
import { formatSimpleDate } from "@/lib/time";
import { ChangelogDialog } from "./changelog-dialog";
import { DeleteAlert } from "./delete-alert";

export default function ChangelogManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    NiceModal.show(ChangelogDialog, {
      changelog,
      onSuccess,
    });
  };

  const handleDelete = (changelog: Changelog) => {
    NiceModal.show(DeleteAlert, {
      id: changelog.id,
      onSuccess,
    });
  };

  const handleCreate = () => {
    NiceModal.show(ChangelogDialog, {
      onSuccess,
    });
  };

  const onSuccess = () => {
    mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">
          更新日志管理
        </h1>
        <p className="text-text-secondary">管理系统更新日志</p>
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
              placeholder="搜索版本号..."
              defaultValue={version}
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
          onClick={handleCreate}
          className={`
            bg-accent text-white
            hover:bg-accent/90
          `}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建日志
        </Button>
      </AppleCard>

      <AppleCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-text-secondary">
                版本
              </TableHead>
              <TableHead className="text-text-secondary">
                发布日期
              </TableHead>
              <TableHead className="text-text-secondary">
                内容预览
              </TableHead>
              <TableHead className="text-right text-text-secondary">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-text-secondary"
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
                  className="h-24 text-center text-text-secondary"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.lists?.map((changelog) => (
                <TableRow
                  key={changelog.id}
                  className={`
                    border-border
                    hover:bg-surface
                  `}
                >
                  <TableCell className="font-medium text-text">
                    {changelog.version}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {changelog.date
                      ? formatSimpleDate(new Date(changelog.date))
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-text-secondary">
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
