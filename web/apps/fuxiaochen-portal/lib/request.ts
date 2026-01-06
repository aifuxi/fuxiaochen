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
    const search = new URLSearchParams(config?.params ?? {});
    const query = search.toString().length ? `?${search.toString()}` : "";

    const { params: _, ...restConfig } = config ?? {};

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${path}${query}`,
      {
        method: "GET",
        next: { revalidate: 3600 }, // 缓存 1 小时 (3600 秒)
        ...restConfig,
      },
    );

    return resp.json() as Promise<T>;
  }
}

export default new APIServiceClient();
