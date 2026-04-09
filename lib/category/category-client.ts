import type { CategoryDto, CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from "@/lib/category/category-dto";

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

type ListCategoriesResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ListCategoriesResponseData = {
  items: CategoryDto[];
};

export type ListCategoriesResult = {
  items: CategoryDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export class CategoryApiError extends Error {
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
    this.name = "CategoryApiError";
    this.code = code;
    this.details = details ?? {};
    this.status = status;
  }
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryDto> {
  const response = await request<CategoryDto>("/api/categories", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return response.data;
}

export async function deleteCategory(id: string): Promise<{ id: string }> {
  const response = await request<{ id: string }>(`/api/categories/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

export async function listCategories(query: ListCategoriesQuery): Promise<ListCategoriesResult> {
  const searchParams = new URLSearchParams();

  if (query.keyword) {
    searchParams.set("keyword", query.keyword);
  }

  searchParams.set("page", String(query.page));
  searchParams.set("pageSize", String(query.pageSize));

  const response = await request<ListCategoriesResponseData, ListCategoriesResponseMeta>(
    `/api/categories?${searchParams.toString()}`,
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

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<CategoryDto> {
  const response = await request<CategoryDto>(`/api/categories/${id}`, {
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
    throw new CategoryApiError({
      code: payload.code,
      details: payload.error?.details,
      message: payload.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new CategoryApiError({
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
    throw new CategoryApiError({
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
      status: response.status,
    });
  }

  return (await response.json()) as ApiErrorResponse | ApiSuccessResponse<TData, TMeta>;
}
