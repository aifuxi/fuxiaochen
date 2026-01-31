import queryString from "query-string";

class APIServiceClient {
  /**
   * 封装内部的 fetch 方法
   * @param path 请求路径
   * @param params 请求参数
   */
  public async get<T>(
    path: string,
    config?: Omit<RequestInit, "method"> & { params?: Record<string, any> },
  ): Promise<T> {
    const search = queryString.stringify(config?.params ?? {});
    const query = search.length ? `?${search}` : "";

    const { params: _, ...restConfig } = config ?? {};

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${path}${query}`,
      {
        method: "GET",
        cache: "no-store",
        ...restConfig,
      },
    );

    return resp.json() as Promise<T>;
  }

  public async post<T>(
    path: string,
    body?: any,
    config?: Omit<RequestInit, "method" | "body">,
  ): Promise<T> {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
        body: JSON.stringify(body),
        ...config,
      },
    );

    return resp.json() as Promise<T>;
  }
}

const request = new APIServiceClient();

export default request;
