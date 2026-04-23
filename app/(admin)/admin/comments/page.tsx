"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Check,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  MoreHorizontal,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { apiRequest, buildApiUrl, fetchApiData } from "@/lib/api/fetcher";
import type { AdminComment } from "@/lib/server/comments/mappers";
import type { CommentStats } from "@/lib/server/comments/service";

const EMPTY_STATS: CommentStats = {
  total: 0,
  pending: 0,
  approved: 0,
  spam: 0,
};

export default function AdminCommentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [isMutating, setIsMutating] = useState(false);

  const commentsUrl = buildApiUrl("/api/admin/comments", {
    pageSize: 100,
    query: searchQuery.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const { data, mutate } = useSWR<{
    items: AdminComment[];
    stats: CommentStats;
  }>(commentsUrl, fetchApiData, {
    revalidateOnFocus: false,
  });

  const comments = data?.items ?? [];
  const stats = data?.stats ?? EMPTY_STATS;

  const toggleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map((comment) => comment.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedComments((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const updateCommentStatus = async (
    ids: string[],
    status: AdminComment["status"],
  ) => {
    if (ids.length === 0) {
      return;
    }

    setIsMutating(true);

    try {
      await Promise.all(
        ids.map((id) =>
          apiRequest(`/api/admin/comments/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status,
            }),
          }),
        ),
      );
      setSelectedComments((current) =>
        current.filter((id) => !ids.includes(id)),
      );
      await mutate();
    } finally {
      setIsMutating(false);
    }
  };

  const deleteComments = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setIsMutating(true);

    try {
      await Promise.all(
        ids.map((id) =>
          apiRequest(`/api/admin/comments/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      setSelectedComments((current) =>
        current.filter((id) => !ids.includes(id)),
      );
      await mutate();
    } finally {
      setIsMutating(false);
    }
  };

  const getStatusBadge = (status: AdminComment["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="default"
            className="bg-green-500/10 text-green-600 hover:bg-green-500/20"
          >
            <CheckCircle className="mr-1 size-3" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 size-3" />
            Pending
          </Badge>
        );
      case "spam":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 size-3" />
            Spam
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-2xl font-bold">Comments</h1>
        <p className="text-muted-foreground">
          Manage and moderate user comments
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Comments
            </CardTitle>
            <MessageSquare className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="size-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spam</CardTitle>
            <AlertTriangle className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.spam}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Comments</CardTitle>
          <CardDescription>
            Review, approve, or delete user comments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search comments..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedComments.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {selectedComments.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() =>
                    updateCommentStatus(selectedComments, "approved")
                  }
                >
                  <Check className="mr-1 size-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() => updateCommentStatus(selectedComments, "spam")}
                >
                  <X className="mr-1 size-3" />
                  Spam
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isMutating}
                  onClick={() => deleteComments(selectedComments)}
                >
                  <Trash2 className="mr-1 size-3" />
                  Delete
                </Button>
              </div>
            ) : null}
          </div>

          <div className="border-border rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        comments.length > 0 &&
                        selectedComments.length === comments.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="max-w-md">Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No comments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedComments.includes(comment.id)}
                          onCheckedChange={() => toggleSelect(comment.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {comment.avatar ? (
                            <img
                              src={comment.avatar}
                              alt={comment.author}
                              className="size-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                              <User className="text-muted-foreground size-4" />
                            </div>
                          )}
                          <div>
                            <p className="text-foreground font-medium">
                              {comment.author}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {comment.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {comment.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        {comment.blog ? (
                          <Link
                            href={`/blog/${comment.blog.slug}`}
                            className="text-primary flex items-center gap-1 text-sm hover:underline"
                            target="_blank"
                          >
                            <span className="line-clamp-1 max-w-[150px]">
                              {comment.blog.title}
                            </span>
                            <ExternalLink className="size-3" />
                          </Link>
                        ) : null}
                      </TableCell>
                      <TableCell>{getStatusBadge(comment.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                updateCommentStatus([comment.id], "approved")
                              }
                            >
                              <Check className="mr-2 size-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateCommentStatus([comment.id], "spam")
                              }
                            >
                              <X className="mr-2 size-4" />
                              Mark as Spam
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteComments([comment.id])}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
