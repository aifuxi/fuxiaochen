"use client";

import { useState } from "react";

import Link from "next/link";

import NiceModal from "@ebay/nice-modal-react";
import {
  ExternalLink,
  Github,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { showAdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  AdminCardSkeletonGrid,
  AdminTableErrorRow,
  AdminTableLoadingRow,
} from "@/components/admin/admin-loading-state";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminProject } from "@/lib/server/projects/mappers";

import { routes } from "@/constants/routes";

type ProjectFormState = {
  description: string;
  featured: boolean;
  githubUrl: string;
  image: string;
  liveUrl: string;
  longDescription: string;
  published: boolean;
  slug: string;
  tagsText: string;
  title: string;
  year: string;
};

type ProjectDialogProps = {
  onSaved: () => Promise<unknown>;
  project?: AdminProject;
};

type ProjectPayload = {
  description: string;
  featured: boolean;
  githubUrl: string | null;
  image: string;
  liveUrl: string | null;
  longDescription: string;
  published: boolean;
  slug?: string;
  tags: string[];
  title: string;
  year: number;
};

const currentYear = new Date().getFullYear();

const DEFAULT_FORM_STATE: ProjectFormState = {
  description: "",
  featured: false,
  githubUrl: "",
  image: "",
  liveUrl: "",
  longDescription: "",
  published: false,
  slug: "",
  tagsText: "",
  title: "",
  year: String(currentYear),
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
});

function getInitialFormState(project?: AdminProject): ProjectFormState {
  if (!project) {
    return DEFAULT_FORM_STATE;
  }

  return {
    description: project.description,
    featured: project.featured,
    githubUrl: project.githubUrl ?? "",
    image: project.image,
    liveUrl: project.liveUrl ?? "",
    longDescription: project.longDescription,
    published: project.published,
    slug: project.slug,
    tagsText: project.tags.join(", "),
    title: project.title,
    year: String(project.year),
  };
}

function toProjectPayload(formData: ProjectFormState): ProjectPayload {
  const slug = formData.slug.trim();

  return {
    description: formData.description.trim(),
    featured: formData.featured,
    githubUrl: formData.githubUrl.trim() || null,
    image: formData.image.trim(),
    liveUrl: formData.liveUrl.trim() || null,
    longDescription: formData.longDescription.trim(),
    published: formData.published,
    ...(slug ? { slug } : {}),
    tags: formData.tagsText
      .split(/[,\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    title: formData.title.trim(),
    year: Number.parseInt(formData.year, 10),
  };
}

function getStatusBadge(project: AdminProject) {
  return project.published ? (
    <Badge
      variant="outline"
      className="border-green-500/50 bg-green-500/10 text-green-600"
    >
      已发布
    </Badge>
  ) : (
    <Badge variant="outline" className="border-border bg-muted">
      草稿
    </Badge>
  );
}

function safeHost(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const ProjectDialog = NiceModal.create(
  ({ onSaved, project }: ProjectDialogProps) => {
    const modal = NiceModal.useModal();
    const [formData, setFormData] = useState<ProjectFormState>(() =>
      getInitialFormState(project),
    );
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = Boolean(project);

    function updateForm<Key extends keyof ProjectFormState>(
      key: Key,
      value: ProjectFormState[Key],
    ) {
      setFormData((current) => ({
        ...current,
        [key]: value,
      }));
    }

    async function submitProject() {
      setIsSubmitting(true);
      setFormError(null);

      try {
        await apiRequest(
          project ? `/api/admin/projects/${project.id}` : "/api/admin/projects",
          {
            method: project ? "PATCH" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(toProjectPayload(formData)),
            toastOnError: false,
          },
        );
        await onSaved();
        modal.remove();
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "保存失败，请稍后重试",
        );
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "编辑项目" : "新增项目"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "更新项目展示信息、链接和发布状态。"
                : "创建一个新的项目条目，发布后会出现在公开项目页。"}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="project-title">标题</FieldLabel>
                <Input
                  id="project-title"
                  placeholder="项目名称"
                  value={formData.title}
                  disabled={isSubmitting}
                  onChange={(event) => updateForm("title", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="project-slug">Slug</FieldLabel>
                <Input
                  id="project-slug"
                  placeholder="留空则根据标题生成"
                  value={formData.slug}
                  disabled={isSubmitting}
                  onChange={(event) => updateForm("slug", event.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="project-year">年份</FieldLabel>
                <Input
                  id="project-year"
                  inputMode="numeric"
                  placeholder={String(currentYear)}
                  value={formData.year}
                  disabled={isSubmitting}
                  onChange={(event) => updateForm("year", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="project-image">封面图 URL</FieldLabel>
                <Input
                  id="project-image"
                  placeholder="/blog-cover-fallback.svg"
                  value={formData.image}
                  disabled={isSubmitting}
                  onChange={(event) => updateForm("image", event.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="project-description">摘要</FieldLabel>
              <Textarea
                id="project-description"
                placeholder="用于列表卡片展示的简短介绍"
                rows={2}
                value={formData.description}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="project-long-description">
                详细介绍
              </FieldLabel>
              <Textarea
                id="project-long-description"
                placeholder="用于精选项目区域的完整说明"
                rows={4}
                value={formData.longDescription}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateForm("longDescription", event.target.value)
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="project-tags">标签</FieldLabel>
              <Input
                id="project-tags"
                placeholder="Next.js, Drizzle, PostgreSQL"
                value={formData.tagsText}
                disabled={isSubmitting}
                onChange={(event) => updateForm("tagsText", event.target.value)}
              />
              <FieldDescription>多个标签可用逗号或换行分隔。</FieldDescription>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="project-github-url">GitHub URL</FieldLabel>
                <Input
                  id="project-github-url"
                  placeholder="https://github.com/user/repo"
                  value={formData.githubUrl}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateForm("githubUrl", event.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="project-live-url">在线地址</FieldLabel>
                <Input
                  id="project-live-url"
                  placeholder="https://example.com"
                  value={formData.liveUrl}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateForm("liveUrl", event.target.value)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field orientation="horizontal" className="rounded-lg border p-4">
                <Switch
                  id="project-published"
                  checked={formData.published}
                  disabled={isSubmitting}
                  onCheckedChange={(checked) =>
                    updateForm("published", checked)
                  }
                />
                <FieldContent>
                  <FieldLabel htmlFor="project-published">发布项目</FieldLabel>
                  <FieldDescription>
                    发布后会在公开项目页展示。
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field orientation="horizontal" className="rounded-lg border p-4">
                <Switch
                  id="project-featured"
                  checked={formData.featured}
                  disabled={isSubmitting}
                  onCheckedChange={(checked) => updateForm("featured", checked)}
                />
                <FieldContent>
                  <FieldLabel htmlFor="project-featured">精选项目</FieldLabel>
                  <FieldDescription>
                    精选项目会显示在页面顶部。
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>

            {formError ? <FieldError>{formError}</FieldError> : null}
          </FieldGroup>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => modal.remove()}
            >
              取消
            </Button>
            <Button disabled={isSubmitting} onClick={submitProject}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isEditing ? "保存更改" : "创建项目"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

export default function AdminProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null,
  );
  const { data, error, isLoading, mutate } = useSWR<{
    items: AdminProject[];
  }>(
    "/api/admin/projects?pageSize=100&sortBy=updatedAt&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const projects = data?.items ?? [];

  const normalizedSearch = search.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      project.title.toLowerCase().includes(normalizedSearch) ||
      project.slug.toLowerCase().includes(normalizedSearch) ||
      project.description.toLowerCase().includes(normalizedSearch) ||
      project.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && project.published) ||
      (statusFilter === "draft" && !project.published);
    const matchesFeatured =
      featuredFilter === "all" ||
      (featuredFilter === "featured" && project.featured) ||
      (featuredFilter === "normal" && !project.featured);

    return matchesSearch && matchesStatus && matchesFeatured;
  });

  const stats = {
    drafts: projects.filter((project) => !project.published).length,
    featured: projects.filter((project) => project.featured).length,
    published: projects.filter((project) => project.published).length,
    total: projects.length,
  };

  function openProjectDialog(project?: AdminProject) {
    void NiceModal.show(ProjectDialog, {
      onSaved: mutate,
      project,
    });
  }

  async function deleteProject(id: string) {
    setDeletingProjectId(id);

    try {
      await apiRequest(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      await mutate();
    } finally {
      setDeletingProjectId(null);
    }
  }

  function confirmDeleteProject(project: AdminProject) {
    void showAdminConfirmDialog({
      title: "确认删除这个项目？",
      description: `将删除项目「${project.title}」。此操作无法撤销。`,
      confirmingLabel: "正在删除...",
      onConfirm: () => deleteProject(project.id),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">项目</h1>
          <p className="text-muted-foreground">
            管理公开项目页展示的项目、链接与发布状态。
          </p>
        </div>
        <Button onClick={() => openProjectDialog()}>
          <Plus className="mr-2 size-4" />
          新增项目
        </Button>
      </div>

      {isLoading ? (
        <AdminCardSkeletonGrid
          className="sm:grid-cols-2 lg:grid-cols-4"
          count={4}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">项目总数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">已发布</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.published}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">草稿</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.drafts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">精选</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.featured}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>全部项目</CardTitle>
          <CardDescription>
            显示 {filteredProjects.length} / {projects.length} 个项目
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索标题、Slug、摘要或标签..."
                value={search}
                disabled={isLoading || Boolean(error)}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="sm:w-36"
                  disabled={isLoading || Boolean(error)}
                >
                  <SelectValue placeholder="发布状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger
                  className="sm:w-36"
                  disabled={isLoading || Boolean(error)}
                >
                  <SelectValue placeholder="精选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部项目</SelectItem>
                  <SelectItem value="featured">精选</SelectItem>
                  <SelectItem value="normal">普通</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>项目</TableHead>
                  <TableHead>年份</TableHead>
                  <TableHead>标签</TableHead>
                  <TableHead>链接</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新于</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <AdminTableLoadingRow colSpan={7} label="正在加载项目..." />
                ) : null}
                {!isLoading && error ? (
                  <AdminTableErrorRow
                    colSpan={7}
                    label="项目加载失败"
                    onRetry={() => void mutate()}
                  />
                ) : null}
                {!isLoading && !error && filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col gap-1 text-muted-foreground">
                        <p className="font-medium">暂无项目</p>
                        <p className="text-sm">
                          可以新增一个项目，或调整当前筛选条件。
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && !error
                  ? filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="flex min-w-64 items-start gap-3">
                            {project.image ? (
                              <img
                                src={project.image}
                                alt={project.title}
                                className="size-12 rounded-md border object-cover"
                              />
                            ) : (
                              <div className="flex size-12 items-center justify-center rounded-md border bg-muted">
                                <Star className="size-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-medium">
                                  {project.title}
                                </p>
                                {project.featured ? (
                                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                                ) : null}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                /{project.slug}
                              </p>
                              <p className="max-w-md truncate text-sm text-muted-foreground">
                                {project.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{project.year}</TableCell>
                        <TableCell>
                          <div className="flex max-w-64 flex-wrap gap-1.5">
                            {project.tags.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                未设置
                              </span>
                            ) : (
                              project.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))
                            )}
                            {project.tags.length > 4 ? (
                              <Badge variant="outline">
                                +{project.tags.length - 4}
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            {project.githubUrl ? (
                              <Link
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                              >
                                <Github className="size-3.5" />
                                {safeHost(project.githubUrl)}
                              </Link>
                            ) : null}
                            {project.liveUrl ? (
                              <Link
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="size-3.5" />
                                {safeHost(project.liveUrl)}
                              </Link>
                            ) : null}
                            {!project.githubUrl && !project.liveUrl ? (
                              <span className="text-muted-foreground">无</span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(project)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {dateFormatter.format(new Date(project.updatedAt))}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deletingProjectId !== null}
                              >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">操作</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={routes.site.projects}>
                                  <ExternalLink className="mr-2 size-4" />
                                  查看项目页
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={deletingProjectId !== null}
                                onClick={() => openProjectDialog(project)}
                              >
                                <Pencil className="mr-2 size-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                disabled={deletingProjectId === project.id}
                                onClick={() => confirmDeleteProject(project)}
                              >
                                {deletingProjectId === project.id ? (
                                  <Spinner data-icon="inline-start" />
                                ) : (
                                  <Trash2 className="mr-2 size-4" />
                                )}
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
