import type {
  AdminListParams,
  AdminListParamsDefaults,
  AdminSortDirection,
} from "./admin-types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const DEFAULT_SORT_DIRECTION = "desc" satisfies AdminSortDirection;

type AdminListParamsInput = {
  page?: string | number;
  pageSize?: string | number;
  query?: string;
  sortBy?: string;
  sortDirection?: string;
  published?: string | boolean;
  featured?: string | boolean;
  categoryId?: string;
};

function normalizeOptionalString(value: string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function parsePositiveInteger(
  value: string | number | undefined,
  fallback: number,
  max?: number,
) {
  let numericValue: number;

  if (typeof value === "number") {
    numericValue = value;
  } else {
    const normalizedValue = normalizeOptionalString(value);

    if (!normalizedValue || !/^\d+$/.test(normalizedValue)) {
      return fallback;
    }

    numericValue = Number(normalizedValue);
  }

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return fallback;
  }

  if (typeof max === "number") {
    return Math.min(numericValue, max);
  }

  return numericValue;
}

function parseSortDirection(
  value: string | undefined,
  fallback: AdminSortDirection,
) {
  return value === "asc" || value === "desc" ? value : fallback;
}

function parseOptionalBoolean(value: string | boolean | null | undefined) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = normalizeOptionalString(value)?.toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  return undefined;
}

export function normalizeAdminListParams(
  params: AdminListParamsInput,
  defaults: Partial<AdminListParamsDefaults> = {},
): AdminListParams {
  const sortBy = normalizeOptionalString(params.sortBy) ?? defaults.sortBy;
  const query = normalizeOptionalString(params.query);
  const categoryId = normalizeOptionalString(params.categoryId);
  const published = parseOptionalBoolean(params.published);
  const featured = parseOptionalBoolean(params.featured);

  return {
    page: parsePositiveInteger(params.page, defaults.page ?? DEFAULT_PAGE),
    pageSize: parsePositiveInteger(
      params.pageSize,
      defaults.pageSize ?? DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    ),
    sortDirection: parseSortDirection(
      params.sortDirection,
      defaults.sortDirection ?? DEFAULT_SORT_DIRECTION,
    ),
    ...(sortBy ? { sortBy } : {}),
    ...(query ? { query } : {}),
    ...(typeof published === "boolean" ? { published } : {}),
    ...(typeof featured === "boolean" ? { featured } : {}),
    ...(categoryId ? { categoryId } : {}),
  };
}

export function parseAdminListParams(
  params: URLSearchParams,
  defaults: Partial<AdminListParamsDefaults> = {},
): AdminListParams {
  return normalizeAdminListParams(
    {
      page: params.get("page") ?? undefined,
      pageSize: params.get("pageSize") ?? undefined,
      query: params.get("query") ?? undefined,
      sortBy: params.get("sortBy") ?? undefined,
      sortDirection: params.get("sortDirection") as
        | AdminSortDirection
        | undefined,
      published: params.get("published") ?? undefined,
      featured: params.get("featured") ?? undefined,
      categoryId: params.get("categoryId") ?? undefined,
    },
    defaults,
  );
}

export function toAdminListSearchParams(
  params: Partial<AdminListParams>,
  defaults: Partial<AdminListParamsDefaults> = {},
) {
  const normalizedParams = normalizeAdminListParams(params, defaults);
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(normalizedParams.page));
  searchParams.set("pageSize", String(normalizedParams.pageSize));

  if (normalizedParams.query) {
    searchParams.set("query", normalizedParams.query);
  }

  if (normalizedParams.sortBy) {
    searchParams.set("sortBy", normalizedParams.sortBy);
  }

  searchParams.set("sortDirection", normalizedParams.sortDirection);

  if (typeof normalizedParams.published === "boolean") {
    searchParams.set("published", String(normalizedParams.published));
  }

  if (typeof normalizedParams.featured === "boolean") {
    searchParams.set("featured", String(normalizedParams.featured));
  }

  if (normalizedParams.categoryId) {
    searchParams.set("categoryId", normalizedParams.categoryId);
  }

  return searchParams;
}
