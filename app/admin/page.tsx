import Link from "next/link";

import {
  FileText,
  Eye,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { blogPosts } from "@/lib/blog-data";

const stats = [
  {
    title: "Total Posts",
    value: blogPosts.length.toString(),
    change: "+2",
    trend: "up",
    icon: FileText,
  },
  {
    title: "Total Views",
    value: "24.5K",
    change: "+12%",
    trend: "up",
    icon: Eye,
  },
  {
    title: "Comments",
    value: "142",
    change: "+8",
    trend: "up",
    icon: MessageSquare,
  },
  {
    title: "Engagement",
    value: "4.2%",
    change: "-0.3%",
    trend: "down",
    icon: TrendingUp,
  },
];

const recentActivity = [
  {
    type: "post",
    title: "Published new post",
    description: "Building a Design System from Scratch",
    time: "2 hours ago",
  },
  {
    type: "comment",
    title: "New comment",
    description: "Great article! Very helpful.",
    time: "4 hours ago",
  },
  {
    type: "subscriber",
    title: "New subscriber",
    description: "john@example.com joined the newsletter",
    time: "6 hours ago",
  },
  {
    type: "post",
    title: "Post updated",
    description: "React Server Components Explained",
    time: "1 day ago",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your blog.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">New Post</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="text-muted-foreground h-4 w-4" />
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
                <span className="text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Posts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blogPosts.slice(0, 5).map((post) => (
                <div
                  key={post.slug}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/posts/${post.slug}`}
                      className="font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative">
                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                      {activity.type === "post" && (
                        <FileText className="h-4 w-4" />
                      )}
                      {activity.type === "comment" && (
                        <MessageSquare className="h-4 w-4" />
                      )}
                      {activity.type === "subscriber" && (
                        <TrendingUp className="h-4 w-4" />
                      )}
                    </div>
                    {index !== recentActivity.length - 1 && (
                      <div className="bg-border absolute top-8 left-4 h-full w-px" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {activity.description}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Posts by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...new Set(blogPosts.map((p) => p.category))].map((category) => {
              const count = blogPosts.filter(
                (p) => p.category === category,
              ).length;
              return (
                <div
                  key={category}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <span className="font-medium">{category}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
