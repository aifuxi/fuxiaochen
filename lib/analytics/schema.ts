import { z } from "zod";

export const RETENTION_MS = 180 * 86_400_000;
export const SESSION_IDLE_MS = 30 * 60_000;
export const ONLINE_MS = 5 * 60_000;
export const eventSchema = z.strictObject({
  pageViewId: z.uuid(),
  visitorId: z.uuid(),
  path: z.string().max(2048).startsWith("/"),
  referrer: z.string().max(2048),
  durationMs: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  progress: z.number().int().min(0).max(100),
  visible: z.boolean(),
});
export const analyticsRanges = [
  { value: "7d", label: "近 7 天" },
  { value: "30d", label: "近 30 天" },
  { value: "quarter", label: "本季度" },
] as const;
export const rangeSchema = z.object({ range: z.enum(["7d", "30d", "quarter"]).default("30d") });
export const visitorSortKeys = [
  "ip",
  "location",
  "entryPage",
  "platform",
  "duration",
  "time",
] as const;
export const visitorQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(visitorSortKeys).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});
export type AnalyticsEvent = z.infer<typeof eventSchema>;
export type AnalyticsRange = z.infer<typeof rangeSchema>["range"];
export type VisitorQuery = z.infer<typeof visitorQuerySchema>;
export type CollectionInfo = {
  enabled: boolean;
  production: boolean;
  startedAt: string | null;
  availableFrom: string;
  generatedAt: string;
};
export type VisitorLog = {
  id: string;
  ip: string;
  location: string;
  entryPage: string;
  browser: string;
  os: string;
  durationMs: number;
  createdAt: string;
};
export type VisitorList = {
  items: VisitorLog[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  summary: { online: number; uv: number; pv: number };
  collection: CollectionInfo;
};
export type AnalyticsMetrics = {
  pv: number;
  uv: number;
  durationMs: number | null;
  bounce: number | null;
};
export type AnalyticsSnapshot = {
  range: AnalyticsRange;
  start: string;
  end: string;
  collection: CollectionInfo;
  incomplete: boolean;
  metrics: AnalyticsMetrics;
  changes: Record<keyof AnalyticsMetrics, number | null>;
  trend: { date: string; pv: number | null; uv: number | null }[];
  devices: { name: string; count: number; percent: number }[];
  sources: { name: string; count: number; percent: number }[];
  articles: { id: string; title: string; path: string; pv: number; uv: number; rate: number }[];
};
export function durationLabel(ms: number | null) {
  if (ms === null) return "—";
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
}
