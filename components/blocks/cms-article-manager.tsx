"use client";

import NiceModal from "@ebay/nice-modal-react";
import { ArticleStatus } from "@/generated/prisma/enums";
import { format } from "date-fns";
import { FileText, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { ArticleDeleteDialog } from "@/components/modals/article-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
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
  { label: "All Statuses", value: "" },
  { label: "Draft", value: ArticleStatus.Draft },
  { label: "Published", value: ArticleStatus.Published },
  { label: "Archived", value: ArticleStatus.Archived },
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

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListArticlesResult, ArticleApiError>(
    ["articles", query.keyword ?? "", query.status ?? "", query.categoryId ?? "", query.page, query.pageSize],
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
    toast.success(`Deleted ${article.title}.`);

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
    <div className="space-y-6">
      <div className={`
        flex flex-col gap-4
        lg:flex-row lg:items-center lg:justify-between
      `}>
        <div className={`
          flex flex-1 flex-col gap-3
          lg:flex-row lg:items-center
        `}>
          <div className="w-full max-w-md">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by title, slug, or excerpt"
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
                { label: "All Categories", value: "" },
                ...categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
              value={categoryId}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} articles</Badge>
            {isValidating && !isLoading ? <span className="inline-flex items-center gap-2"><RefreshCw className={`
              size-3 animate-spin
            `} /> Refreshing</span> : null}
          </div>
        </div>

        <Link href="/cms/article/new">
          <Button variant="primary">
            <Plus className="size-4" />
            New Article
          </Button>
        </Link>
      </div>

      <div className={`
        grid gap-4
        sm:grid-cols-3
      `}>
        <MetricCard label="Total Articles" value={String(total)} />
        <MetricCard label="Visible Articles" value={String(articles.length)} />
        <MetricCard label="Active Filter" value={status || (categoryId ? "Category" : "All content")} />
      </div>

      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>Article</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Tags</TableHeaderCell>
              <TableHeaderCell>Updated</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
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
                <TableCell className="py-10" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="max-w-md text-sm text-muted">{error.message || "Failed to load articles."}</p>
                    <Button onClick={() => void mutate()} variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell className="py-12" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className={`
                      flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-muted
                    `}>
                      <FileText className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-foreground">
                        {keyword || status || categoryId ? "No articles match this filter." : "No articles yet."}
                      </p>
                      <p className="text-sm text-muted">
                        {keyword || status || categoryId
                          ? "Try a different filter combination."
                          : "Create the first article to start publishing content."}
                      </p>
                    </div>
                    {!keyword && !status && !categoryId ? (
                      <Link href="/cms/article/new">
                        <Button variant="outline">
                          <Plus className="size-4" />
                          Create Article
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{article.title}</div>
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
                          style={{ backgroundColor: article.category.color ?? "#27272A" }}
                        />
                        <span>{article.category.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(article.status)}>{article.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.length > 0 ? (
                        article.tags.slice(0, 3).map((tag) => (
                          <span key={tag.id} className="rounded-md bg-white/6 px-2 py-1 text-xs text-muted">
                            {tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted">No tags</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">{format(new Date(article.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link href={`/cms/article/${article.id}`}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </Link>
                      <Button
                        disabled={deleteMutation.isMutating}
                        onClick={() => openDeleteDialog(article)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </Table>

      <div className={`
        flex flex-col gap-4
        sm:flex-row sm:items-center sm:justify-between
      `}>
        <p className="text-sm text-muted">
          {total === 0
            ? "No records"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            size="sm"
            variant="outline"
          >
            Prev
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
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
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

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}
