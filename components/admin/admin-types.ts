import type { ReactNode } from "react";

export type ResourceSection = "categories" | "tags" | "blogs" | "changelogs";

export type AdminSortDirection = "asc" | "desc";

export type AdminListParams = {
  page: number;
  pageSize: number;
  query?: string;
  sortBy?: string;
  sortDirection: AdminSortDirection;
  published?: boolean;
  featured?: boolean;
  categoryId?: string;
};

export type AdminListParamsDefaults = Pick<
  AdminListParams,
  "page" | "pageSize" | "sortDirection"
> & {
  sortBy?: string;
};

export type AdminListParamConstraints = {
  sortKeys?: readonly string[];
};

export type AdminListMeta = {
  page: number;
  pageSize: number;
  total: number;
};

export type AdminResourceListResult<TItem> = {
  items: TItem[];
  meta: AdminListMeta;
};

type AdminRenderableTableCell = Exclude<ReactNode, boolean | null | undefined>;

export type AdminTableCellValue =
  | AdminRenderableTableCell
  | boolean
  | null
  | undefined;

export type AdminTableRow = Record<string, unknown> & {
  id: string;
};

export type AdminTableColumn<
  TItem extends AdminTableRow = AdminTableRow,
  TKey extends string = string,
> = {
  key: TKey;
  label: string;
  className?: string;
  headerClassName?: string;
  render?: (item: TItem) => AdminTableCellValue;
};

export type AdminFilterKey = "query" | "published" | "featured" | "categoryId";

export type AdminFilterValues = Pick<Partial<AdminListParams>, AdminFilterKey>;

export type AdminFilterKind = "search" | "select" | "boolean";

export type AdminFilterOption = {
  label: string;
  value: string;
};

type AdminSearchFilterConfig = {
  key: "query";
  label: string;
  kind: "search";
  placeholder?: string;
};

type AdminBooleanFilterConfig = {
  key: "published" | "featured";
  label: string;
  kind: "boolean";
};

type AdminSelectFilterConfig = {
  key: "categoryId";
  label: string;
  kind: "select";
  placeholder?: string;
  options?: readonly AdminFilterOption[];
};

export type AdminFilterConfig =
  | AdminSearchFilterConfig
  | AdminBooleanFilterConfig
  | AdminSelectFilterConfig;

export type AdminResourceDrawerCopy = {
  createTitle: string;
  editTitle: string;
  description: string;
};

export type AdminResourceViewCopy = {
  emptyTitle: string;
  emptyDescription: string;
};

export type AdminResourceFormCopy = {
  submitLabel: string;
  deleteLabel: string;
};

export type AdminResourceConfig = {
  resource: ResourceSection;
  title: string;
  description: string;
  createLabel: string;
  columns: readonly AdminTableColumn[];
  searchableFields: readonly string[];
  filters: readonly AdminFilterConfig[];
  sortKeys: readonly string[];
  defaultListParams: AdminListParamsDefaults;
  drawer: AdminResourceDrawerCopy;
  view: AdminResourceViewCopy;
  form: AdminResourceFormCopy;
};

export type CategoryRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: string;
};

export type TagRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: string;
};

export type BlogRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: string;
  description: string;
  cover: string;
  content: string;
  published: boolean;
  publishedAt: string | null;
  featured: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export type ChangelogRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  content: string;
  releaseDate: string | null;
};

export type AdminDashboardData = {
  categories: CategoryRecord[];
  tags: TagRecord[];
  blogs: BlogRecord[];
  changelogs: ChangelogRecord[];
};

export type CategoryDraft = {
  name: string;
  slug: string;
  description: string;
};

export type TagDraft = {
  name: string;
  slug: string;
  description: string;
};

export type BlogDraft = {
  title: string;
  slug: string;
  description: string;
  cover: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  published: boolean;
  publishedAt: string;
  featured: boolean;
};

export type ChangelogDraft = {
  version: string;
  content: string;
  releaseDate: string;
};

export type DraftByResource = {
  categories: CategoryDraft;
  tags: TagDraft;
  blogs: BlogDraft;
  changelogs: ChangelogDraft;
};
