"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Eye,
  MessageCircle,
  Tag,
  Clock,
  PenSquare,
  Send,
  Save,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { ArticleItem } from "@/components/dashboard/article-item";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";

const statsData = [
  {
    icon: FileText,
    iconColor: "articles" as const,
    value: "42",
    label: "Total Articles",
    trend: "12%",
    trendDirection: "up" as const,
  },
  {
    icon: Eye,
    iconColor: "views" as const,
    value: "12.4k",
    label: "Total Views",
    trend: "28%",
    trendDirection: "up" as const,
  },
  {
    icon: MessageCircle,
    iconColor: "comments" as const,
    value: "89",
    label: "Comments",
    trend: "5%",
    trendDirection: "down" as const,
  },
  {
    icon: Tag,
    iconColor: "tags" as const,
    value: "156",
    label: "Subscribers",
    trend: "3",
    trendDirection: "up" as const,
  },
];

const recentArticles = [
  {
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=128&h=96&fit=crop",
    title: "Building Scalable Design Systems with CSS Custom Properties",
    date: "Dec 15, 2024",
    views: "2.1k",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=128&h=96&fit=crop",
    title: "Advanced React Patterns for Modern Applications",
    date: "Dec 12, 2024",
    views: "1.8k",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=128&h=96&fit=crop",
    title: "The Art of Typography in Digital Design",
    date: "Dec 10, 2024",
    views: "1.5k",
  },
  {
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=128&h=96&fit=crop",
    title: "Understanding Event Loop in JavaScript",
    date: "Dec 8, 2024",
    views: "1.2k",
  },
];

const activities = [
  {
    avatar: "",
    avatarInitials: "JD",
    avatarColor: "john" as const,
    content: (
      <>
        <p className="text-sm text-foreground">
          <strong>John Doe</strong> commented on{" "}
          <strong>&quot;Building Scalable Design Systems&quot;</strong>
        </p>
        <p className="mt-1 text-sm text-muted">
          &quot;Great article! The section on CSS variables was particularly
          helpful...&quot;
        </p>
      </>
    ),
    time: "2 hours ago",
    showApprove: true,
    showReply: true,
    showUser: false,
  },
  {
    avatar: "",
    avatarInitials: "SM",
    avatarColor: "sarah" as const,
    content: (
      <>
        <p className="text-sm text-foreground">
          <strong>Sarah Miller</strong> commented on{" "}
          <strong>&quot;Advanced React Patterns&quot;</strong>
        </p>
        <p className="mt-1 text-sm text-muted">
          &quot;Could you elaborate more on the compound components
          pattern?...&quot;
        </p>
      </>
    ),
    time: "4 hours ago",
    showApprove: true,
    showReply: true,
    showUser: false,
  },
  {
    avatar: "",
    avatarInitials: "MW",
    avatarColor: "mike" as const,
    content: (
      <p className="text-sm text-foreground">
        <strong>Mike Wilson</strong> subscribed to your newsletter
      </p>
    ),
    time: "6 hours ago",
    showApprove: false,
    showReply: false,
    showUser: true,
  },
  {
    avatar: "",
    avatarInitials: "JD",
    avatarColor: "john" as const,
    content: (
      <>
        <p className="text-sm text-foreground">
          <strong>John Doe</strong> commented on{" "}
          <strong>&quot;The Art of Typography&quot;</strong>
        </p>
        <p className="mt-1 text-sm text-muted">
          &quot;Beautiful examples! Do you have a follow-up on font
          pairing?&quot;
        </p>
      </>
    ),
    time: "1 day ago",
    showApprove: true,
    showReply: true,
    showUser: false,
  },
];

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Main Content */}
      <main className="mt-18 ml-65 p-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted">
            Welcome back, Sarah. Here&apos;s what&apos;s happening with your
            blog.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-4 gap-6">
          {statsData.map((stat) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="mb-8 grid grid-cols-3 gap-6">
          {/* Recent Articles */}
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-muted" />
                Recent Articles
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentArticles.map((article) => (
                  <ArticleItem key={article.title} {...article} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Draft */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PenSquare className="h-5 w-5 text-muted" />
                Quick Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Title
                  </label>
                  <Input placeholder="Enter article title..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Content
                  </label>
                  <Textarea
                    placeholder="Write your thoughts..."
                    className="min-h-25"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4" />
                    Publish
                  </Button>
                  <Button type="button" variant="secondary" className="w-full">
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-muted" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {activities.map((activity) => (
                <ActivityItem key={activity.time} {...activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className={`
            fixed inset-0 z-99 bg-black/50 backdrop-blur-sm
            lg:hidden
          `}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
