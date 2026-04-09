import type { CreateProjectInput, ListProjectsQuery, ProjectDto, UpdateProjectInput } from "@/lib/project/project-dto";

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

type ListProjectsResponseMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ListProjectsResponseData = {
  items: ProjectDto[];
};

export type ListProjectsResult = {
  items: ProjectDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export class ProjectApiError extends Error {
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
    this.name = "ProjectApiError";
    this.code = code;
    this.details = details ?? {};
    this.status = status;
  }
}

export async function createProject(input: CreateProjectInput): Promise<ProjectDto> {
  const response = await request<ProjectDto>("/api/projects", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return response.data;
}

export async function deleteProject(id: string): Promise<{ id: string }> {
  const response = await request<{ id: string }>(`/api/projects/${id}`, {
    method: "DELETE",
  });

  return response.data;
}

export async function getProject(id: string): Promise<ProjectDto> {
  const response = await request<ProjectDto>(`/api/projects/${id}`, {
    cache: "no-store",
  });

  return response.data;
}

export async function listProjects(query: ListProjectsQuery): Promise<ListProjectsResult> {
  const searchParams = new URLSearchParams();

  if (query.category) {
    searchParams.set("category", query.category);
  }

  if (query.isFeatured !== undefined) {
    searchParams.set("isFeatured", String(query.isFeatured));
  }

  if (query.keyword) {
    searchParams.set("keyword", query.keyword);
  }

  searchParams.set("page", String(query.page));
  searchParams.set("pageSize", String(query.pageSize));

  const response = await request<ListProjectsResponseData, ListProjectsResponseMeta>(
    `/api/projects?${searchParams.toString()}`,
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

export async function updateProject(id: string, input: UpdateProjectInput): Promise<ProjectDto> {
  const response = await request<ProjectDto>(`/api/projects/${id}`, {
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
    throw new ProjectApiError({
      code: payload.code,
      details: payload.error?.details,
      message: payload.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new ProjectApiError({
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
    throw new ProjectApiError({
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
      status: response.status,
    });
  }

  return (await response.json()) as ApiErrorResponse | ApiSuccessResponse<TData, TMeta>;
}
