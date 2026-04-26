"use client";

import { useState } from "react";

import {
  AlertTriangle,
  Bug,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Zap,
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

import { showAdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminChangelog } from "@/lib/server/changelogs/mappers";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
});

function getTypeIcon(type: AdminChangelog["type"]) {
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

function getTypeBadge(type: AdminChangelog["type"]) {
  const styles = {
    feature: "bg-green-500/10 text-green-600",
    improvement: "bg-blue-500/10 text-blue-600",
    bugfix: "bg-orange-500/10 text-orange-600",
    breaking: "bg-red-500/10 text-red-600",
  };

  const labels = {
    feature: "功能",
    improvement: "改进",
    bugfix: "修复",
    breaking: "重大变更",
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
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AdminChangelog["type"]>("feature");
  const [description, setDescription] = useState("");
  const [changes, setChanges] = useState("");

  const { data, mutate } = useSWR<{ items: AdminChangelog[] }>(
    "/api/admin/changelogs?pageSize=100&sortBy=releaseDate&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const changelogs = data?.items ?? [];

  const resetForm = () => {
    setVersion("");
    setTitle("");
    setType("feature");
    setDescription("");
    setChanges("");
  };

  const createChangelog = async () => {
    try {
      await apiRequest("/api/admin/changelogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version,
          title,
          type,
          description,
          releaseDate: new Date().toISOString(),
          changes: changes
            .split("\n")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });

      resetForm();
      setIsDialogOpen(false);
      await mutate();
    } catch {
      // The global API error listener owns toast display.
    }
  };

  const deleteChangelog = async (id: string) => {
    try {
      await apiRequest(`/api/admin/changelogs/${id}`, {
        method: "DELETE",
      });
      await mutate();
    } catch {
      // The global API error listener owns toast display.
    }
  };

  const confirmDeleteChangelog = (entry: AdminChangelog) => {
    void showAdminConfirmDialog({
      title: "确认删除这条更新日志？",
      description: `将删除 v${entry.version}「${entry.title}」。此操作无法撤销。`,
      onConfirm: () => deleteChangelog(entry.id),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">更新日志</h1>
          <p className="text-muted-foreground">管理项目的版本更新记录。</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              新增记录
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>新增更新记录</DialogTitle>
              <DialogDescription>
                添加一条更新日志，记录本次发布内容。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    版本
                  </label>
                  <Input
                    placeholder="1.0.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    类型
                  </label>
                  <Select
                    value={type}
                    onValueChange={(value) =>
                      setType(value as AdminChangelog["type"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">功能</SelectItem>
                      <SelectItem value="improvement">改进</SelectItem>
                      <SelectItem value="bugfix">修复</SelectItem>
                      <SelectItem value="breaking">重大变更</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">标题</label>
                <Input
                  placeholder="本版本新增了什么？"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">描述</label>
                <Textarea
                  placeholder="简述本次更新内容"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  变更项（每行一项）
                </label>
                <Textarea
                  placeholder="新增功能\n修复问题\n性能提升"
                  rows={4}
                  value={changes}
                  onChange={(e) => setChanges(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createChangelog}>新增</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全部记录</CardTitle>
          <CardDescription>{changelogs.length} 条更新日志</CardDescription>
        </CardHeader>
        <CardContent>
          {changelogs.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              暂无更新日志，先创建一条记录。
            </div>
          ) : (
            <div className="space-y-4">
              {changelogs.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-mono text-sm font-medium text-foreground">
                        v{entry.version}
                      </span>
                      {getTypeBadge(entry.type)}
                      <span className="text-sm text-muted-foreground">
                        {dateFormatter.format(new Date(entry.releaseDate))}
                      </span>
                    </div>
                    <h3 className="mb-1 font-medium text-foreground">
                      {entry.title}
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.changes.length} 项变更
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
                      onClick={() => confirmDeleteChangelog(entry)}
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
