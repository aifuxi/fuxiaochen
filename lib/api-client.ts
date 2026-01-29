import { toast } from "sonner";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

const BASE_URL = "/api/v1";

async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...init } = options;

  let fullUrl = `${BASE_URL}${url}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    fullUrl += `?${searchParams.toString()}`;
  }

  const response = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || "Something went wrong";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (data.code !== 0 && data.code !== undefined) {
    const errorMessage = data.message || "Business error";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  return data.data;
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "POST", body: JSON.stringify(data) }),

  put: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "PUT", body: JSON.stringify(data) }),

  patch: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "DELETE" }),
};
