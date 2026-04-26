import type { AdminAnalyticsQuery } from "./dto";
import { analyticsRepository } from "./repository";

export type AnalyticsOverview = {
  posts: {
    total: number;
    published: number;
    drafts: number;
    featured: number;
  };
  taxonomy: {
    categories: number;
    tags: number;
  };
  interactions: {
    comments: number;
    pendingComments: number;
    approvedComments: number;
    spamComments: number;
    views: number;
    likes: number;
    unlikes: number;
  };
  library: {
    projects: number;
    publishedProjects: number;
    friends: number;
    changelogs: number;
  };
};

export type AnalyticsDailyMetric = {
  date: string;
  views: number;
  likes: number;
  unlikes: number;
  comments: number;
  posts: number;
};

export type AnalyticsTopPost = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
};

export type AnalyticsDistributionItem = {
  id: string;
  name: string;
  slug: string;
  total: number;
  published: number;
};

export type AnalyticsCommentStatus = {
  status: "pending" | "approved" | "spam";
  total: number;
};

export type AnalyticsActivity = {
  id: string;
  type: "post" | "comment" | "project" | "changelog";
  title: string;
  description: string;
  createdAt: Date | string;
};

export type AnalyticsSnapshot = {
  range: AdminAnalyticsQuery["range"];
  overview: AnalyticsOverview;
  daily: AnalyticsDailyMetric[];
  topPosts: AnalyticsTopPost[];
  categories: AnalyticsDistributionItem[];
  tags: AnalyticsDistributionItem[];
  commentStatuses: AnalyticsCommentStatus[];
  recentActivity: AnalyticsActivity[];
};

export interface AnalyticsRepository {
  getOverview(startDate: string): Promise<AnalyticsOverview>;
  listDailyMetrics(startDate: string): Promise<AnalyticsDailyMetric[]>;
  listTopPosts(startDate: string, limit: number): Promise<AnalyticsTopPost[]>;
  listCategoryDistribution(limit: number): Promise<AnalyticsDistributionItem[]>;
  listTagDistribution(limit: number): Promise<AnalyticsDistributionItem[]>;
  listCommentStatuses(): Promise<AnalyticsCommentStatus[]>;
  listRecentActivity(limit: number): Promise<AnalyticsActivity[]>;
}

export interface AnalyticsService {
  getSnapshot(query: AdminAnalyticsQuery): Promise<AnalyticsSnapshot>;
}

export interface AnalyticsServiceDeps {
  repository?: AnalyticsRepository;
  now?: () => Date;
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const getRangeStartDate = (now: Date, range: number) =>
  formatDateKey(addDays(now, -(range - 1)));

const fillDailyMetrics = ({
  items,
  now,
  range,
}: {
  items: AnalyticsDailyMetric[];
  now: Date;
  range: number;
}) => {
  const itemsByDate = new Map(items.map((item) => [item.date, item]));
  const startDate = addDays(now, -(range - 1));

  return Array.from({ length: range }, (_, index) => {
    const date = formatDateKey(addDays(startDate, index));

    return (
      itemsByDate.get(date) ?? {
        date,
        views: 0,
        likes: 0,
        unlikes: 0,
        comments: 0,
        posts: 0,
      }
    );
  });
};

export function createAnalyticsService({
  repository = analyticsRepository,
  now = () => new Date(),
}: AnalyticsServiceDeps = {}): AnalyticsService {
  return {
    async getSnapshot(query) {
      const currentDate = now();
      const startDate = getRangeStartDate(currentDate, query.range);

      const [
        overview,
        daily,
        topPosts,
        categories,
        tags,
        commentStatuses,
        recentActivity,
      ] = await Promise.all([
        repository.getOverview(startDate),
        repository.listDailyMetrics(startDate),
        repository.listTopPosts(startDate, 8),
        repository.listCategoryDistribution(8),
        repository.listTagDistribution(10),
        repository.listCommentStatuses(),
        repository.listRecentActivity(8),
      ]);

      return {
        range: query.range,
        overview,
        daily: fillDailyMetrics({
          items: daily,
          now: currentDate,
          range: query.range,
        }),
        topPosts,
        categories,
        tags,
        commentStatuses,
        recentActivity,
      };
    },
  };
}
