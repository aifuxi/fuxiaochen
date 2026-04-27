"use client";

import { useState } from "react";

import NiceModal from "@ebay/nice-modal-react";
import {
  AlertTriangle,
  Bug,
  Loader2,
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
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
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

type ChangelogFormState = {
  version: string;
  title: string;
  type: AdminChangelog["type"];
  description: string;
  changes: string;
};

type ChangelogDialogProps = {
  changelog?: AdminChangelog;
  onSaved: () => Promise<unknown>;
};

const DEFAULT_CHANGELOG_FORM_STATE: ChangelogFormState = {
  version: "",
  title: "",
  type: "feature",
  description: "",
  changes: "",
};

function getInitialChangelogFormState(
  changelog?: AdminChangelog,
): ChangelogFormState {
  if (!changelog) {
    return DEFAULT_CHANGELOG_FORM_STATE;
  }

  return {
    version: changelog.version,
    title: changelog.title,
    type: changelog.type,
    description: changelog.description,
    changes: changelog.changes.join("\n"),
  };
}

function toChangelogPayload(formData: ChangelogFormState) {
  return {
    version: formData.version.trim(),
    title: formData.title.trim(),
    type: formData.type,
    description: formData.description.trim(),
    changes: formData.changes
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

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

const ChangelogDialog = NiceModal.create(
  ({ changelog, onSaved }: ChangelogDialogProps) => {
    const modal = NiceModal.useModal();
    const [formData, setFormData] = useState<ChangelogFormState>(() =>
      getInitialChangelogFormState(changelog),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = Boolean(changelog);

    function updateForm<Key extends keyof ChangelogFormState>(
      key: Key,
      value: ChangelogFormState[Key],
    ) {
      setFormData((current) => ({
        ...current,
        [key]: value,
      }));
    }

    async function submitChangelog() {
      const payload = toChangelogPayload(formData);

      setIsSubmitting(true);

      try {
        await apiRequest(
          changelog
            ? `/api/admin/changelogs/${changelog.id}`
            : "/api/admin/changelogs",
          {
            method: changelog ? "PATCH" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              changelog
                ? payload
                : {
                    ...payload,
                    releaseDate: new Date().toISOString(),
                  },
            ),
          },
        );
        await onSaved();
        modal.remove();
      } catch {
        // The global API error listener owns toast display.
      } finally {
        setIsSubmitting(false);
      }
    }

    return (
      <Dialog
        open={modal.visible}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            modal.remove();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "编辑更新记录" : "新增更新记录"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "更新这条版本发布记录。"
                : "添加一条更新日志，记录本次发布内容。"}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="changelog-version">版本</FieldLabel>
                <Input
                  id="changelog-version"
                  placeholder="1.0.0"
                  value={formData.version}
                  onChange={(event) =>
                    updateForm("version", event.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="changelog-type">类型</FieldLabel>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    updateForm("type", value as AdminChangelog["type"])
                  }
                >
                  <SelectTrigger id="changelog-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="feature">功能</SelectItem>
                      <SelectItem value="improvement">改进</SelectItem>
                      <SelectItem value="bugfix">修复</SelectItem>
                      <SelectItem value="breaking">重大变更</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="changelog-title">标题</FieldLabel>
              <Input
                id="changelog-title"
                placeholder="本版本新增了什么？"
                value={formData.title}
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="changelog-description">描述</FieldLabel>
              <Textarea
                id="changelog-description"
                placeholder="简述本次更新内容"
                rows={2}
                value={formData.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="changelog-changes">
                变更项（每行一项）
              </FieldLabel>
              <Textarea
                id="changelog-changes"
                placeholder="新增功能\n修复问题\n性能提升"
                rows={4}
                value={formData.changes}
                onChange={(event) => updateForm("changes", event.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => modal.remove()}
            >
              取消
            </Button>
            <Button disabled={isSubmitting} onClick={submitChangelog}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}
              {isEditing ? "保存更改" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

export default function AdminChangelogPage() {
  const { data, mutate } = useSWR<{ items: AdminChangelog[] }>(
    "/api/admin/changelogs?pageSize=100&sortBy=releaseDate&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const changelogs = data?.items ?? [];

  const openChangelogDialog = (changelog?: AdminChangelog) => {
    void NiceModal.show(ChangelogDialog, {
      changelog,
      onSaved: () => mutate(),
    });
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
        <Button onClick={() => openChangelogDialog()}>
          <Plus className="mr-2 size-4" />
          新增记录
        </Button>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openChangelogDialog(entry)}
                    >
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
