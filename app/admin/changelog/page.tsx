"use client";

import { useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Zap,
  Bug,
  AlertTriangle,
} from "lucide-react";

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

import { getAllChangelogs, type ChangelogEntry } from "@/lib/changelog-data";

function getTypeIcon(type: ChangelogEntry["type"]) {
  switch (type) {
    case "feature":
      return <Sparkles className="size-4" />;
    case "improvement":
      return <Zap className="size-4" />;
    case "bugfix":
      return <Bug className="size-4" />;
    case "breaking":
      return <AlertTriangle className="size-4" />;
  }
}

function getTypeBadge(type: ChangelogEntry["type"]) {
  const styles = {
    feature: "bg-green-500/10 text-green-600",
    improvement: "bg-blue-500/10 text-blue-600",
    bugfix: "bg-orange-500/10 text-orange-600",
    breaking: "bg-red-500/10 text-red-600",
  };

  const labels = {
    feature: "Feature",
    improvement: "Improvement",
    bugfix: "Bug Fix",
    breaking: "Breaking",
  };

  return (
    <Badge variant="secondary" className={styles[type]}>
      {getTypeIcon(type)}
      <span className="ml-1">{labels[type]}</span>
    </Badge>
  );
}

export default function AdminChangelogPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const changelogs = getAllChangelogs();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Changelog</h1>
          <p className="text-muted-foreground">
            Manage your project changelog entries
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Changelog Entry</DialogTitle>
              <DialogDescription>
                Create a new changelog entry to document updates.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Version
                  </label>
                  <Input placeholder="1.0.0" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Type
                  </label>
                  <Select defaultValue="feature">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="bugfix">Bug Fix</SelectItem>
                      <SelectItem value="breaking">Breaking Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Title
                </label>
                <Input placeholder="What's new in this version?" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <Textarea
                  placeholder="Brief description of this update..."
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Changes (one per line)
                </label>
                <Textarea
                  placeholder="• Added new feature&#10;• Fixed bug&#10;• Improved performance"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Add Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Changelog List */}
      <Card>
        <CardHeader>
          <CardTitle>All Entries</CardTitle>
          <CardDescription>
            {changelogs.length} changelog entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {changelogs.map((entry) => (
              <div
                key={entry.id}
                className="border-border flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-foreground font-mono text-sm font-medium">
                      v{entry.version}
                    </span>
                    {getTypeBadge(entry.type)}
                    <span className="text-muted-foreground text-sm">
                      {entry.date}
                    </span>
                  </div>
                  <h3 className="text-foreground mb-1 font-medium">
                    {entry.title}
                  </h3>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {entry.description}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {entry.changes.length} changes
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
