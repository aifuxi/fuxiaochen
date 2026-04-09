import type { ArticleDto, ArticleListItemDto, CreateArticleInput, ListArticlesQuery, UpdateArticleInput } from "@/lib/article/article-dto";

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

type ListArticlesResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ListArticlesResponseData = {
  items: ArticleListItemDto[];
};

export type ListArticlesResult = {
  items: ArticleListItemDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export class ArticleApiError extends Error {
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
    this.name = "ArticleApiError";
    this.code = code;
    this.details = details ?? {};
    this.status = status;
  }
}

export async function createArticle(input: CreateArticleInput): Promise<ArticleDto> {
  const response = await request<ArticleDto>("/api/articles", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return response.data;
}

export async function deleteArticle(id: string): Promise<{ id: string }> {
  const response = await request<{ id: string }>(`/api/articles/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

export async function getArticle(id: string): Promise<ArticleDto> {
  const response = await request<ArticleDto>(`/api/articles/${id}`, {
    cache: "no-store",
  });

  return response.data;
}

export async function listArticles(query: ListArticlesQuery): Promise<ListArticlesResult> {
  const searchParams = new URLSearchParams();

  if (query.categoryId) {
    searchParams.set("categoryId", query.categoryId);
  }

  if (query.keyword) {
    searchParams.set("keyword", query.keyword);
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  searchParams.set("page", String(query.page));
  searchParams.set("pageSize", String(query.pageSize));

  const response = await request<ListArticlesResponseData, ListArticlesResponseMeta>(
    `/api/articles?${searchParams.toString()}`,
    {
      cache: "no-store",
    },
  );

  return {
    items: response.data.items,
    page: response.meta?.page ?? query.page,
    pageSize: response.meta?.pageSize ?? query.pageSize,
    total: response.meta?.total ?? response.data.items.length,
    totalPages: response.meta?.totalPages ?? 1,
  };
}

export async function updateArticle(id: string, input: UpdateArticleInput): Promise<ArticleDto> {
  const response = await request<ArticleDto>(`/api/articles/${id}`, {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  return response.data;
}

async function request<TData, TMeta = undefined>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ApiSuccessResponse<TData, TMeta>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const payload = await parsePayload(response);

  if (!payload.success) {
    throw new ArticleApiError({
      code: payload.code,
      details: payload.error?.details,
      message: payload.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new ArticleApiError({
      code: "HTTP_ERROR",
      message: payload.message,
      status: response.status,
    });
  }

  return payload as ApiSuccessResponse<TData, TMeta>;
}

async function parsePayload<TData, TMeta>(
  response: Response,
): Promise<ApiErrorResponse | ApiSuccessResponse<TData, TMeta>> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new ArticleApiError({
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
      status: response.status,
    });
  }

  return (await response.json()) as ApiErrorResponse | ApiSuccessResponse<TData, TMeta>;
}
