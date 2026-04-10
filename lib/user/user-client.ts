import type { CreateUserInput, ListUsersQuery, UpdateUserInput, UserDto } from "@/lib/user/user-dto";

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

type ListUsersResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ListUsersResponseData = {
  items: UserDto[];
};

export type ListUsersResult = {
  items: UserDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export class UserApiError extends Error {
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
    this.name = "UserApiError";
    this.code = code;
    this.details = details ?? {};
    this.status = status;
  }
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const response = await request<UserDto>("/api/users", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return response.data;
}

export async function deleteUser(id: string): Promise<{ id: string }> {
  const response = await request<{ id: string }>(`/api/users/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

export async function listUsers(query: ListUsersQuery): Promise<ListUsersResult> {
  const searchParams = new URLSearchParams();

  if (query.keyword) {
    searchParams.set("keyword", query.keyword);
  }

  if (query.role) {
    searchParams.set("role", query.role);
  }

  searchParams.set("page", String(query.page));
  searchParams.set("pageSize", String(query.pageSize));

  const response = await request<ListUsersResponseData, ListUsersResponseMeta>(`/api/users?${searchParams.toString()}`, {
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

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserDto> {
  const response = await request<UserDto>(`/api/users/${id}`, {
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
    throw new UserApiError({
      code: payload.code,
      details: payload.error?.details,
      message: payload.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new UserApiError({
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
    throw new UserApiError({
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
      status: response.status,
    });
  }

  return (await response.json()) as ApiErrorResponse | ApiSuccessResponse<TData, TMeta>;
}
