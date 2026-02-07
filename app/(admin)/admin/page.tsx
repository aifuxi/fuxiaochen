import Link from "next/link";
import { format } from "date-fns";
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
import { GlassCard } from "@/components/ui/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] uppercase">
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
          <Link key={stat.title} href={stat.href}>
            <GlassCard
              className={`
                transition-all duration-300
                hover:border-[var(--accent-color)]/50 hover:shadow-lg
              `}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-color-secondary)]">
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
                <div className="text-2xl font-bold text-[var(--text-color)]">
                  {stat.value}
                </div>
                {stat.description && (
                  <p className="text-xs text-[var(--text-color-secondary)]">
                    {stat.description}
                  </p>
                )}
              </CardContent>
            </GlassCard>
          </Link>
        ))}
      </div>

      <GlassCard className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-color)]">
            最新文章
          </h3>
          <Link href="/admin/blogs">
            <Button
              variant="ghost"
              size="sm"
              className={`
                text-[var(--accent-color)]
                hover:bg-[var(--accent-color)]/10 hover:text-[var(--accent-color)]
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
                border-[var(--glass-border)]
                hover:bg-[var(--glass-bg)]/50
              `}
            >
              <TableHead className="text-[var(--text-color-secondary)]">
                标题
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                分类
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                标签
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                发布状态
              </TableHead>
              <TableHead className="text-right text-[var(--text-color-secondary)]">
                创建时间
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBlogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  暂无文章
                </TableCell>
              </TableRow>
            ) : (
              recentBlogs.map((blog) => (
                <TableRow
                  key={blog.id}
                  className={`
                    border-[var(--glass-border)]
                    hover:bg-[var(--glass-bg)]/50
                  `}
                >
                  <TableCell className="font-medium text-[var(--text-color)]">
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    {blog.category ? (
                      <Badge
                        variant="outline"
                        className="border-[var(--accent-color)] text-[var(--accent-color)]"
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
                              className="bg-[var(--accent-color)]/10 text-xs text-[var(--accent-color)]"
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
                            bg-[var(--accent-color)]/20 text-[var(--accent-color)]
                            hover:bg-[var(--accent-color)]/30
                          `
                          : "bg-[var(--glass-border)] text-[var(--text-color-secondary)]"
                      }
                    >
                      {blog.published ? "已发布" : "草稿"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-[var(--text-color-secondary)]">
                    {format(new Date(blog.createdAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}
