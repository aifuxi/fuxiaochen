"use client";

import { useState } from "react";

import Link from "next/link";

import { ExternalLink, Pencil, Plus, Trash2, User } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminFriend } from "@/lib/server/friends/mappers";

type FriendFormState = {
  name: string;
  url: string;
  avatar: string;
  description: string;
  category: AdminFriend["category"];
};

const DEFAULT_FORM_STATE: FriendFormState = {
  name: "",
  url: "",
  avatar: "",
  description: "",
  category: "developer",
};

const friendCategoryLabel: Record<AdminFriend["category"], string> = {
  developer: "开发者",
  designer: "设计师",
  blogger: "博主",
  creator: "创作者",
};

function getCategoryBadge(category: AdminFriend["category"]) {
  const styles = {
    developer: "bg-blue-500/10 text-blue-600",
    designer: "bg-purple-500/10 text-purple-600",
    blogger: "bg-green-500/10 text-green-600",
    creator: "bg-orange-500/10 text-orange-600",
  };

  return (
    <Badge variant="secondary" className={styles[category]}>
      {friendCategoryLabel[category]}
    </Badge>
  );
}

export default function AdminFriendsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFriendId, setEditingFriendId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FriendFormState>(DEFAULT_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingFriendId, setDeletingFriendId] = useState<string | null>(null);

  const { data, mutate } = useSWR<{ items: AdminFriend[] }>(
    "/api/admin/friends?pageSize=100&sortBy=updatedAt&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const friends = data?.items ?? [];
  const stats = {
    total: friends.length,
    developers: friends.filter((friend) => friend.category === "developer")
      .length,
    designers: friends.filter((friend) => friend.category === "designer")
      .length,
    creators: friends.filter((friend) => friend.category === "creator").length,
  };

  const resetForm = () => {
    setEditingFriendId(null);
    setFormData(DEFAULT_FORM_STATE);
    setFormError(null);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open) {
      resetForm();
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (friend: AdminFriend) => {
    setEditingFriendId(friend.id);
    setFormData({
      name: friend.name,
      url: friend.url,
      avatar: friend.avatar,
      description: friend.description,
      category: friend.category,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const submitFriend = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      await apiRequest(
        editingFriendId
          ? `/api/admin/friends/${editingFriendId}`
          : "/api/admin/friends",
        {
          method: editingFriendId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          toastOnError: false,
        },
      );
      await mutate();
      handleDialogChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "保存失败，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFriend = async (id: string) => {
    setDeletingFriendId(id);

    try {
      await apiRequest(`/api/admin/friends/${id}`, {
        method: "DELETE",
      });
      await mutate();
    } catch {
      // The global API error listener owns toast display.
    } finally {
      setDeletingFriendId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">友链</h1>
          <p className="text-muted-foreground">
            管理你的友情链接与外部合作人。
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          添加友链
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFriendId ? "编辑友链" : "新增友链"}
            </DialogTitle>
            <DialogDescription>
              {editingFriendId
                ? "更新现有友链信息。"
                : "添加一条新的友情链接。"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">名称</label>
                <Input
                  placeholder="张三"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">分类</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      category: value as AdminFriend["category"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">开发者</SelectItem>
                    <SelectItem value="designer">设计师</SelectItem>
                    <SelectItem value="blogger">博主</SelectItem>
                    <SelectItem value="creator">创作者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">网址</label>
              <Input
                placeholder="https://example.com"
                value={formData.url}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                头像链接
              </label>
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    avatar: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">简介</label>
              <Textarea
                placeholder="一句简短的个人介绍..."
                rows={2}
                value={formData.description}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button disabled={isSubmitting} onClick={submitFriend}>
              {editingFriendId ? "保存更改" : "添加友链"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">开发者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.developers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">设计师</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.designers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">创作者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.creators}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全部友链</CardTitle>
          <CardDescription>管理你的友链列表</CardDescription>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              暂无友链，先添加一个友链开始整理你的伙伴列表。
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="size-12 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {friend.name}
                      </span>
                      {getCategoryBadge(friend.category)}
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                      {friend.description}
                    </p>
                    <Link
                      href={friend.url}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {friend.url.replace(/^https?:\/\//, "")}
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(friend)}
                      disabled={isSubmitting}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteFriend(friend.id)}
                      disabled={deletingFriendId === friend.id}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
