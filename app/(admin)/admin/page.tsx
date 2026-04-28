"use client";

import Link from "next/link";

import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  AdminCardSkeletonGrid,
  AdminContentError,
  AdminContentLoading,
} from "@/components/admin/admin-loading-state";

import { fetchApiData } from "@/lib/api/fetcher";
import type { AdminAnalyticsSnapshot } from "@/lib/server/analytics/mappers";
import type { AdminBlog } from "@/lib/server/blogs/mappers";
import type { AdminCategory } from "@/lib/server/categories/mappers";

import { routes } from "@/constants/routes";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
});

const getActivityLabel = (
  type: AdminAnalyticsSnapshot["recentActivity"][number]["type"],
) => {
  switch (type) {
    case "post":
      return "文章";
    case "comment":
      return "评论";
    case "project":
      return "项目";
    case "changelog":
      return "更新日志";
  }
};

export default function AdminDashboard() {
  const {
    data: blogsData,
    error: blogsError,
    isLoading: areBlogsLoading,
    mutate: mutateBlogs,
  } = useSWR<{ items: AdminBlog[] }>(
    "/api/admin/blogs?pageSize=100&sortBy=updatedAt&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: areCategoriesLoading,
    mutate: mutateCategories,
  } = useSWR<{ items: AdminCategory[] }>(
    "/api/admin/categories?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const {
    data: analyticsData,
    error: analyticsError,
    isLoading: isAnalyticsLoading,
    mutate: mutateAnalytics,
  } = useSWR<AdminAnalyticsSnapshot>(
    "/api/admin/analytics?range=30",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const blogs = blogsData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const recentActivity = analyticsData?.recentActivity ?? [];
  const publishedPosts = blogs.filter((blog) => blog.published);
  const commentStats = analyticsData?.overview.interactions;
  const isLoading =
    areBlogsLoading || areCategoriesLoading || isAnalyticsLoading;
  const error = blogsError ?? categoriesError ?? analyticsError;

  const retryLoading = () => {
    void mutateBlogs();
    void mutateCategories();
    void mutateAnalytics();
  };

  const stats = [
    {
      title: "文章总数",
      value: blogs.length.toString(),
      change: `${publishedPosts.length} 条已发布`,
      trend: "up" as const,
      icon: FileText,
    },
    {
      title: "精选文章",
      value: blogs.filter((blog) => blog.featured).length.toString(),
      change: "首页展示",
      trend: "up" as const,
      icon: Eye,
    },
    {
      title: "评论数",
      value: (commentStats?.comments ?? 0).toString(),
      change: `${commentStats?.pendingComments ?? 0} 条待审核`,
      trend: "up" as const,
      icon: MessageSquare,
    },
    {
      title: "分类数量",
      value: categories.length.toString(),
      change: "由后台接口管理",
      trend: "down" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground">内容与后台数据源的整体概览。</p>
        </div>
        <Button asChild>
          <Link href={routes.admin.postsNew}>新建文章</Link>
        </Button>
      </div>

      {isLoading ? (
        <AdminCardSkeletonGrid
          className="md:grid-cols-2 lg:grid-cols-4"
          count={4}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近文章</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={routes.admin.posts}>查看全部</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <AdminContentLoading label="正在加载最近文章..." />
            ) : null}
            {!isLoading && error ? (
              <AdminContentError
                label="仪表盘加载失败"
                onRetry={retryLoading}
              />
            ) : null}
            {!isLoading && !error ? (
              <div className="space-y-4">
                {blogs.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{post.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{post.publishedAt ? "已发布" : "草稿"}</span>
                        <span>·</span>
                        <span>{post.readTimeMinutes} 分钟阅读</span>
                      </div>
                    </div>
                    {post.category && (
                      <Badge variant="secondary">{post.category.name}</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近动态</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <AdminContentLoading label="正在加载最近动态..." />
            ) : null}
            {!isLoading && error ? (
              <AdminContentError label="动态加载失败" onRetry={retryLoading} />
            ) : null}
            {!isLoading && !error ? (
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    暂无动态。
                  </p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="flex gap-4"
                    >
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {activity.type === "comment" ? (
                            <MessageSquare className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        {index !== recentActivity.length - 1 && (
                          <div className="absolute top-8 left-4 h-full w-px bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {activity.title}
                          </p>
                          <Badge variant="outline">
                            {getActivityLabel(activity.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {dateFormatter.format(new Date(activity.createdAt))}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>按分类统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <span className="font-medium">{category.name}</span>
                <Badge variant="outline">{category.blogCount}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
