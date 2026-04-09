import type { CommentDto, CreateCommentInput, ListCommentsQuery, UpdateCommentInput } from "@/lib/comment/comment-dto";

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

type ListCommentsResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ListCommentsResponseData = {
  items: CommentDto[];
};

export type ListCommentsResult = {
  items: CommentDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export class CommentApiError extends Error {
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
    this.name = "CommentApiError";
    this.code = code;
    this.details = details ?? {};
    this.status = status;
  }
}

export async function createComment(input: CreateCommentInput): Promise<CommentDto> {
  const response = await request<CommentDto>("/api/comments", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return response.data;
}

export async function deleteComment(id: string): Promise<{ id: string }> {
  const response = await request<{ id: string }>(`/api/comments/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

export async function getComment(id: string): Promise<CommentDto> {
  const response = await request<CommentDto>(`/api/comments/${id}`, {
    cache: "no-store",
  });

  return response.data;
}

export async function listComments(query: ListCommentsQuery): Promise<ListCommentsResult> {
  const searchParams = new URLSearchParams();

  if (query.articleId) {
    searchParams.set("articleId", query.articleId);
  }

  if (query.keyword) {
    searchParams.set("keyword", query.keyword);
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  searchParams.set("page", String(query.page));
  searchParams.set("pageSize", String(query.pageSize));

  const response = await request<ListCommentsResponseData, ListCommentsResponseMeta>(
    `/api/comments?${searchParams.toString()}`,
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

export async function updateComment(id: string, input: UpdateCommentInput): Promise<CommentDto> {
  const response = await request<CommentDto>(`/api/comments/${id}`, {
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
    throw new CommentApiError({
      code: payload.code,
      details: payload.error?.details,
      message: payload.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new CommentApiError({
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
    throw new CommentApiError({
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
      status: response.status,
    });
  }

  return (await response.json()) as ApiErrorResponse | ApiSuccessResponse<TData, TMeta>;
}
