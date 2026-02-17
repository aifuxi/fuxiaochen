import Link from "next/link";
import {
  ArrowRight,
  FileText,
  FolderTree,
  Tag as TagIcon,
  Users,
} from "lucide-react";
import { getDashboardStatsAction } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppleCard } from "@/components/ui/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSimpleDateWithTime } from "@/lib/time";

export default async function DashboardPage() {
  const { data, success } = await getDashboardStatsAction();

  if (!success || !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        加载仪表盘数据失败
      </div>
    );
  }

  const {
    blogCount,
    publishedBlogCount,
    categoryCount,
    tagCount,
    userCount,
    recentBlogs,
  } = data;

  const stats = [
    {
      title: "总文章数",
      value: blogCount,
      icon: FileText,
      description: `已发布: ${publishedBlogCount}`,
      href: "/admin/blogs",
      color: "text-blue-500",
    },
    {
      title: "分类总数",
      value: categoryCount,
      icon: FolderTree,
      href: "/admin/categories",
      color: "text-purple-500",
    },
    {
      title: "标签总数",
      value: tagCount,
      icon: TagIcon,
      href: "/admin/tags",
      color: "text-pink-500",
    },
    {
      title: "用户总数",
      value: userCount,
      icon: Users,
      href: "/admin/users",
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-text uppercase">
          仪表盘
        </h2>
      </div>

      <div
        className={`
          grid gap-6
          md:grid-cols-2
          lg:grid-cols-4
        `}
      >
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block h-full">
            <AppleCard
              className={`
                h-full transition-all duration-300
                hover:border-accent/50 hover:shadow-lg
              `}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  {stat.title}
                </CardTitle>
                <stat.icon
                  className={`
                    h-4 w-4
                    ${stat.color}
                  `}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text">{stat.value}</div>
                {stat.description && (
                  <p className="text-xs text-text-secondary">
                    {stat.description}
                  </p>
                )}
              </CardContent>
            </AppleCard>
          </Link>
        ))}
      </div>

      <AppleCard className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text">最新文章</h3>
          <Link href="/admin/blogs">
            <Button
              variant="ghost"
              size="sm"
              className={`
                text-accent
                hover:bg-accent/10 hover:text-accent
              `}
            >
              查看全部 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow
              className={`
                border-border
                hover:bg-surface/50
              `}
            >
              <TableHead className="text-text-secondary">标题</TableHead>
              <TableHead className="text-text-secondary">分类</TableHead>
              <TableHead className="text-text-secondary">标签</TableHead>
              <TableHead className="text-text-secondary">发布状态</TableHead>
              <TableHead className="text-right text-text-secondary">
                创建时间
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBlogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-text-secondary"
                >
                  暂无文章
                </TableCell>
              </TableRow>
            ) : (
              recentBlogs.map((blog) => (
                <TableRow
                  key={blog.id}
                  className={`
                    border-border
                    hover:bg-surface/50
                  `}
                >
                  <TableCell className="font-medium text-text">
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    {blog.category ? (
                      <Badge
                        variant="outline"
                        className="border-accent text-accent"
                      >
                        {blog.category.name}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags && blog.tags.length > 0
                        ? blog.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="bg-accent/10 text-xs text-accent"
                            >
                              {tag.name}
                            </Badge>
                          ))
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={blog.published ? "default" : "secondary"}
                      className={
                        blog.published
                          ? `
                            bg-accent/20 text-accent
                            hover:bg-accent/30
                          `
                          : "bg-surface text-text-secondary"
                      }
                    >
                      {blog.published ? "已发布" : "草稿"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {formatSimpleDateWithTime(new Date(blog.createdAt))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AppleCard>
    </div>
  );
}
