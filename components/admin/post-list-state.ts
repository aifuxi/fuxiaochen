"use client";

import type { OnChangeFn, PaginationState, SortingState } from "@tanstack/react-table";

import { useSearchParams } from "next/navigation";

import { postQuerySchema } from "@/lib/posts/schema";

const patch = (changes: Record<string, string | number | undefined>) => {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === "" || value === "all" || (key === "page" && value === 1))
      url.searchParams.delete(key);
    else url.searchParams.set(key, String(value));
  }
  history.replaceState(null, "", url.pathname + url.search);
};

export function usePostListState() {
  const search = useSearchParams();
  const parsed = postQuerySchema.safeParse(Object.fromEntries(search));
  const state = parsed.success ? parsed.data : postQuerySchema.parse({});

  const sorting: SortingState = state.sortBy
    ? [{ id: state.sortBy, desc: state.sortDirection === "desc" }]
    : [];
  const pagination: PaginationState = { pageIndex: state.page - 1, pageSize: state.pageSize };
  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    patch({
      sortBy: next[0]?.id,
      sortDirection: next[0] ? (next[0].desc ? "desc" : "asc") : undefined,
      page: 1,
    });
  };
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    patch({
      page: next.pageSize === pagination.pageSize ? next.pageIndex + 1 : 1,
      pageSize: next.pageSize,
    });
  };
  return {
    state,
    patch,
    tableState: {
      sorting,
      pagination,
      onSortingChange,
      onPaginationChange,
      page: state.page,
      setPage: (page: number) => patch({ page }),
    },
  };
}
