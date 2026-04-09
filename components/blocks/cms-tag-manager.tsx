"use client";

import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import { Pencil, Plus, RefreshCw, Search, Tag, Trash2 } from "lucide-react";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { TagDeleteDialog } from "@/components/modals/tag-delete-dialog";
import { TagFormDialog } from "@/components/modals/tag-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
import {
  createTag,
  deleteTag,
  listTags,
  type TagApiError,
  updateTag,
  type ListTagsResult,
} from "@/lib/tag/tag-client";
import type { CreateTagInput, TagDto, UpdateTagInput } from "@/lib/tag/tag-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;

export function CmsTagManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");

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
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [keyword, page],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListTagsResult, TagApiError>(
    ["tags", query.keyword ?? "", query.page, query.pageSize],
    () => listTags(query),
    {
      keepPreviousData: true,
    },
  );

  const createMutation = useSWRMutation("create-tag", (_key, { arg }: { arg: CreateTagInput }) => createTag(arg));
  const updateMutation = useSWRMutation(
    "update-tag",
    (_key, { arg }: { arg: { id: string; input: UpdateTagInput } }) => updateTag(arg.id, arg.input),
  );
  const deleteMutation = useSWRMutation("delete-tag", (_key, { arg }: { arg: { id: string } }) => deleteTag(arg.id));

  const tags = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const visiblePages = getVisiblePages(page, totalPages);
  const isMutating = createMutation.isMutating || updateMutation.isMutating || deleteMutation.isMutating;

  React.useEffect(() => {
    if (!data) {
      return;
    }

    if (page > data.totalPages && data.totalPages > 0) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  async function handleCreate(input: CreateTagInput) {
    await createMutation.trigger(input);
    toast.success("Tag created successfully.");
    await mutate();
  }

  async function handleUpdate(id: string, input: CreateTagInput) {
    await updateMutation.trigger({
      id,
      input,
    });
    toast.success("Tag updated successfully.");
    await mutate();
  }

  async function handleDelete(tag: TagDto) {
    await deleteMutation.trigger({
      id: tag.id,
    });
    toast.success(`Deleted #${tag.name}.`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openCreateDialog() {
    void NiceModal.show(TagFormDialog, {
      mode: "create",
      onSubmit: handleCreate,
    });
  }

  function openDeleteDialog(tag: TagDto) {
    void NiceModal.show(TagDeleteDialog, {
      onConfirm: () => handleDelete(tag),
      tag,
    });
  }

  function openEditDialog(tag: TagDto) {
    void NiceModal.show(TagFormDialog, {
      mode: "edit",
      onSubmit: (input) => handleUpdate(tag.id, input),
      tag,
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
          sm:flex-row sm:items-center
        `}>
          <div className="w-full max-w-md">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by tag name, slug, or description"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} tags</Badge>
            {isValidating && !isLoading ? <span className="inline-flex items-center gap-2"><RefreshCw className={`
              size-3 animate-spin
            `} /> Refreshing</span> : null}
          </div>
        </div>

        <Button disabled={isMutating} onClick={openCreateDialog} variant="primary">
          <Plus className="size-4" />
          Add Tag
        </Button>
      </div>

      <div className={`
        grid gap-4
        sm:grid-cols-3
      `}>
        <MetricCard label="Total Tags" value={String(total)} />
        <MetricCard
          label="Visible Tags"
          value={String(tags.length)}
        />
        <MetricCard
          label="Active Search"
          value={keyword ? `#${keyword}` : "All tags"}
        />
      </div>

      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
              <TableHeaderCell>Usage</TableHeaderCell>
              <TableHeaderCell>Sort</TableHeaderCell>
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
                    <p className="max-w-md text-sm text-muted">{error.message || "Failed to load tags."}</p>
                    <Button onClick={() => void mutate()} variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell className="py-12" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className={`
                      flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-muted
                    `}>
                      <Tag className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-foreground">{keyword ? "No tags match this search." : "No tags yet."}</p>
                      <p className="text-sm text-muted">
                        {keyword ? "Try a different keyword or clear the search." : "Create the first tag to organize article topics."}
                      </p>
                    </div>
                    {!keyword ? (
                      <Button onClick={openCreateDialog} variant="outline">
                        <Plus className="size-4" />
                        Create Tag
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">#{tag.name}</div>
                      <div className="line-clamp-2 text-xs leading-5 text-muted">
                        {tag.description || "No description"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded-md bg-white/6 px-2 py-1 text-xs text-emerald-200">{tag.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tag.usageCount > 0 ? "primary" : "muted"}>
                      {tag.usageCount} {tag.usageCount === 1 ? "article" : "articles"}
                    </Badge>
                  </TableCell>
                  <TableCell>{tag.sortOrder}</TableCell>
                  <TableCell className="text-muted">{format(new Date(tag.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button disabled={isMutating} onClick={() => openEditDialog(tag)} size="sm" variant="ghost">
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button disabled={isMutating} onClick={() => openDeleteDialog(tag)} size="sm" variant="outline">
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

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}
