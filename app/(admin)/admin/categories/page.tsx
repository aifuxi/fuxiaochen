"use client";

import { useState } from "react";

import NiceModal from "@ebay/nice-modal-react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { showAdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  AdminTableErrorRow,
  AdminTableLoadingRow,
} from "@/components/admin/admin-loading-state";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminCategory } from "@/lib/server/categories/mappers";

type CategoryFormState = {
  name: string;
  slug: string;
};

type CategoryDialogProps = {
  category?: AdminCategory;
  onSaved: () => Promise<unknown>;
};

const DEFAULT_CATEGORY_FORM_STATE: CategoryFormState = {
  name: "",
  slug: "",
};

function getInitialCategoryFormState(
  category?: AdminCategory,
): CategoryFormState {
  if (!category) {
    return DEFAULT_CATEGORY_FORM_STATE;
  }

  return {
    name: category.name,
    slug: category.slug,
  };
}

function toCategoryPayload(formData: CategoryFormState) {
  return {
    name: formData.name.trim(),
    slug: formData.slug.trim(),
  };
}

const CategoryDialog = NiceModal.create(
  ({ category, onSaved }: CategoryDialogProps) => {
    const modal = NiceModal.useModal();
    const [formData, setFormData] = useState<CategoryFormState>(() =>
      getInitialCategoryFormState(category),
    );
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = Boolean(category);

    function updateForm<Key extends keyof CategoryFormState>(
      key: Key,
      value: CategoryFormState[Key],
    ) {
      setFormData((current) => ({
        ...current,
        [key]: value,
      }));
    }

    async function submitCategory() {
      const payload = toCategoryPayload(formData);

      if (!payload.name || !payload.slug) {
        setFormError("名称和 Slug 都不能为空。");
        return;
      }

      setIsSubmitting(true);
      setFormError(null);

      try {
        await apiRequest(
          category
            ? `/api/admin/categories/${category.id}`
            : "/api/admin/categories",
          {
            method: category ? "PATCH" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "编辑分类" : "新建分类"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "更新分类名称和 Slug。" : "创建一个新的文章分类。"}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-2">
            <Field>
              <FieldLabel htmlFor="category-name">名称</FieldLabel>
              <Input
                id="category-name"
                value={formData.name}
                disabled={isSubmitting}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="输入分类名称"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
              <Input
                id="category-slug"
                value={formData.slug}
                disabled={isSubmitting}
                onChange={(event) => updateForm("slug", event.target.value)}
                placeholder="frontend"
              />
            </Field>
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
            <Button disabled={isSubmitting} onClick={submitCategory}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isEditing ? "保存更改" : "创建分类"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

export default function AdminCategoriesPage() {
  const { data, error, isLoading, mutate } = useSWR<{
    items: AdminCategory[];
  }>(
    "/api/admin/categories?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const categories = data?.items ?? [];

  const openCategoryDialog = (category?: AdminCategory) => {
    void NiceModal.show(CategoryDialog, {
      category,
      onSaved: () => mutate(),
    });
  };

  const deleteCategory = async (id: string) => {
    await apiRequest(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    await mutate();
  };

  const confirmDeleteCategory = (category: AdminCategory) => {
    void showAdminConfirmDialog({
      title: "确认删除这个分类？",
      description: `将删除分类「${category.name}」。如果仍有文章使用该分类，接口会阻止删除。`,
      confirmingLabel: "正在删除...",
      onConfirm: () => deleteCategory(category.id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">分类</h1>
          <p className="text-muted-foreground">使用分类管理文章分组。</p>
        </div>
        <Button onClick={() => openCategoryDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          新建分类
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>文章数</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <AdminTableLoadingRow colSpan={4} label="正在加载分类..." />
            ) : null}
            {!isLoading && error ? (
              <AdminTableErrorRow
                colSpan={4}
                label="分类加载失败"
                onRetry={() => void mutate()}
              />
            ) : null}
            {!isLoading && !error && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <div className="space-y-1 text-muted-foreground">
                    <p className="font-medium">暂无分类</p>
                    <p className="text-sm">先新建一个分类，再开始整理文章。</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && !error
              ? categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.blogCount}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openCategoryDialog(category)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => confirmDeleteCategory(category)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
    </div>
  );
}
