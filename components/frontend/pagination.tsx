import Link from "next/link";

import type { SearchParams } from "@/lib/public/schema";

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
      {page > 1 ? (
        <Link href={queryHref(path, params, { page: String(page - 1) })}>上一页</Link>
      ) : (
        <span aria-disabled="true">上一页</span>
      )}
      <span>
        第 {page} / {pageCount} 页
      </span>
      {page < pageCount ? (
        <Link href={queryHref(path, params, { page: String(page + 1) })}>下一页</Link>
      ) : (
        <span aria-disabled="true">下一页</span>
      )}
    </nav>
  );
}
