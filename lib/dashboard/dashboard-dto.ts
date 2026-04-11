import type { ArticleStatus, CommentStatus } from "@/generated/prisma/enums";

type DashboardArticleRecord = {
  category: {
    name: string;
  } | null;
  id: string;
  status: ArticleStatus;
  title: string;
  updatedAt: Date;
};

export type DashboardMetricTone = "info" | "success" | "warning";

export type DashboardMetricDto = {
  deltaLabel: string;
  key: "avgReadTime" | "pendingComments" | "publishedArticles" | "totalViews";
  title: string;
  tone: DashboardMetricTone;
  value: string;
};

export type DashboardArticleDto = {
  category: string;
  id: string;
  status: ArticleStatus;
  title: string;
  updatedAt: string;
};

export type DashboardActivityDto = {
  id: string;
  message: string;
  occurredAt: string;
  type: "article" | "changelog" | "comment" | "user";
};

export type DashboardDto = {
  activityFeed: DashboardActivityDto[];
  recentArticles: DashboardArticleDto[];
  stats: DashboardMetricDto[];
};

export function toDashboardArticleDto(article: DashboardArticleRecord): DashboardArticleDto {
  return {
    category: article.category?.name ?? "Uncategorized",
    id: article.id,
    status: article.status,
    title: article.title,
    updatedAt: article.updatedAt.toISOString(),
  };
}

export function toActivityDto(activity: {
  id: string;
  message: string;
  occurredAt: Date;
  type: DashboardActivityDto["type"];
}): DashboardActivityDto {
  return {
    id: activity.id,
    message: activity.message,
    occurredAt: activity.occurredAt.toISOString(),
    type: activity.type,
  };
}

export function getCommentStatusLabel(status: CommentStatus) {
  return status.toLowerCase();
}
