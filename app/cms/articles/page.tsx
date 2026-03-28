"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input, InputWrapper, InputIcon } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  status: "published" | "draft" | "archived";
  date: string;
}

const articlesData: Article[] = [
  {
    id: 1,
    title: "Building Scalable Design Systems with CSS Custom Properties",
    excerpt:
      "Exploring how to create maintainable design tokens that bridge design and development...",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=96&h=72&fit=crop",
    category: "Design",
    status: "published",
    date: "Dec 15, 2024",
  },
  {
    id: 2,
    title: "Advanced React Patterns for Modern Applications",
    excerpt:
      "Deep dive into compound components, render props, and hooks for building flexible UIs...",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=96&h=72&fit=crop",
    category: "Technology",
    status: "published",
    date: "Dec 12, 2024",
  },
  {
    id: 3,
    title: "The Art of Typography in Digital Design",
    excerpt:
      "How classical typography principles can elevate modern web interfaces...",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=96&h=72&fit=crop",
    category: "Design",
    status: "published",
    date: "Dec 10, 2024",
  },
  {
    id: 4,
    title: "Understanding Event Loop in JavaScript",
    excerpt:
      "A deep exploration of how JavaScript handles asynchronous operations...",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=96&h=72&fit=crop",
    category: "Technology",
    status: "draft",
    date: "Dec 8, 2024",
  },
  {
    id: 5,
    title: "CSS Grid vs Flexbox: When to Use Which",
    excerpt:
      "Practical guide to choosing the right layout tool for your next web project...",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=96&h=72&fit=crop",
    category: "Technology",
    status: "published",
    date: "Dec 5, 2024",
  },
  {
    id: 6,
    title: "Modern Dark Mode Implementation Strategies",
    excerpt:
      "Best practices for implementing accessible and visually appealing dark themes...",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=96&h=72&fit=crop",
    category: "Design",
    status: "published",
    date: "Dec 3, 2024",
  },
  {
    id: 7,
    title: "TypeScript Best Practices for Large Scale Applications",
    excerpt:
      "Essential patterns and practices for maintainable TypeScript codebases...",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=96&h=72&fit=crop",
    category: "Technology",
    status: "draft",
    date: "Nov 30, 2024",
  },
  {
    id: 8,
    title: "Optimizing React Application Performance",
    excerpt:
      "Practical techniques to improve rendering performance and reduce load times...",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=96&h=72&fit=crop",
    category: "Technology",
    status: "archived",
    date: "Nov 28, 2024",
  },
  {
    id: 9,
    title: "The Complete Guide to CSS Custom Properties",
    excerpt:
      "Mastering CSS variables for creating scalable, maintainable, and themeable stylesheets...",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=96&h=72&fit=crop",
    category: "Technology",
    status: "published",
    date: "Nov 25, 2024",
  },
  {
    id: 10,
    title: "Building Accessible Web Applications",
    excerpt:
      "A comprehensive guide to WCAG compliance, screen readers, and inclusive design...",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=96&h=72&fit=crop",
    category: "Design",
    status: "published",
    date: "Nov 22, 2024",
  },
];

const statusVariant = {
  published: "primary" as const,
  draft: "warning" as const,
  archived: "secondary" as const,
};

export default function ArticlesPage() {
  const [articles, setArticles] = React.useState<Article[]>(articlesData);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [articleToDelete, setArticleToDelete] = React.useState<Article | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredArticles = React.useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        searchQuery === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || article.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, searchQuery, categoryFilter, statusFilter]);

  const allSelected =
    filteredArticles.length > 0 &&
    filteredArticles.every((a) => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredArticles.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredArticles.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(articleToDelete.id);
        return next;
      });
    }
    setDeleteModalOpen(false);
    setArticleToDelete(null);
  };

  return (
    <div>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
            Articles
          </h1>
          <p className="text-muted">Manage your blog articles and content</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <InputWrapper className="w-64">
          <InputIcon>
            <Search className="h-4 w-4" />
          </InputIcon>
          <Input
            variant="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputWrapper>

        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value || "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value || "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow
                    key={article.id}
                    className={cn(
                      "h-16",
                      selectedIds.has(article.id) && "bg-primary/5",
                    )}
                  >
                    <TableCell className="w-10">
                      <Checkbox
                        checked={selectedIds.has(article.id)}
                        onCheckedChange={() => toggleSelect(article.id)}
                      />
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.image}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {article.title}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {article.excerpt}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-32">
                      <span className="text-sm text-muted">
                        {article.category}
                      </span>
                    </TableCell>
                    <TableCell className="w-32">
                      <Badge variant={statusVariant[article.status]}>
                        {article.status === "published" && "● "}
                        {article.status === "draft" && "○ "}
                        {article.status.charAt(0).toUpperCase() +
                          article.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-28">
                      <span className="text-sm text-muted">{article.date}</span>
                    </TableCell>
                    <TableCell className="w-20">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={`
                            text-muted
                            hover:text-foreground
                          `}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={`
                            text-muted
                            hover:text-destructive
                          `}
                          onClick={() => handleDelete(article)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 flex items-center justify-between"
      >
        <p className="text-sm text-muted">
          Showing <strong>1-{filteredArticles.length}</strong> of{" "}
          <strong>{filteredArticles.length}</strong> articles
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>5</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {articleToDelete && (
            <div className="rounded-lg bg-secondary p-3">
              <p className="font-medium text-foreground">
                &quot;{articleToDelete.title}&quot;
              </p>
            </div>
          )}
          <DialogFooter
            className={`
              gap-2
              sm:gap-0
            `}
          >
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
