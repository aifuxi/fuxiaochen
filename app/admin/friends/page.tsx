"use client";

import { useState } from "react";

import Link from "next/link";

import { Plus, Pencil, Trash2, ExternalLink, User } from "lucide-react";

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
  DialogTrigger,
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

import { getAllFriends, type Friend } from "@/lib/friends-data";

function getCategoryBadge(category: Friend["category"]) {
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
  const friends = getAllFriends();

  const stats = {
    total: friends.length,
    developers: friends.filter((f) => f.category === "developer").length,
    designers: friends.filter((f) => f.category === "designer").length,
    creators: friends.filter((f) => f.category === "creator").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Friends</h1>
          <p className="text-muted-foreground">
            Manage your friend links and connections
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Friend Link</DialogTitle>
              <DialogDescription>
                Add a new friend to your links page.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Name
                  </label>
                  <Input placeholder="John Doe" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Category
                  </label>
                  <Select defaultValue="developer">
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
                <Input placeholder="https://example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Avatar URL
                </label>
                <Input placeholder="https://example.com/avatar.jpg" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <Textarea
                  placeholder="Brief description of this person..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Add Friend</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
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

      {/* Friends List */}
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
                  <Button variant="ghost" size="icon">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
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
