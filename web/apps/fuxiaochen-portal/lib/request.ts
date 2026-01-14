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

    console.log(`query: ${query}`);
    console.log(`config?.params: ${JSON.stringify(config?.params)}`);

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
}

export default new APIServiceClient();
