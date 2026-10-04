import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { SearchParams } from "@/lib/public/schema";

import { Button } from "@/components/ui/button";
import { singleParams } from "@/lib/public/schema";
export function queryHref(
  path: string,
  params: SearchParams,
  changes: Record<string, string | undefined>,
) {
  const values = { ...singleParams(params), ...changes };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) search.set(key, value);
  return search.size ? `${path}?${search}` : path;
}
export function Pagination({
  path,
  params = {},
  page,
  pageCount,
}: {
  path: string;
  params?: SearchParams;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav className="site-pagination" aria-label="分页">
      <Button
        variant="secondary"
        role={page > 1 ? "link" : undefined}
        nativeButton={page <= 1}
        disabled={page <= 1}
        render={
          page > 1 ? <Link href={queryHref(path, params, { page: String(page - 1) })} /> : undefined
        }
      >
        <ChevronLeft size={16} aria-hidden="true" />
        上一页
      </Button>
      <span className="site-pagination-position">
        <span className="sr-only">
          第 {page} 页，共 {pageCount} 页
        </span>
        <span aria-hidden="true">
          {page} / {pageCount}
        </span>
      </span>
      <Button
        variant="secondary"
        role={page < pageCount ? "link" : undefined}
        nativeButton={page >= pageCount}
        disabled={page >= pageCount}
        render={
          page < pageCount ? (
            <Link href={queryHref(path, params, { page: String(page + 1) })} />
          ) : undefined
        }
      >
        下一页
        <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </nav>
  );
}
