"use client";

import NiceModal from "@ebay/nice-modal-react";
import { FriendLinkStatus } from "@/generated/prisma/enums";
import { format } from "date-fns";
import { Link2, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { FriendLinkDeleteDialog } from "@/components/modals/friend-link-delete-dialog";
import { FriendLinkFormDialog } from "@/components/modals/friend-link-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
import {
  createFriendLink,
  deleteFriendLink,
  type FriendLinkApiError,
  listFriendLinks,
  type ListFriendLinksResult,
  updateFriendLink,
} from "@/lib/friend-link/friend-link-client";
import type { CreateFriendLinkInput, FriendLinkDto, UpdateFriendLinkInput } from "@/lib/friend-link/friend-link-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;
const STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Approved", value: FriendLinkStatus.Approved },
  { label: "Pending", value: FriendLinkStatus.Pending },
  { label: "Offline", value: FriendLinkStatus.Offline },
  { label: "Rejected", value: FriendLinkStatus.Rejected },
];

export function CmsFriendLinkManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [status, setStatus] = React.useState<FriendLinkStatus | "">("");

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
      status: status || undefined,
    }),
    [keyword, page, status],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListFriendLinksResult, FriendLinkApiError>(
    ["friend-links", query.keyword ?? "", query.status ?? "", query.page, query.pageSize],
    () => listFriendLinks(query),
    {
      keepPreviousData: true,
    },
  );

  const createMutation = useSWRMutation(
    "create-friend-link",
    (_key, { arg }: { arg: CreateFriendLinkInput }) => createFriendLink(arg),
  );
  const updateMutation = useSWRMutation(
    "update-friend-link",
    (_key, { arg }: { arg: { id: string; input: UpdateFriendLinkInput } }) => updateFriendLink(arg.id, arg.input),
  );
  const deleteMutation = useSWRMutation(
    "delete-friend-link",
    (_key, { arg }: { arg: { id: string } }) => deleteFriendLink(arg.id),
  );

  const friendLinks = data?.items ?? [];
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

  async function handleCreate(input: CreateFriendLinkInput) {
    await createMutation.trigger(input);
    toast.success("Friend link created successfully.");
    await mutate();
  }

  async function handleUpdate(id: string, input: CreateFriendLinkInput) {
    await updateMutation.trigger({
      id,
      input,
    });
    toast.success("Friend link updated successfully.");
    await mutate();
  }

  async function handleDelete(friendLink: FriendLinkDto) {
    await deleteMutation.trigger({
      id: friendLink.id,
    });
    toast.success(`Deleted ${friendLink.siteName}.`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openCreateDialog() {
    void NiceModal.show(FriendLinkFormDialog, {
      mode: "create",
      onSubmit: handleCreate,
    });
  }

  function openDeleteDialog(friendLink: FriendLinkDto) {
    void NiceModal.show(FriendLinkDeleteDialog, {
      friendLink,
      onConfirm: () => handleDelete(friendLink),
    });
  }

  function openEditDialog(friendLink: FriendLinkDto) {
    void NiceModal.show(FriendLinkFormDialog, {
      friendLink,
      mode: "edit",
      onSubmit: (input) => handleUpdate(friendLink.id, input),
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
              placeholder="Search by site name, URL, domain, or description"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setStatus(value as FriendLinkStatus | "");
                setPage(1);
              }}
              options={STATUS_FILTER_OPTIONS}
              value={status}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} links</Badge>
            {isValidating && !isLoading ? <span className="inline-flex items-center gap-2"><RefreshCw className={`
              size-3 animate-spin
            `} /> Refreshing</span> : null}
          </div>
        </div>

        <Button disabled={isMutating} onClick={openCreateDialog} variant="primary">
          <Plus className="size-4" />
          Add Friend Link
        </Button>
      </div>

      <div className={`
        grid gap-4
        sm:grid-cols-3
      `}>
        <MetricCard label="Total Links" value={String(total)} />
        <MetricCard label="Visible Links" value={String(friendLinks.length)} />
        <MetricCard label="Active Filter" value={status || (keyword ? `#${keyword}` : "All links")} />
      </div>

      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>Site</TableHeaderCell>
              <TableHeaderCell>Domain</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
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
                    <p className="max-w-md text-sm text-muted">{error.message || "Failed to load friend links."}</p>
                    <Button onClick={() => void mutate()} variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : friendLinks.length === 0 ? (
              <TableRow>
                <TableCell className="py-12" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className={`
                      flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-muted
                    `}>
                      <Link2 className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-foreground">
                        {keyword || status ? "No friend links match this filter." : "No friend links yet."}
                      </p>
                      <p className="text-sm text-muted">
                        {keyword || status
                          ? "Try a different keyword or status."
                          : "Create the first friend link to populate the directory."}
                      </p>
                    </div>
                    {!keyword && !status ? (
                      <Button onClick={openCreateDialog} variant="outline">
                        <Plus className="size-4" />
                        Create Friend Link
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              friendLinks.map((friendLink) => (
                <TableRow key={friendLink.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{friendLink.siteName}</div>
                      <div className="text-xs text-muted">
                        {friendLink.subtitle || friendLink.siteUrl}
                      </div>
                      <div className="line-clamp-2 text-xs leading-5 text-muted">
                        {friendLink.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded-md bg-white/6 px-2 py-1 text-xs text-emerald-200">
                      {friendLink.domain || new URL(friendLink.siteUrl).host}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(friendLink.status)}>
                      {formatStatusLabel(friendLink.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{friendLink.sortOrder}</TableCell>
                  <TableCell className="text-muted">{format(new Date(friendLink.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button disabled={isMutating} onClick={() => openEditDialog(friendLink)} size="sm" variant="ghost">
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        disabled={isMutating}
                        onClick={() => openDeleteDialog(friendLink)}
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

function getStatusBadgeVariant(status: FriendLinkStatus) {
  switch (status) {
    case FriendLinkStatus.Approved:
      return "success";
    case FriendLinkStatus.Offline:
      return "warning";
    case FriendLinkStatus.Rejected:
      return "destructive";
    case FriendLinkStatus.Pending:
    default:
      return "info";
  }
}

function formatStatusLabel(status: FriendLinkStatus) {
  switch (status) {
    case FriendLinkStatus.Approved:
      return "Approved";
    case FriendLinkStatus.Offline:
      return "Offline";
    case FriendLinkStatus.Rejected:
      return "Rejected";
    case FriendLinkStatus.Pending:
    default:
      return "Pending";
  }
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}
