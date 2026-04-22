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

function getCategoryBadge(category: AdminFriend["category"]) {
  const styles = {
    developer: "bg-blue-500/10 text-blue-600",
    designer: "bg-purple-500/10 text-purple-600",
    blogger: "bg-green-500/10 text-green-600",
    creator: "bg-orange-500/10 text-orange-600",
  };

  return (
    <Badge variant="secondary" className={styles[category]}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
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
        },
      );
      await mutate();
      handleDialogChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save friend",
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
    } finally {
      setDeletingFriendId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Friends</h1>
          <p className="text-muted-foreground">
            Manage your friend links and connections
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Add Friend
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFriendId ? "Edit Friend Link" : "Add Friend Link"}
            </DialogTitle>
            <DialogDescription>
              {editingFriendId
                ? "Update an existing friend link."
                : "Add a new friend to your links page."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <Input
                  placeholder="John Doe"
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
                <label className="mb-1.5 block text-sm font-medium">
                  Category
                </label>
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
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="blogger">Blogger</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Website URL
              </label>
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
                Avatar URL
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
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <Textarea
                placeholder="Brief description of this person..."
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
              <p className="text-destructive text-sm">{formError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={submitFriend}>
              {editingFriendId ? "Save Changes" : "Add Friend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Developers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.developers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Designers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.designers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.creators}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Friends</CardTitle>
          <CardDescription>Manage your friend links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="border-border flex items-start gap-4 rounded-lg border p-4"
              >
                {friend.avatar ? (
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="size-12 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-muted flex size-12 flex-shrink-0 items-center justify-center rounded-full">
                    <User className="text-muted-foreground size-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-foreground font-medium">
                      {friend.name}
                    </span>
                    {getCategoryBadge(friend.category)}
                  </div>
                  <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                    {friend.description}
                  </p>
                  <Link
                    href={friend.url}
                    target="_blank"
                    className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
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
        </CardContent>
      </Card>
    </div>
  );
}
