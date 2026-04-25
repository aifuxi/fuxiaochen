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

import { fetchApiData } from "@/lib/api/fetcher";
import type { AdminBlog } from "@/lib/server/blogs/mappers";
import type { AdminCategory } from "@/lib/server/categories/mappers";

import { routes } from "@/constants/routes";

const recentActivity = [
  {
    type: "post",
    title: "Published new post",
    description: "Latest content synced from admin API",
    time: "Just now",
  },
  {
    type: "comment",
    title: "New comment",
    description: "Comments are still running on demo data",
    time: "Demo",
  },
];

export default function AdminDashboard() {
  const { data: blogsData } = useSWR<{ items: AdminBlog[] }>(
    "/api/admin/blogs?pageSize=100&sortBy=updatedAt&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const { data: categoriesData } = useSWR<{ items: AdminCategory[] }>(
    "/api/admin/categories?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const blogs = blogsData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const publishedPosts = blogs.filter((blog) => blog.published);

  const stats = [
    {
      title: "Total Posts",
      value: blogs.length.toString(),
      change: `${publishedPosts.length} published`,
      trend: "up" as const,
      icon: FileText,
    },
    {
      title: "Featured Posts",
      value: blogs.filter((blog) => blog.featured).length.toString(),
      change: "curated on homepage",
      trend: "up" as const,
      icon: Eye,
    },
    {
      title: "Comments",
      value: "142",
      change: "demo data",
      trend: "up" as const,
      icon: MessageSquare,
    },
    {
      title: "Categories",
      value: categories.length.toString(),
      change: "managed via API",
      trend: "down" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your content and admin data sources.
          </p>
        </div>
        <Button asChild>
          <Link href={routes.admin.postsNew}>New Post</Link>
        </Button>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Posts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={routes.admin.posts}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blogs.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{post.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{post.publishedAt ? "Published" : "Draft"}</span>
                      <span>·</span>
                      <span>{post.readTimeMinutes} min read</span>
                    </div>
                  </div>
                  {post.category && (
                    <Badge variant="secondary">{post.category.name}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {activity.type === "post" && (
                        <FileText className="h-4 w-4" />
                      )}
                      {activity.type === "comment" && (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    {index !== recentActivity.length - 1 && (
                      <div className="absolute top-8 left-4 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts by Category</CardTitle>
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
