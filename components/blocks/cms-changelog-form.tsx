"use client";

import { ChangelogItemType } from "@/generated/prisma/enums";
import { Check, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ChangelogApiError,
  createChangelogRelease,
  getChangelogRelease,
  updateChangelogRelease,
} from "@/lib/changelog/changelog-client";
import type {
  ChangelogReleaseDto,
  CreateChangelogReleaseInput,
  UpdateChangelogReleaseInput,
} from "@/lib/changelog/changelog-dto";
import {
  createChangelogReleaseBodySchema,
  updateChangelogReleaseBodySchema,
} from "@/lib/changelog/changelog-dto";

type CmsChangelogFormProps = {
  releaseId?: string;
};

const ITEM_TYPE_OPTIONS = [
  { label: "新增", value: ChangelogItemType.Added },
  { label: "优化", value: ChangelogItemType.Improved },
  { label: "修复", value: ChangelogItemType.Fixed },
  { label: "变更", value: ChangelogItemType.Changed },
  { label: "移除", value: ChangelogItemType.Removed },
];

export function CmsChangelogForm({ releaseId }: CmsChangelogFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(releaseId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [values, setValues] = React.useState<FormState>(createEmptyFormState());

  const { data: releaseData, isLoading } = useSWR(
    releaseId ? ["changelog-release-detail", releaseId] : null,
    () => getChangelogRelease(releaseId!),
  );

  React.useEffect(() => {
    if (!releaseData) {
      return;
    }

    setValues(createFormStateFromRelease(releaseData));
  }, [releaseData]);

  async function handleSubmit() {
    const payload = {
      isMajor: values.isMajor,
      items: values.items.map((item, index) => ({
        description: item.description || null,
        itemType: item.itemType,
        sortOrder: index,
        title: item.title,
      })),
      releasedOn: values.releasedOn,
      sortOrder: Number(values.sortOrder || 0),
      summary: values.summary || null,
      title: values.title,
      version: values.version,
    };

    const parsedValues = isEditMode
      ? updateChangelogReleaseBodySchema.safeParse(payload)
      : createChangelogReleaseBodySchema.safeParse(payload);

    if (!parsedValues.success) {
      toast.error(parsedValues.error.issues[0]?.message ?? "请检查您的输入。");

      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && releaseId) {
        await updateChangelogRelease(releaseId, parsedValues.data as UpdateChangelogReleaseInput);
        toast.success("更新日志版本更新成功。");
        router.refresh();
      } else {
        const release = await createChangelogRelease(parsedValues.data as CreateChangelogReleaseInput);
        toast.success("更新日志版本创建成功。");
        router.replace(`/cms/changelog/${release.id}`);
      }
    } catch (error) {
      if (error instanceof ChangelogApiError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("保存更新日志版本失败。");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className={`
        grid gap-6
        xl:grid-cols-[1fr_360px]
      `}>
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-2xl border border-white/8 bg-white/4" />
          <div className="h-[720px] animate-pulse rounded-2xl border border-white/8 bg-white/4" />
        </div>
        <div className="h-[720px] animate-pulse rounded-2xl border border-white/8 bg-white/4" />
      </div>
    );
  }

  return (
    <div className={`
      grid gap-6
      xl:grid-cols-[1fr_360px]
    `}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
          <div className="border-b border-white/8 px-6 py-4 text-sm font-semibold">版本元数据</div>
          <div className="space-y-5 p-6">
            <div className={`
              grid gap-5
              sm:grid-cols-2
            `}>
              <Field label="版本号">
                <Input
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      version: event.target.value,
                    }))
                  }
                  placeholder="v1.2.0"
                  value={values.version}
                />
              </Field>
              <Field label="发布日期">
                <Input
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      releasedOn: event.target.value,
                    }))
                  }
                  type="date"
                  value={values.releasedOn}
                />
              </Field>
            </div>

            <Field label="标题">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    title: event.target.value,
                  }))
                }
                placeholder="春季发布"
                value={values.title}
              />
            </Field>

            <Field label="摘要">
              <Textarea
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    summary: event.target.value,
                  }))
                }
                placeholder="简洁的发布摘要，用于更新日志归档。"
                value={values.summary}
              />
            </Field>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <div className="text-sm font-semibold">更新条目</div>
            <Button
              onClick={() =>
                setValues((currentValues) => ({
                  ...currentValues,
                  items: [...currentValues.items, createEmptyItemState()],
                }))
              }
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="size-4" />
              添加条目
            </Button>
          </div>

          <div className="space-y-5 p-6">
            {values.items.length > 0 ? (
              values.items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="muted">条目 {index + 1}</Badge>
                    <Button
                      onClick={() =>
                        setValues((currentValues) => ({
                          ...currentValues,
                          items: currentValues.items.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                      移除
                    </Button>
                  </div>

                  <div className={`
                    grid gap-5
                    sm:grid-cols-[180px_minmax(0,1fr)]
                  `}>
                    <Field label="类型">
                      <Select
                        onValueChange={(value) =>
                          setValues((currentValues) => ({
                            ...currentValues,
                            items: currentValues.items.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...currentItem,
                                    itemType: value as ChangelogItemType,
                                  }
                                : currentItem,
                            ),
                          }))
                        }
                        options={ITEM_TYPE_OPTIONS}
                        value={item.itemType}
                      />
                    </Field>
                    <Field label="标题">
                      <Input
                        onChange={(event) =>
                          setValues((currentValues) => ({
                            ...currentValues,
                            items: currentValues.items.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...currentItem,
                                    title: event.target.value,
                                  }
                                : currentItem,
                            ),
                          }))
                        }
                        placeholder="新增项目 CRUD API"
                        value={item.title}
                      />
                    </Field>
                  </div>

                  <div className="mt-5">
                    <Field label="描述">
                      <Textarea
                        onChange={(event) =>
                          setValues((currentValues) => ({
                            ...currentValues,
                            items: currentValues.items.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...currentItem,
                                    description: event.target.value,
                                  }
                                : currentItem,
                            ),
                          }))
                        }
                        placeholder="可选的额外详情。"
                        value={item.description}
                      />
                    </Field>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted">
                暂无条目。为这个版本添加第一个更新条目。
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Check className="size-4" />
            {isEditMode ? "正在编辑版本" : "准备发布"}
          </div>
          <div className="space-y-3">
            <Button
              className="w-full justify-center"
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
              type="button"
            >
              {isSubmitting ? "保存中..." : isEditMode ? "更新版本" : "创建版本"}
            </Button>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="text-sm font-semibold">版本设置</div>

          <label className={`
            flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-foreground
          `}>
            <Checkbox
              checked={values.isMajor}
              onCheckedChange={(checked) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  isMajor: Boolean(checked),
                }))
              }
            />
            <span>标记为主版本</span>
          </label>

          <Field label="排序顺序">
            <Input
              inputMode="numeric"
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  sortOrder: event.target.value,
                }))
              }
              placeholder="0"
              type="number"
              value={values.sortOrder}
            />
          </Field>

          <div className="space-y-2 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Badge variant={values.isMajor ? "success" : "muted"}>
                {values.isMajor ? "主版本" : "次版本"}
              </Badge>
              <Badge variant="muted">{values.items.length} 个条目</Badge>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

type FormState = {
  isMajor: boolean;
  items: ItemState[];
  releasedOn: string;
  sortOrder: string;
  summary: string;
  title: string;
  version: string;
};

type ItemState = {
  description: string;
  itemType: ChangelogItemType;
  title: string;
};

function Field({
  children,
  description,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="type-label text-foreground">{label}</span>
      {children}
      {description ? <span className="block text-xs text-muted">{description}</span> : null}
    </label>
  );
}

function createEmptyFormState(): FormState {
  return {
    isMajor: false,
    items: [createEmptyItemState()],
    releasedOn: "",
    sortOrder: "0",
    summary: "",
    title: "",
    version: "",
  };
}

function createEmptyItemState(): ItemState {
  return {
    description: "",
    itemType: ChangelogItemType.Added,
    title: "",
  };
}

function createFormStateFromRelease(release: ChangelogReleaseDto): FormState {
  return {
    isMajor: release.isMajor,
    items: release.items.map((item) => ({
      description: item.description ?? "",
      itemType: item.itemType,
      title: item.title,
    })),
    releasedOn: release.releasedOn.slice(0, 10),
    sortOrder: String(release.sortOrder),
    summary: release.summary ?? "",
    title: release.title,
    version: release.version,
  };
}
