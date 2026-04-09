"use client";

import NiceModal from "@ebay/nice-modal-react";
import { ChangelogItemType } from "@/generated/prisma/enums";
import { format } from "date-fns";
import { History, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { ChangelogDeleteDialog } from "@/components/modals/changelog-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
import {
  deleteChangelogRelease,
  listChangelogReleases,
  type ChangelogApiError,
  type ListChangelogReleasesResult,
} from "@/lib/changelog/changelog-client";
import type { ChangelogReleaseDto } from "@/lib/changelog/changelog-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;
const MAJOR_OPTIONS = [
  { label: "All Releases", value: "" },
  { label: "Major Releases", value: "true" },
  { label: "Minor Releases", value: "false" },
];

export function CmsChangelogManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [isMajorFilter, setIsMajorFilter] = React.useState<"" | "false" | "true">("");

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
      isMajor: isMajorFilter === "" ? undefined : isMajorFilter === "true",
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [isMajorFilter, keyword, page],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListChangelogReleasesResult, ChangelogApiError>(
    ["changelog-releases", query.keyword ?? "", String(query.isMajor ?? ""), query.page, query.pageSize],
    () => listChangelogReleases(query),
    {
      keepPreviousData: true,
    },
  );

  const deleteMutation = useSWRMutation(
    "delete-changelog-release",
    (_key, { arg }: { arg: { id: string } }) => deleteChangelogRelease(arg.id),
  );

  const releases = data?.items ?? [];
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

  async function handleDelete(release: ChangelogReleaseDto) {
    await deleteMutation.trigger({
      id: release.id,
    });
    toast.success(`Deleted ${release.version}.`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openDeleteDialog(release: ChangelogReleaseDto) {
    void NiceModal.show(ChangelogDeleteDialog, {
      onConfirm: () => handleDelete(release),
      release,
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
              placeholder="Search by version, title, or summary"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setIsMajorFilter(value as "" | "false" | "true");
                setPage(1);
              }}
              options={MAJOR_OPTIONS}
              value={isMajorFilter}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} releases</Badge>
            {isValidating && !isLoading ? <span className="inline-flex items-center gap-2"><RefreshCw className={`
              size-3 animate-spin
            `} /> Refreshing</span> : null}
          </div>
        </div>

        <Link href="/cms/changelog/new">
          <Button variant="primary">
            <Plus className="size-4" />
            New Release
          </Button>
        </Link>
      </div>

      <div className={`
        grid gap-4
        sm:grid-cols-3
      `}>
        <MetricCard label="Total Releases" value={String(total)} />
        <MetricCard label="Visible Releases" value={String(releases.length)} />
        <MetricCard label="Active Filter" value={isMajorFilter === "" ? "All releases" : isMajorFilter === "true" ? "Major" : "Minor"} />
      </div>

      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>Release</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Items</TableHeaderCell>
              <TableHeaderCell>Highlights</TableHeaderCell>
              <TableHeaderCell>State</TableHeaderCell>
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
                    <p className="max-w-md text-sm text-muted">{error.message || "Failed to load changelog releases."}</p>
                    <Button onClick={() => void mutate()} variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : releases.length === 0 ? (
              <TableRow>
                <TableCell className="py-12" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className={`
                      flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-muted
                    `}>
                      <History className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-foreground">
                        {keyword || isMajorFilter ? "No changelog releases match this filter." : "No changelog releases yet."}
                      </p>
                      <p className="text-sm text-muted">
                        {keyword || isMajorFilter
                          ? "Try a different filter combination."
                          : "Create the first release to start tracking product updates."}
                      </p>
                    </div>
                    {!keyword && !isMajorFilter ? (
                      <Link href="/cms/changelog/new">
                        <Button variant="outline">
                          <Plus className="size-4" />
                          Create Release
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{release.version}</div>
                      <div className="text-xs text-muted">{release.title}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">{format(new Date(release.releasedOn), "yyyy-MM-dd")}</TableCell>
                  <TableCell>{release.items.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {summarizeItemTypes(release.items).map((item) => (
                        <Badge key={item.label} variant={item.variant}>
                          {item.label} {item.count}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={release.isMajor ? "success" : "muted"}>
                      {release.isMajor ? "Major" : "Minor"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link href={`/cms/changelog/${release.id}`}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </Link>
                      <Button
                        disabled={deleteMutation.isMutating}
                        onClick={() => openDeleteDialog(release)}
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

function getItemTypeVariant(itemType: ChangelogItemType) {
  if (itemType === ChangelogItemType.Added) {
    return "success";
  }

  if (itemType === ChangelogItemType.Fixed) {
    return "warning";
  }

  if (itemType === ChangelogItemType.Removed) {
    return "destructive";
  }

  if (itemType === ChangelogItemType.Improved) {
    return "info";
  }

  return "muted";
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}

function summarizeItemTypes(items: ChangelogReleaseDto["items"]) {
  const counts = new Map<ChangelogItemType, number>();

  for (const item of items) {
    counts.set(item.itemType, (counts.get(item.itemType) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([itemType, count]) => ({
    count,
    label: itemType,
    variant: getItemTypeVariant(itemType) as "destructive" | "info" | "muted" | "success" | "warning",
  }));
}
