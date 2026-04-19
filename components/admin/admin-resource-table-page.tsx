"use client";

import type { ReactNode } from "react";

import { AdminDataTable } from "./admin-data-table";
import { AdminFilterBar } from "./admin-filter-bar";
import { AdminPagination } from "./admin-pagination";
import { getAdminResourceConfig } from "./admin-resource-config";
import { AdminResourceDrawer } from "./admin-resource-drawer";
import type {
  AdminFilterKey,
  AdminFilterOption,
  AdminFilterValues,
  AdminResourceConfig,
  AdminTableRow,
  ResourceSection,
} from "./admin-types";

type AdminResourceTablePageProps<TItem extends AdminTableRow> = {
  resource: ResourceSection;
  items: readonly TItem[];
  page: number;
  pageSize: number;
  total: number;
  filterValues?: AdminFilterValues;
  filterOptions?: Partial<Record<AdminFilterKey, readonly AdminFilterOption[]>>;
  selectedRowId?: string | null;
  loading?: boolean;
  pending?: boolean;
  errorMessage?: string;
  feedbackMessage?: string;
  drawerOpen?: boolean;
  drawerMode?: "create" | "edit";
  config?: AdminResourceConfig;
  emptyState?: ReactNode;
  filterContent?: ReactNode;
  filterActions?: ReactNode;
  drawerBody?: ReactNode;
  drawerFooter?: ReactNode;
  onCreate?: () => void;
  onCloseDrawer?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onFilterChange?: (
    key: AdminFilterKey,
    value: string | boolean | undefined,
  ) => void;
  onResetFilters?: () => void;
  onRowClick?: (item: TItem) => void;
};

export function AdminResourceTablePage<TItem extends AdminTableRow>({
  resource,
  items,
  page,
  pageSize,
  total,
  filterValues,
  filterOptions,
  selectedRowId,
  loading = false,
  pending = false,
  errorMessage,
  feedbackMessage,
  drawerOpen = false,
  drawerMode = "create",
  config: providedConfig,
  emptyState,
  filterContent,
  filterActions,
  drawerBody,
  drawerFooter,
  onCreate,
  onCloseDrawer,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  onResetFilters,
  onRowClick,
}: AdminResourceTablePageProps<TItem>) {
  const config = providedConfig ?? getAdminResourceConfig(resource);
  const drawerTitle =
    drawerMode === "edit" ? config.drawer.editTitle : config.drawer.createTitle;

  return (
    <main className="shell-page flex flex-col gap-8 pt-32 pb-24">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <p className="ui-eyebrow">{config.title}</p>
          <h1 className="text-display-2 font-light tracking-[-0.06em] text-text-strong md:text-[4rem]">
            {config.title}
          </h1>
          <p className="max-w-2xl text-body-lg text-text-base">
            {config.description}
          </p>
        </div>

        <button
          className="ui-admin-button-primary"
          disabled={pending}
          type="button"
          onClick={onCreate}
        >
          {config.createLabel}
        </button>
      </header>

      {errorMessage ? (
        <div className="rounded-control border border-rose-300/20 bg-rose-500/8 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      {feedbackMessage ? (
        <div className="rounded-control border border-brand/20 bg-brand/8 px-4 py-3 text-sm text-brand-soft">
          {feedbackMessage}
        </div>
      ) : null}

      <AdminFilterBar
        actions={filterActions}
        filterOptions={filterOptions}
        filters={config.filters}
        summary={`${total} total records`}
        values={filterValues}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
      >
        {filterContent}
      </AdminFilterBar>

      {loading ? (
        <section className="ui-panel p-8">
          <p className="ui-meta">Loading</p>
          <p className="mt-4 text-base leading-7 text-text-base">
            Loading {config.title.toLowerCase()} table state...
          </p>
        </section>
      ) : (
        <AdminDataTable
          caption={`${config.title} table`}
          columns={config.columns}
          emptyState={
            emptyState ?? (
              <div className="space-y-2">
                <p className="text-base font-medium text-text-strong">
                  {config.view.emptyTitle}
                </p>
                <p className="text-sm text-text-soft">
                  {config.view.emptyDescription}
                </p>
              </div>
            )
          }
          items={items}
          selectedRowId={selectedRowId}
          onRowClick={onRowClick}
        />
      )}

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <AdminResourceDrawer
        description={config.drawer.description}
        footer={drawerFooter}
        open={drawerOpen}
        title={drawerTitle}
        onClose={onCloseDrawer}
      >
        {drawerBody}
      </AdminResourceDrawer>
    </main>
  );
}
