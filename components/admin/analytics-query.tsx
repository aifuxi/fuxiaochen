"use client";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type {
  AnalyticsRange,
  AnalyticsSnapshot,
  CollectionInfo,
  VisitorList,
  VisitorQuery,
} from "@/lib/analytics/schema";

import { resourceRequest } from "./business-request";
import { BusinessStatus } from "./business-status";
import { AdminRequestError } from "./use-posts";
import "./admin-business.css";

const expiredContext = createContext(false);
export function AnalyticsQueryProvider({ children }: { children: ReactNode }) {
  const [expired, setExpired] = useState(false);
  const [client] = useState(() => {
    const instance = new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          if (
            error instanceof AdminRequestError &&
            (error.status === 401 || error.code === "UNAUTHORIZED")
          ) {
            setExpired(true);
            void instance
              .cancelQueries({ queryKey: ["analytics"] })
              .then(() => instance.removeQueries({ queryKey: ["analytics"] }));
          }
        },
      }),
      defaultOptions: {
        queries: {
          gcTime: 5 * 60_000,
          refetchOnWindowFocus: false,
          retry: (count, error) =>
            count < 2 &&
            error instanceof AdminRequestError &&
            ((error.code === "REQUEST_FAILED" && error.status === 0) || error.status >= 500),
          retryDelay: (attempt) => 1000 * 2 ** attempt,
        },
      },
    });
    return instance;
  });
  return (
    <expiredContext.Provider value={expired}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </expiredContext.Provider>
  );
}
const request = resourceRequest("/api/admin");
const subscribe = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const visibleSnapshot = () => document.visibilityState === "visible";
export function useVisitors(filters: VisitorQuery, paused: boolean) {
  const expired = useContext(expiredContext);
  const visible = useSyncExternalStore(subscribe, visibleSnapshot, () => true);
  const client = useQueryClient();
  const wasVisible = useRef(visible);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters))
    if (value !== undefined) params.set(key, String(value));
  const query = useQuery({
    queryKey: ["analytics", "visitors", filters],
    queryFn: ({ signal }) => request<VisitorList>(`/visitors?${params}`, { signal }),
    staleTime: 5000,
    enabled: !expired && visible,
    refetchInterval: paused || !visible ? false : 10_000,
    refetchIntervalInBackground: false,
    refetchOnReconnect: !paused,
  });
  const { refetch } = query;
  useEffect(() => {
    if (paused || !visible) void client.cancelQueries({ queryKey: ["analytics", "visitors"] });
    else if (!wasVisible.current && !expired) void refetch({ cancelRefetch: false });
    wasVisible.current = visible;
  }, [client, expired, paused, visible, refetch]);
  return {
    ...query,
    isPending: expired ? false : query.isPending,
    data: expired ? undefined : query.data,
    error: expired ? new Error("登录已失效，请重新登录。") : query.error,
  };
}
export function useAnalytics(range: AnalyticsRange) {
  const expired = useContext(expiredContext);
  const query = useQuery({
    queryKey: ["analytics", "report", range],
    queryFn: ({ signal }) => request<AnalyticsSnapshot>(`/analytics?range=${range}`, { signal }),
    staleTime: 30_000,
    enabled: !expired,
  });
  return {
    ...query,
    isPending: expired ? false : query.isPending,
    data: expired ? undefined : query.data,
    error: expired ? new Error("登录已失效，请重新登录。") : query.error,
  };
}
export function AnalyticsQueryStatus({
  loading,
  error,
  hasData,
  reload,
}: {
  loading: boolean;
  error: Error | null;
  hasData: boolean;
  reload: () => void;
}) {
  return (
    <>
      {error && hasData && (
        <p className="admin-business-feedback">刷新失败，以下为上次查询的旧数据。</p>
      )}
      <BusinessStatus loading={loading && !hasData} error={error?.message ?? ""} reload={reload} />
    </>
  );
}
export function CollectionStatus({ collection }: { collection: CollectionInfo }) {
  return (
    <>
      {!collection.enabled && (
        <p className="admin-business-feedback">
          本地访问采集已关闭，可在系统设置 → 访问统计中启用。已保存的数据仍可查询。
        </p>
      )}
      {!collection.production && (
        <p className="admin-business-feedback">当前为开发环境，不采集访问。</p>
      )}
    </>
  );
}
