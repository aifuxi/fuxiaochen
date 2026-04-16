"use client";

import React from "react";
import Link from "next/link";
import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import {
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { CmsEmptyState } from "@/components/cms/cms-empty-state";
import { CmsFeedbackPanel } from "@/components/cms/cms-feedback-panel";
import { CmsListShell } from "@/components/cms/cms-list-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/table";
import { ProjectDeleteDialog } from "@/components/modals/project-delete-dialog";
import { ProjectCategory } from "@/generated/prisma/enums";
import {
  deleteProject,
  listProjects,
  type ListProjectsResult,
  type ProjectApiError,
} from "@/lib/project/project-client";
import type { ProjectDto } from "@/lib/project/project-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;
const CATEGORY_OPTIONS = [
  { label: "全部分类", value: "" },
  { label: "Web", value: ProjectCategory.Web },
  { label: "设计", value: ProjectCategory.Design },
  { label: "移动端", value: ProjectCategory.Mobile },
  { label: "开源", value: ProjectCategory.OpenSource },
];
const FEATURED_OPTIONS = [
  { label: "全部项目", value: "" },
  { label: "精选", value: "true" },
  { label: "非精选", value: "false" },
];

export function CmsProjectManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [category, setCategory] = React.useState<ProjectCategory | "">("");
  const [featured, setFeatured] = React.useState<"" | "false" | "true">("");

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setKeyword(searchValue.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  const query = React.useMemo(
    () => ({
      category: category || undefined,
      isFeatured: featured === "" ? undefined : featured === "true",
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [category, featured, keyword, page],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    ListProjectsResult,
    ProjectApiError
  >(
    [
      "projects",
      query.keyword ?? "",
      query.category ?? "",
      String(query.isFeatured ?? ""),
      query.page,
      query.pageSize,
    ],
    () => listProjects(query),
    {
      keepPreviousData: true,
    },
  );

  const deleteMutation = useSWRMutation(
    "delete-project",
    (_key, { arg }: { arg: { id: string } }) => deleteProject(arg.id),
  );

  const projects = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const visiblePages = getVisiblePages(page, totalPages);

  React.useEffect(() => {
    if (!data) {
      return;
    }

    if (page > data.totalPages && data.totalPages > 0) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  async function handleDelete(project: ProjectDto) {
    await deleteMutation.trigger({
      id: project.id,
    });
    toast.success(`已删除 ${project.name}。`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openDeleteDialog(project: ProjectDto) {
    void NiceModal.show(ProjectDeleteDialog, {
      onConfirm: () => handleDelete(project),
      project,
    });
  }

  return (
    <CmsListShell
      filters={(
      <div
        className={`
          flex flex-col gap-4
          lg:flex-row lg:items-center lg:justify-between
        `}
      >
        <div
          className={`
            flex flex-1 flex-col gap-3
            lg:flex-row lg:items-center
          `}
        >
          <div className="w-full max-w-md">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="按名称、slug 或摘要搜索"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setCategory(value as ProjectCategory | "");
                setPage(1);
              }}
              options={CATEGORY_OPTIONS}
              value={category}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setFeatured(value as "" | "false" | "true");
                setPage(1);
              }}
              options={FEATURED_OPTIONS}
              value={featured}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} 个项目</Badge>
            {isValidating && !isLoading ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className={`size-3 animate-spin`} /> 刷新中
              </span>
            ) : null}
          </div>
        </div>

        <Link href="/cms/project/new">
          <Button variant="primary" className="font-medium!">
            <Plus className="size-4" />
            新建项目
          </Button>
        </Link>
      </div>
      )}
      body={(
        <div className="space-y-6">
      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>项目</TableHeaderCell>
              <TableHeaderCell>分类</TableHeaderCell>
              <TableHeaderCell>技术栈</TableHeaderCell>
              <TableHeaderCell>发布时间</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
              <TableHeaderCell className="text-right">操作</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <div className="h-14 animate-pulse rounded-xl bg-white/5" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell className="py-6" colSpan={6}>
                  <CmsFeedbackPanel
                    action={(
                      <Button onClick={() => void mutate()} variant="outline">
                        重试
                      </Button>
                    )}
                    description={error.message || "加载项目失败。"}
                    title="项目加载失败"
                  />
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell className="py-6" colSpan={6}>
                  <CmsEmptyState
                    action={!keyword && !category && !featured ? (
                      <Link href="/cms/project/new">
                        <Button variant="outline">
                          <Plus className="size-4" />
                          创建项目
                        </Button>
                      </Link>
                    ) : undefined}
                    description={
                      keyword || category || featured
                        ? "尝试不同的筛选组合。"
                        : "创建第一个项目来构建作品集。"
                    }
                    title={
                      keyword || category || featured
                        ? "没有符合筛选条件的项目。"
                        : "暂无项目。"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {project.name}
                      </div>
                      <div className="line-clamp-2 text-xs leading-5 text-muted">
                        {project.summary}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCategoryLabel(project.category)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techNames.length > 0 ? (
                        project.techNames.slice(0, 3).map((techName) => (
                          <span
                            key={techName}
                            className="rounded-md bg-white/6 px-2 py-1 text-xs text-muted"
                          >
                            {techName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted">
                          暂无技术栈
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">
                    {project.publishedAt
                      ? format(new Date(project.publishedAt), "yyyy-MM-dd")
                      : "未发布"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.isFeatured ? "success" : "muted"}>
                        {project.isFeatured ? "精选" : "普通"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link href={`/cms/project/${project.id}`}>
                        <Button size="sm" variant="ghost">
                          编辑
                        </Button>
                      </Link>
                      <Button
                        disabled={deleteMutation.isMutating}
                        onClick={() => openDeleteDialog(project)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="size-4" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </Table>

      <div
        className={`
          flex flex-col gap-4
          sm:flex-row sm:items-center sm:justify-between
        `}
      >
        <p className="text-sm text-muted">
          {total === 0
            ? "无记录"
            : `显示 ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)}，共 ${total} 条`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1 || isLoading}
            onClick={() =>
              setPage((currentPage) => Math.max(currentPage - 1, 1))
            }
            size="sm"
            variant="outline"
          >
            上一页
          </Button>
          {visiblePages.map((item) => (
            <Button
              key={item}
              disabled={isLoading}
              onClick={() => setPage(item)}
              size="sm"
              variant={item === page ? "primary" : "ghost"}
            >
              {item}
            </Button>
          ))}
          <Button
            disabled={page === totalPages || isLoading}
            onClick={() =>
              setPage((currentPage) => Math.min(currentPage + 1, totalPages))
            }
            size="sm"
            variant="outline"
          >
            下一页
          </Button>
        </div>
      </div>
        </div>
      )}
    />
  );
}

function formatCategoryLabel(category: ProjectCategory) {
  if (category === ProjectCategory.OpenSource) {
    return "开源";
  }

  return category;
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(
    1,
    Math.min(page - 2, totalPages - maxVisiblePages + 1),
  );

  return Array.from(
    { length: maxVisiblePages },
    (_, index) => startPage + index,
  );
}
