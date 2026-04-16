"use client";

import React from "react";
import Link from "next/link";
import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { CmsEmptyState } from "@/components/cms/cms-empty-state";
import { CmsFeedbackPanel } from "@/components/cms/cms-feedback-panel";
import { CmsListShell } from "@/components/cms/cms-list-shell";
import { CmsSectionPanel } from "@/components/cms/cms-section-panel";
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
import { ArticleDeleteDialog } from "@/components/modals/article-delete-dialog";
import { ArticleStatus } from "@/generated/prisma/enums";
import {
  deleteArticle,
  listArticles,
  type ArticleApiError,
  type ListArticlesResult,
} from "@/lib/article/article-client";
import type { ArticleListItemDto } from "@/lib/article/article-dto";
import { listCategories } from "@/lib/category/category-client";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;
const STATUS_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "草稿", value: ArticleStatus.Draft },
  { label: "已发布", value: ArticleStatus.Published },
  { label: "已归档", value: ArticleStatus.Archived },
];

export function CmsArticleManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [status, setStatus] = React.useState<ArticleStatus | "">("");
  const [categoryId, setCategoryId] = React.useState("");

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
      categoryId: categoryId || undefined,
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
      status: status || undefined,
    }),
    [categoryId, keyword, page, status],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    ListArticlesResult,
    ArticleApiError
  >(
    [
      "articles",
      query.keyword ?? "",
      query.status ?? "",
      query.categoryId ?? "",
      query.page,
      query.pageSize,
    ],
    () => listArticles(query),
    {
      keepPreviousData: true,
    },
  );

  const { data: categoriesData } = useSWR(["article-category-options"], () =>
    listCategories({
      page: 1,
      pageSize: 50,
    }),
  );

  const deleteMutation = useSWRMutation(
    "delete-article",
    (_key, { arg }: { arg: { id: string } }) => deleteArticle(arg.id),
  );

  const articles = data?.items ?? [];
  const categories = categoriesData?.items ?? [];
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

  async function handleDelete(article: ArticleListItemDto) {
    await deleteMutation.trigger({
      id: article.id,
    });
    toast.success(`已删除《${article.title}》。`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openDeleteDialog(article: ArticleListItemDto) {
    void NiceModal.show(ArticleDeleteDialog, {
      article,
      onConfirm: () => handleDelete(article),
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
                placeholder="按标题、slug 或摘要搜索"
                startAdornment={<Search className="size-4" />}
                value={searchValue}
              />
            </div>
            <div className="w-full max-w-56">
              <Select
                onValueChange={(value) => {
                  setStatus(value as ArticleStatus | "");
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
                value={status}
              />
            </div>
            <div className="w-full max-w-64">
              <Select
                onValueChange={(value) => {
                  setCategoryId(value as string);
                  setPage(1);
                }}
                options={[
                  { label: "全部分类", value: "" },
                  ...categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  })),
                ]}
                value={categoryId}
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Badge variant="muted">{total} 篇文章</Badge>
              {isValidating && !isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="size-3 animate-spin" /> 刷新中
                </span>
              ) : null}
            </div>
          </div>

          <Link href="/cms/article/new">
            <Button className="font-medium!" variant="primary">
              <Plus className="size-4" />
              新建文章
            </Button>
          </Link>
        </div>
      )}
      body={(
        <CmsSectionPanel
          description="集中查看文章状态、标签和发布时间。"
          title="文章列表"
        >
          <div className="space-y-6">
            <Table>
              <TableRoot>
                <TableHead>
                  <tr>
                    <TableHeaderCell>文章</TableHeaderCell>
                    <TableHeaderCell>分类</TableHeaderCell>
                    <TableHeaderCell>状态</TableHeaderCell>
                    <TableHeaderCell>标签</TableHeaderCell>
                    <TableHeaderCell>更新时间</TableHeaderCell>
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
                          description={error.message || "加载文章失败。"}
                          title="文章加载失败"
                        />
                      </TableCell>
                    </TableRow>
                  ) : articles.length === 0 ? (
                    <TableRow>
                      <TableCell className="py-6" colSpan={6}>
                        <CmsEmptyState
                          action={!keyword && !status && !categoryId ? (
                            <Link href="/cms/article/new">
                              <Button variant="outline">
                                <Plus className="size-4" />
                                创建文章
                              </Button>
                            </Link>
                          ) : undefined}
                          description={
                            keyword || status || categoryId
                              ? "尝试不同的筛选组合。"
                              : "创建第一篇文章以开始发布内容。"
                          }
                          title={
                            keyword || status || categoryId
                              ? "没有符合筛选条件的文章。"
                              : "暂无文章。"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {article.title}
                            </div>
                            <div className="line-clamp-2 text-xs leading-5 text-muted">
                              {article.excerpt || article.slug}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.category ? (
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block size-2.5 rounded-full border border-white/10"
                                style={{
                                  backgroundColor:
                                    article.category.color ?? "#27272A",
                                }}
                              />
                              <span>{article.category.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted">未分类</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(article.status)}>
                            {article.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {article.tags.length > 0 ? (
                              article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="rounded-md bg-white/6 px-2 py-1 text-xs text-muted"
                                >
                                  {tag.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted">暂无标签</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted">
                          {format(new Date(article.updatedAt), "yyyy-MM-dd HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Link href={`/cms/article/${article.id}`}>
                              <Button size="sm" variant="ghost">
                                编辑
                              </Button>
                            </Link>
                            <Button
                              disabled={deleteMutation.isMutating}
                              onClick={() => openDeleteDialog(article)}
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
        </CmsSectionPanel>
      )}
    />
  );
}

function getStatusVariant(status: ArticleListItemDto["status"]) {
  if (status === ArticleStatus.Published) {
    return "success";
  }

  if (status === ArticleStatus.Archived) {
    return "destructive";
  }

  return "warning";
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
