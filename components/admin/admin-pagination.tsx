"use client";

type AdminPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: readonly number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export function AdminPagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: AdminPaginationProps) {
  const safePageSize = Math.max(pageSize, 1);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const rangeEnd =
    total === 0 ? 0 : Math.min(total, currentPage * safePageSize);

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-white/6 bg-surface-1/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <p className="ui-meta">Pagination</p>
        <p className="text-sm text-text-soft">
          {rangeStart}-{rangeEnd} of {total}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-sm text-text-soft">
            <span>Rows</span>
            <select
              className="ui-admin-input min-w-20 px-3 py-2"
              value={String(safePageSize)}
              onChange={(event) => {
                onPageSizeChange(Number(event.target.value));
              }}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            className="ui-admin-button"
            disabled={currentPage <= 1}
            type="button"
            onClick={() => {
              onPageChange?.(currentPage - 1);
            }}
          >
            Previous
          </button>
          <span className="ui-admin-chip">
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="ui-admin-button"
            disabled={currentPage >= totalPages}
            type="button"
            onClick={() => {
              onPageChange?.(currentPage + 1);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
