import { headers } from "next/headers";

import type {
  PublicArticleDetailDto,
  PublicArticleListItemDto,
  PublicChangelogReleaseDto,
  PublicFriendLinkDto,
  PublicListResult,
  PublicProjectDto,
  PublicSiteDto,
} from "@/lib/public/public-content-dto";

type ApiSuccessResponse<TData, TMeta = undefined> = {
  code: "OK";
  data: TData;
  message: string;
  meta?: TMeta;
  success: true;
};

type ApiErrorResponse = {
  code: string;
  error?: {
    details?: Record<string, unknown>;
  };
  message: string;
  success: false;
};

type ListResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ListResponseData<TItem> = {
  items: TItem[];
};

export class PublicContentApiError extends Error {
  code: string;
  details: Record<string, unknown>;
  status: number;

  constructor({
    code,
    details,
    message,
    status,
  }: {
    code: string;
    details?: Record<string, unknown>;
    message: string;
    status: number;
  }) {
    super(message);
    this.name = "PublicContentApiError";
    this.code = code;
    this.details = details ?? {};
    this.status = status;
  }
}

export async function getPublicArticle(slug: string): Promise<PublicArticleDetailDto> {
  const response = await request<PublicArticleDetailDto>(`/api/public/articles/${slug}`);

  return response.data;
}

export async function getPublicSite(): Promise<PublicSiteDto> {
  const response = await request<PublicSiteDto>("/api/public/site");

  return response.data;
}

export async function listPublicArticles(query: {
  categorySlug?: string;
  featured?: boolean;
  keyword?: string;
  page: number;
  pageSize: number;
}): Promise<PublicListResult<PublicArticleListItemDto>> {
  return listRequest<PublicArticleListItemDto>("/api/public/articles", query);
}

export async function listPublicProjects(query: {
  category?: string;
  featured?: boolean;
  keyword?: string;
  page: number;
  pageSize: number;
}): Promise<PublicListResult<PublicProjectDto>> {
  return listRequest<PublicProjectDto>("/api/public/projects", query);
}

export async function listPublicFriendLinks(query: {
  keyword?: string;
  page: number;
  pageSize: number;
}): Promise<PublicListResult<PublicFriendLinkDto>> {
  return listRequest<PublicFriendLinkDto>("/api/public/friend-links", query);
}

export async function listPublicChangelog(query: {
  isMajor?: boolean;
  page: number;
  pageSize: number;
}): Promise<PublicListResult<PublicChangelogReleaseDto>> {
  return listRequest<PublicChangelogReleaseDto>("/api/public/changelog", query);
}

async function listRequest<TItem>(
  pathname: string,
  query: Record<string, boolean | number | string | undefined>,
): Promise<PublicListResult<TItem>> {
  const response = await request<ListResponseData<TItem>, ListResponseMeta>(withQuery(pathname, query));

  return {
    items: response.data.items,
    page: response.meta?.page ?? Number(query.page ?? 1),
    pageSize: response.meta?.pageSize ?? Number(query.pageSize ?? response.data.items.length),
    total: response.meta?.total ?? response.data.items.length,
    totalPages: response.meta?.totalPages ?? 1,
  };
}

async function request<TData, TMeta = undefined>(
  pathname: string,
  init?: RequestInit,
): Promise<ApiSuccessResponse<TData, TMeta>> {
  const response = await fetch(await getPublicApiUrl(pathname), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const payload = await parsePayload<TData, TMeta>(response);

  if (!payload.success) {
    throw new PublicContentApiError({
      code: payload.code,
      details: payload.error?.details,
      message: payload.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new PublicContentApiError({
      code: "HTTP_ERROR",
      message: payload.message,
      status: response.status,
    });
  }

  return payload;
}

async function parsePayload<TData, TMeta>(
  response: Response,
): Promise<ApiErrorResponse | ApiSuccessResponse<TData, TMeta>> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new PublicContentApiError({
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
      status: response.status,
    });
  }

  return (await response.json()) as ApiErrorResponse | ApiSuccessResponse<TData, TMeta>;
}

async function getPublicApiUrl(pathname: string) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return new URL(pathname, origin);
}

function withQuery(pathname: string, query: Record<string, boolean | number | string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}
