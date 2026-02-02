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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      color: "text-neon-cyan",
    },
    {
      title: "分类总数",
      value: categoryCount,
      icon: FolderTree,
      href: "/admin/categories",
      color: "text-neon-purple",
    },
    {
      title: "标签总数",
      value: tagCount,
      icon: TagIcon,
      href: "/admin/tags",
      color: "text-neon-magenta",
    },
    {
      title: "用户总数",
      value: userCount,
      icon: Users,
      href: "/admin/users",
      color: "text-green-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-wider text-neon-cyan uppercase">
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
            <Card
              className={`
                border-white/10 bg-black/40 transition-all duration-300
                hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]
              `}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
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
                <div
                  className={`
                    text-2xl font-bold
                    ${stat.color}
                  `}
                >
                  {stat.value}
                </div>
                {stat.description && (
                  <p className="text-xs text-gray-500">{stat.description}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">最新文章</h3>
          <Link href="/admin/blogs">
            <Button
              variant="ghost"
              size="sm"
              className={`
                text-neon-cyan
                hover:bg-neon-cyan/10 hover:text-neon-cyan
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
                border-white/10
                hover:bg-white/5
              `}
            >
              <TableHead className="text-neon-purple">标题</TableHead>
              <TableHead className="text-neon-purple">分类</TableHead>
              <TableHead className="text-neon-purple">标签</TableHead>
              <TableHead className="text-neon-purple">发布状态</TableHead>
              <TableHead className="text-right text-neon-purple">
                创建时间
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBlogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-gray-500"
                >
                  暂无文章
                </TableCell>
              </TableRow>
            ) : (
              recentBlogs.map((blog) => (
                <TableRow
                  key={blog.id}
                  className={`
                    border-white/10
                    hover:bg-white/5
                  `}
                >
                  <TableCell className="font-medium text-white">
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    {blog.category ? (
                      <Badge
                        variant="outline"
                        className="border-neon-purple text-neon-purple"
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
                              className="bg-white/10 text-xs"
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
                            bg-neon-cyan/20 text-neon-cyan
                            hover:bg-neon-cyan/30
                          `
                          : "bg-gray-800 text-gray-400"
                      }
                    >
                      {blog.published ? "已发布" : "草稿"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gray-400">
                    {format(new Date(blog.createdAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
