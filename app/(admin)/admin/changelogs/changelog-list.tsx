"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getChangelogsAction } from "@/app/actions/changelog";
import { type Changelog } from "@/types/changelog";
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
import { ChangelogDialog } from "./changelog-dialog";
import { DeleteAlert } from "./delete-alert";

interface ChangelogManagementPageProps {
  role?: string;
}

export default function ChangelogManagementPage({
  role,
}: ChangelogManagementPageProps) {
  const isAdmin = role === "admin";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedChangelog, setSelectedChangelog] = useState<
    Changelog | undefined
  >(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch data using SWR
  const { data, error, isLoading, mutate } = useSWR(
    [`/api/changelogs`, page, pageSize, search],
    async () => {
      const res = await getChangelogsAction({
        page,
        pageSize,
        version: search || undefined, // Search by version
      });
      if (res.success) {
        return res.data;
      }
      throw new Error(res.error);
    },
  );

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
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-wider text-white">
            CHANGELOG MANAGEMENT
          </h1>
          <p className="mt-2 text-gray-400">管理系统更新日志</p>
        </div>
        <Button
          onClick={handleCreate}
          className={`
            border border-neon-cyan bg-neon-cyan/10 text-neon-cyan
            hover:bg-neon-cyan hover:text-black
          `}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建日志
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-black/40 p-4 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="搜索版本号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`
              border-white/10 bg-white/5 pl-10 text-white
              focus:border-neon-cyan focus:ring-neon-cyan/20
            `}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow className={`
              border-white/10
              hover:bg-white/5
            `}>
              <TableHead className="text-neon-purple">版本</TableHead>
              <TableHead className="text-neon-purple">发布日期</TableHead>
              <TableHead className="text-neon-purple">内容预览</TableHead>
              <TableHead className="text-right text-neon-purple">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-neon-cyan" />
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
                  className="h-24 text-center text-gray-500"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.lists?.map((changelog) => (
                <TableRow
                  key={changelog.id}
                  className={`
                    border-white/10
                    hover:bg-white/5
                  `}
                >
                  <TableCell className="font-medium text-white">
                    {changelog.version}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {changelog.date
                      ? format(new Date(changelog.date), "yyyy-MM-dd")
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-gray-400">
                    {changelog.content}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(changelog)}
                          className={`
                            text-gray-400
                            hover:bg-neon-cyan/10 hover:text-neon-cyan
                          `}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(changelog)}
                          className={`
                            text-gray-400
                            hover:bg-neon-magenta/10 hover:text-neon-magenta
                          `}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Simplified for now, can add full pagination if needed */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
          className={`
            border-white/20 text-gray-300
            hover:bg-white/10 hover:text-white
            disabled:opacity-50
          `}
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.lists || data.lists.length < pageSize || isLoading}
          className={`
            border-white/20 text-gray-300
            hover:bg-white/10 hover:text-white
            disabled:opacity-50
          `}
        >
          下一页
        </Button>
      </div>

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
