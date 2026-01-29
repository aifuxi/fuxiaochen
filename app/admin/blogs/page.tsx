"use client";

import { useState } from "react";

import Link from "next/link";

import { useRequest } from "ahooks";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CyberContainer } from "@/components/admin/cyber-container";

import { api } from "@/lib/api-client";

interface Blog {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  publishedAt: string;
  category: { name: string };
  tags: { name: string }[];
}

interface ListResponse {
  list: Blog[];
  total: number;
  page: number;
  pageSize: number;
}

export default function BlogsPage() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data,
    loading,
    run: fetchList,
  } = useRequest(
    () =>
      api.get<ListResponse>("/blogs", { params: { keyword, page, pageSize } }),
    {
      refreshDeps: [page, pageSize],
      onError: (error) => toast.error(error.message),
    },
  );

  const { run: remove } = useRequest((id) => api.delete(`/blogs/${id}`), {
    manual: true,
    onSuccess: () => {
      toast.success("Blog deleted successfully");
      fetchList();
    },
  });

  const { run: togglePublished } = useRequest(
    (id, published) => api.patch(`/blogs/${id}/published`, { published }),
    {
      manual: true,
      onSuccess: () => {
        toast.success("Status updated");
        fetchList();
      },
    },
  );

  const { run: toggleFeatured } = useRequest(
    (id, featured) => api.patch(`/blogs/${id}/featured`, { featured }),
    {
      manual: true,
      onSuccess: () => {
        toast.success("Featured status updated");
        fetchList();
      },
    },
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      remove(id);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchList();
  };

  return (
    <CyberContainer
      title="BLOGS_DATABASE"
      action={
        <Link href="/admin/blogs/create">
          <Button
            className={`
              border border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan
              hover:bg-neon-cyan/20 hover:text-white
            `}
          >
            <Plus className="mr-2 h-4 w-4" /> NEW_ENTRY
          </Button>
        </Link>
      }
    >
      <div className="border-b border-white/5 bg-white/5 p-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search database..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={`
                border-white/10 bg-black/50 pl-9 text-gray-300
                focus:border-neon-cyan/50 focus:ring-neon-cyan/20
              `}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            variant="outline"
            onClick={handleSearch}
            className={`
              border-white/10 bg-white/5 text-gray-300
              hover:bg-white/10
            `}
          >
            SEARCH
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-white/5">
          <TableRow
            className={`
              border-b border-white/10
              hover:bg-transparent
            `}
          >
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Title
            </TableHead>
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Category
            </TableHead>
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Tags
            </TableHead>
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Published
            </TableHead>
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Featured
            </TableHead>
            <TableHead className="text-right font-display tracking-wider text-neon-cyan uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center font-mono text-gray-500"
              >
                INITIALIZING...
              </TableCell>
            </TableRow>
          ) : data?.list?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center font-mono text-gray-500"
              >
                NO_DATA_FOUND
              </TableCell>
            </TableRow>
          ) : (
            data?.list?.map((blog) => (
              <TableRow
                key={blog.id}
                className={`
                  group border-b border-white/10 transition-colors
                  hover:bg-neon-cyan/5
                  data-[state=selected]:bg-white/5
                `}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span
                      className={`
                        text-gray-200 transition-colors
                        group-hover:text-neon-cyan
                      `}
                    >
                      {blog.title}
                    </span>
                    <span
                      className={`
                        font-mono text-xs text-gray-600
                        group-hover:text-gray-400
                      `}
                    >
                      {blog.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-400">
                  {blog.category?.name || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {blog.tags?.map((tag: any) => (
                      <Badge
                        key={tag.name}
                        variant="outline"
                        className={`
                          rounded-sm border-neon-purple/30 bg-neon-purple/5 font-mono text-[10px] text-neon-purple
                        `}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={blog.published}
                    onCheckedChange={(checked) =>
                      togglePublished(blog.id, checked)
                    }
                    className={`
                      data-[state=checked]:bg-neon-green
                      data-[state=unchecked]:bg-gray-700
                    `}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={blog.featured}
                    onCheckedChange={(checked) =>
                      toggleFeatured(blog.id, checked)
                    }
                    className={`
                      data-[state=checked]:bg-neon-magenta
                      data-[state=unchecked]:bg-gray-700
                    `}
                  />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Link href={`/admin/blogs/${blog.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`
                        text-gray-400
                        hover:bg-white/5 hover:text-neon-cyan
                      `}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`
                      text-gray-400
                      hover:bg-white/5 hover:text-red-500
                    `}
                    onClick={() => handleDelete(blog.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {data && data.total > pageSize && (
        <div className="flex items-center justify-end space-x-2 border-t border-white/10 bg-white/5 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className={`
              border-white/10 bg-transparent text-gray-400
              hover:border-neon-cyan/50 hover:text-neon-cyan
            `}
          >
            PREV
          </Button>
          <span className="font-mono text-xs text-gray-500">PAGE {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page * pageSize >= data.total}
            className={`
              border-white/10 bg-transparent text-gray-400
              hover:border-neon-cyan/50 hover:text-neon-cyan
            `}
          >
            NEXT
          </Button>
        </div>
      )}
    </CyberContainer>
  );
}
