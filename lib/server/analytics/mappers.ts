import type { AnalyticsSnapshot } from "./service";

export type AdminAnalyticsSnapshot = AnalyticsSnapshot;

export const toAdminAnalytics = (
  snapshot: AnalyticsSnapshot,
): AdminAnalyticsSnapshot => snapshot;
