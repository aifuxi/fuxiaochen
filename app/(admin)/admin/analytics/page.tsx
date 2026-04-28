"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Activity,
  BookOpen,
  Eye,
  FolderOpen,
  Heart,
  type LucideIcon,
  MessageSquare,
  Tags,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { buildApiUrl, fetchApiData } from "@/lib/api/fetcher";
import type { AdminAnalyticsSnapshot } from "@/lib/server/analytics/mappers";

import { routes } from "@/constants/routes";

type AnalyticsRange = "7" | "30" | "90" | "365";

const rangeOptions: Array<{ label: string; value: AnalyticsRange }> = [
  { label: "近 7 天", value: "7" },
  { label: "近 30 天", value: "30" },
  { label: "近 90 天", value: "90" },
  { label: "近 365 天", value: "365" },
];

const trendChartConfig = {
  views: {
    label: "浏览",
    color: "var(--chart-2)",
  },
  likes: {
    label: "点赞",
    color: "var(--chart-1)",
  },
  comments: {
    label: "评论",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const distributionChartConfig = {
  total: {
    label: "文章",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const numberFormatter = new Intl.NumberFormat("zh-CN");
const compactFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 1,
  notation: "compact",
});
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
});
const activityDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
});

const formatNumber = (value: number) => numberFormatter.format(value);
const formatCompactNumber = (value: number) => compactFormatter.format(value);
const formatDateLabel = (date: string) =>
  dateFormatter.format(new Date(`${date}T00:00:00`));
const formatActivityDate = (date: string | Date) =>
  activityDateFormatter.format(new Date(date));

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

const getCommentStatusLabel = (
  status: AdminAnalyticsSnapshot["commentStatuses"][number]["status"],
) => {
  switch (status) {
    case "pending":
      return "待审核";
    case "approved":
      return "已通过";
    case "spam":
      return "垃圾";
  }
};

function TrendChartSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-44" />
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
        <div className="relative h-[320px] w-full overflow-hidden rounded-md border bg-muted/20 p-4">
          <div className="absolute inset-x-4 top-8 h-px bg-border/70" />
          <div className="absolute inset-x-4 top-24 h-px bg-border/70" />
          <div className="absolute inset-x-4 top-40 h-px bg-border/70" />
          <div className="absolute inset-x-4 top-56 h-px bg-border/70" />
          <div className="absolute inset-x-4 bottom-10 h-px bg-border" />
          <div className="absolute inset-y-4 left-12 w-px bg-border" />
          <div className="absolute right-4 bottom-10 left-12 flex h-48 items-end justify-between gap-2">
            {[42, 58, 48, 72, 64, 86, 78, 92, 68, 84, 76, 96].map(
              (height, index) => (
                <Skeleton
                  key={index}
                  className="w-full rounded-t-sm"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
          <div className="absolute right-4 bottom-3 left-12 flex justify-between">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionChartSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <div className="h-[320px] rounded-md border bg-muted/20 p-5">
          <div className="flex h-full flex-col justify-between">
            {[82, 68, 56, 44, 32, 24].map((width, index) => (
              <div key={index} className="grid grid-cols-[72px_1fr] gap-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-3">
                  <Skeleton
                    className="h-7 rounded-sm"
                    style={{ width: `${width}%` }}
                  />
                  <Skeleton className="h-4 w-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <TrendChartSkeleton />
        <DistributionChartSkeleton />
      </div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Empty className="min-h-[260px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("30");
  const analyticsUrl = buildApiUrl("/api/admin/analytics", { range });
  const { data, error, isLoading } = useSWR<AdminAnalyticsSnapshot>(
    analyticsUrl,
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const daily = data?.daily ?? [];
  const hasTrendData = daily.some(
    (item) => item.views > 0 || item.likes > 0 || item.comments > 0,
  );
  const categoryChartData =
    data?.categories
      .filter((category) => category.total > 0)
      .slice(0, 6)
      .map((category) => ({
        name: category.name,
        total: category.total,
      })) ?? [];

  const cards = data
    ? [
        {
          title: "内容总量",
          value: data.overview.posts.total,
          description: `${data.overview.posts.published} 篇已发布，${data.overview.posts.drafts} 篇草稿`,
          icon: BookOpen,
        },
        {
          title: "区间浏览",
          value: data.overview.interactions.views,
          description: `近 ${data.range} 天记录的文章浏览`,
          icon: Eye,
        },
        {
          title: "评论",
          value: data.overview.interactions.comments,
          description: `${data.overview.interactions.pendingComments} 条待审核`,
          icon: MessageSquare,
        },
        {
          title: "点赞",
          value: data.overview.interactions.likes,
          description: `${data.overview.interactions.unlikes} 次取消点赞`,
          icon: Heart,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">数据分析</h1>
          <p className="text-muted-foreground">
            基于站内内容、评论和文章互动统计的运营视图。
          </p>
        </div>
        <Select
          value={range}
          onValueChange={(value) => setRange(value as AnalyticsRange)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="统计范围" />
          </SelectTrigger>
          <SelectContent>
            {rangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <AnalyticsSkeleton /> : null}

      {error ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>数据加载失败</CardTitle>
            <CardDescription>
              当前无法读取站内分析数据，请稍后重试。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {data && !isLoading ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.title} className="min-w-0">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                  <card.icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {formatNumber(card.value)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>趋势</CardTitle>
                <CardDescription>
                  浏览、点赞与评论按自然日汇总。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasTrendData ? (
                  <ChartContainer
                    config={trendChartConfig}
                    className="h-[320px] w-full"
                  >
                    <AreaChart
                      accessibilityLayer
                      data={daily.map((item) => ({
                        ...item,
                        label: formatDateLabel(item.date),
                      }))}
                      margin={{ top: 12, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={28}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        dataKey="views"
                        type="monotone"
                        fill="var(--color-views)"
                        fillOpacity={0.14}
                        stroke="var(--color-views)"
                        strokeWidth={2}
                      />
                      <Area
                        dataKey="likes"
                        type="monotone"
                        fill="var(--color-likes)"
                        fillOpacity={0.1}
                        stroke="var(--color-likes)"
                        strokeWidth={2}
                      />
                      <Area
                        dataKey="comments"
                        type="monotone"
                        fill="var(--color-comments)"
                        fillOpacity={0.08}
                        stroke="var(--color-comments)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <EmptyPanel
                    icon={Activity}
                    title="暂无趋势数据"
                    description="新的浏览、点赞和评论会从现在开始沉淀到日统计中。"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>分类分布</CardTitle>
                <CardDescription>按文章数量排序的分类占比。</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryChartData.length > 0 ? (
                  <ChartContainer
                    config={distributionChartConfig}
                    className="h-[320px] w-full"
                  >
                    <BarChart
                      accessibilityLayer
                      data={categoryChartData}
                      layout="vertical"
                      margin={{ top: 8, right: 36, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <XAxis dataKey="total" type="number" hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={4}>
                        <LabelList
                          dataKey="total"
                          position="insideRight"
                          className="fill-primary-foreground"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <EmptyPanel
                    icon={FolderOpen}
                    title="暂无分类数据"
                    description="创建分类并关联文章后，这里会显示内容分布。"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="min-w-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>热门文章</CardTitle>
                  <CardDescription>
                    按所选时间范围内的浏览与点赞排序。
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={routes.admin.posts}>文章管理</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                  <Table className="min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>文章</TableHead>
                        <TableHead className="w-20 text-right">浏览</TableHead>
                        <TableHead className="w-20 text-right">点赞</TableHead>
                        <TableHead className="w-20 text-right">评论</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topPosts.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-8 text-center text-muted-foreground"
                          >
                            暂无文章数据。
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.topPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {post.title}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge
                                    variant={
                                      post.published ? "default" : "secondary"
                                    }
                                  >
                                    {post.published ? "已发布" : "草稿"}
                                  </Badge>
                                  <span className="truncate text-xs text-muted-foreground">
                                    {post.slug}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCompactNumber(post.viewCount)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCompactNumber(post.likeCount)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCompactNumber(post.commentCount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>评论状态</CardTitle>
                <CardDescription>评论审核队列的当前分布。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.commentStatuses.map((status) => {
                    const total = Math.max(
                      data.overview.interactions.comments,
                      1,
                    );
                    const ratio = Math.round((status.total / total) * 100);

                    return (
                      <div key={status.status} className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {getCommentStatusLabel(status.status)}
                          </span>
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {formatNumber(status.total)} 条
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>标签使用</CardTitle>
                <CardDescription>按关联文章数量排序。</CardDescription>
              </CardHeader>
              <CardContent>
                {data.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="gap-2 py-1.5"
                      >
                        <Tags className="size-3" />
                        {tag.name}
                        <span className="font-mono text-xs">{tag.total}</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel
                    icon={Tags}
                    title="暂无标签数据"
                    description="为文章添加标签后，这里会展示使用频率。"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>最近动态</CardTitle>
                <CardDescription>来自内容、评论和更新日志。</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {data.recentActivity.map((activity) => (
                      <div
                        key={`${activity.type}-${activity.id}`}
                        className="flex gap-3"
                      >
                        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Activity className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-medium">
                              {activity.title}
                            </p>
                            <Badge variant="outline">
                              {getActivityLabel(activity.type)}
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatActivityDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel
                    icon={Activity}
                    title="暂无动态"
                    description="创建内容或收到评论后，这里会显示最近变化。"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
