import type { CreateTagInput, ListTagsQuery, TagDto, UpdateTagInput } from "@/lib/tag/tag-dto";

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

type ListTagsResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ListTagsResponseData = {
  items: TagDto[];
};

export type ListTagsResult = {
  items: TagDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export class TagApiError extends Error {
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
    this.name = "TagApiError";
    this.code = code;
    this.details = details ?? {};
    this.status = status;
  }
}

export async function createTag(input: CreateTagInput): Promise<TagDto> {
  const response = await request<TagDto>("/api/tags", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return response.data;
}

export async function deleteTag(id: string): Promise<{ id: string }> {
  const response = await request<{ id: string }>(`/api/tags/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

export async function listTags(query: ListTagsQuery): Promise<ListTagsResult> {
  const searchParams = new URLSearchParams();

  if (query.keyword) {
    searchParams.set("keyword", query.keyword);
  }

  searchParams.set("page", String(query.page));
  searchParams.set("pageSize", String(query.pageSize));

  const response = await request<ListTagsResponseData, ListTagsResponseMeta>(`/api/tags?${searchParams.toString()}`, {
    cache: "no-store",
  });

  return {
    items: response.data.items,
    page: response.meta?.page ?? query.page,
    pageSize: response.meta?.pageSize ?? query.pageSize,
    total: response.meta?.total ?? response.data.items.length,
    totalPages: response.meta?.totalPages ?? 1,
  };
}

export async function updateTag(id: string, input: UpdateTagInput): Promise<TagDto> {
  const response = await request<TagDto>(`/api/tags/${id}`, {
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
    throw new TagApiError({
      code: payload.code,
      details: payload.error?.details,
      message: payload.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new TagApiError({
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
    throw new TagApiError({
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
      status: response.status,
    });
  }

  return (await response.json()) as ApiErrorResponse | ApiSuccessResponse<TData, TMeta>;
}
