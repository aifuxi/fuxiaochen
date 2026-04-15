"use client";

import { RefreshCw, Save, Settings2 } from "lucide-react";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getSettings,
  type SettingsApiError,
  updateSettings,
} from "@/lib/settings/settings-client";
import type { SettingsDto, UpdateSettingsInput } from "@/lib/settings/settings-dto";

const sections = ["常规", "外观", "SEO", "评论", "集成"] as const;

const themeOptions = [
  { label: "深色", value: "dark" },
  { label: "浅色", value: "light" },
  { label: "跟随系统", value: "system" },
];

const languageOptions = [
  { label: "English", value: "en" },
  { label: "简体中文", value: "zh-CN" },
  { label: "日本語", value: "ja" },
];

const timezoneOptions = [
  { label: "Asia/Shanghai", value: "Asia/Shanghai" },
  { label: "UTC", value: "UTC" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "Europe/London", value: "Europe/London" },
];

const fontOptions = [
  { label: "默认", value: "default" },
  { label: "Inter", value: "Inter" },
  { label: "Newsreader", value: "Newsreader" },
  { label: "Space Grotesk", value: "Space Grotesk" },
];

type SettingsFormState = {
  accentColor: string;
  blogDescription: string;
  blogName: string;
  blogUrl: string;
  commentSettings: {
    allowAnonymous: boolean;
    enabled: boolean;
    maxReplyDepth: number;
    moderationRequired: boolean;
    nestedRepliesEnabled: boolean;
  };
  contactEmail: string;
  defaultMetaDescription: string;
  defaultMetaTitle: string;
  fontFamily: string;
  googleAnalyticsId: string;
  languageCode: string;
  sitemapUrl: string;
  theme: string;
  timezone: string;
};

export function CmsSettingsManager() {
  const [activeSection, setActiveSection] = React.useState<(typeof sections)[number]>("常规");
  const [values, setValues] = React.useState<SettingsFormState>(createEmptySettingsForm());
  const { data, error, isLoading, isValidating, mutate } = useSWR<SettingsDto, SettingsApiError>(
    ["settings"],
    getSettings,
  );
  const updateMutation = useSWRMutation(
    "update-settings",
    (_key, { arg }: { arg: UpdateSettingsInput }) => updateSettings(arg),
  );

  React.useEffect(() => {
    if (!data) {
      return;
    }

    setValues(toFormState(data));
  }, [data]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const updatedSettings = await updateMutation.trigger(toUpdateInput(values));
    setValues(toFormState(updatedSettings));
    await mutate(updatedSettings, {
      revalidate: false,
    });
    toast.success("设置已保存。");
  }

  if (isLoading && !data) {
    return <SettingsSkeleton />;
  }

  if (error) {
    return <SettingsError error={error} onRetry={() => void mutate()} />;
  }

  return (
    <div className={`
      grid gap-8
      xl:grid-cols-[240px_1fr]
    `}>
      <aside className="xl:sticky xl:top-28 xl:h-fit">
        <div className="glass-card rounded-2xl border border-white/8 p-3">
          {sections.map((section) => (
            <button
              key={section}
              className={activeSection === section ? `
                mb-1 flex w-full items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary
              ` : `
                mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted transition
                hover:bg-white/6 hover:text-foreground
              `}
              type="button"
              onClick={() => {
                setActiveSection(section);
                document.getElementById(getSectionId(section))?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              <span>•</span>
              {section}
            </button>
          ))}
        </div>
      </aside>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <SettingsSection
          description="站点标识、元数据和默认发布信息。"
          id={getSectionId("常规")}
          title="常规设置"
        >
          <div className={`
            grid gap-6
            md:grid-cols-2
          `}>
            <Field label="站点名称">
              <Input
                required
                value={values.blogName}
                onChange={(event) => updateValue("blogName", event.target.value, setValues)}
              />
            </Field>
            <Field label="站点 URL">
              <Input
                required
                type="url"
                value={values.blogUrl}
                onChange={(event) => updateValue("blogUrl", event.target.value, setValues)}
              />
            </Field>
            <Field label="联系邮箱">
              <Input
                type="email"
                value={values.contactEmail}
                onChange={(event) => updateValue("contactEmail", event.target.value, setValues)}
              />
            </Field>
            <Field label="语言">
              <Select
                options={languageOptions}
                value={values.languageCode}
                onValueChange={(value) => updateValue("languageCode", value as string, setValues)}
              />
            </Field>
            <Field className="md:col-span-2" label="描述">
              <textarea
                className="form-input min-h-28 w-full rounded-xl px-4 py-3"
                value={values.blogDescription}
                onChange={(event) => updateValue("blogDescription", event.target.value, setValues)}
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          description="主题、排版、颜色和本地化默认值。"
          id={getSectionId("外观")}
          title="外观"
        >
          <div className={`
            grid gap-6
            md:grid-cols-2
          `}>
            <Field label="主题">
              <Select
                options={themeOptions}
                value={values.theme}
                onValueChange={(value) => updateValue("theme", value as string, setValues)}
              />
            </Field>
            <Field label="字体">
              <Select
                options={fontOptions}
                value={values.fontFamily || "default"}
                onValueChange={(value) => updateValue("fontFamily", value === "default" ? "" : value as string, setValues)}
              />
            </Field>
            <Field label="强调色">
              <Input
                maxLength={7}
                placeholder="#10B981"
                value={values.accentColor}
                onChange={(event) => updateValue("accentColor", event.target.value, setValues)}
              />
            </Field>
            <Field label="时区">
              <Select
                options={timezoneOptions}
                value={values.timezone}
                onValueChange={(value) => updateValue("timezone", value as string, setValues)}
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          description="用于预览、搜索引擎和站点地图发现的默认元数据。"
          id={getSectionId("SEO")}
          title="SEO"
        >
          <div className={`
            grid gap-6
            md:grid-cols-2
          `}>
            <Field label="默认 Meta 标题">
              <Input
                value={values.defaultMetaTitle}
                onChange={(event) => updateValue("defaultMetaTitle", event.target.value, setValues)}
              />
            </Field>
            <Field label="站点地图 URL">
              <Input
                type="url"
                value={values.sitemapUrl}
                onChange={(event) => updateValue("sitemapUrl", event.target.value, setValues)}
              />
            </Field>
            <Field className="md:col-span-2" label="默认 Meta 描述">
              <textarea
                className="form-input min-h-28 w-full rounded-xl px-4 py-3"
                maxLength={500}
                value={values.defaultMetaDescription}
                onChange={(event) => updateValue("defaultMetaDescription", event.target.value, setValues)}
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          description="读者讨论、审核队列和回复深度控制。"
          id={getSectionId("评论")}
          title="评论"
        >
          <div className="divide-y divide-white/8">
            <ToggleRow
              checked={values.commentSettings.enabled}
              description="读者可以对已发布的文章发表评论。"
              label="允许评论"
              onCheckedChange={(checked) => updateCommentValue("enabled", checked, setValues)}
            />
            <ToggleRow
              checked={values.commentSettings.moderationRequired}
              description="所有新评论首先进入审核队列。"
              label="需要审核"
              onCheckedChange={(checked) => updateCommentValue("moderationRequired", checked, setValues)}
            />
            <ToggleRow
              checked={values.commentSettings.allowAnonymous}
              description="读者可以在不登录的情况下发表评论。"
              label="允许匿名评论"
              onCheckedChange={(checked) => updateCommentValue("allowAnonymous", checked, setValues)}
            />
            <ToggleRow
              checked={values.commentSettings.nestedRepliesEnabled}
              description="评论线程可以包含嵌套回复。"
              label="嵌套回复"
              onCheckedChange={(checked) => updateCommentValue("nestedRepliesEnabled", checked, setValues)}
            />
          </div>
          <div className="mt-6 max-w-xs">
            <Field label="最大回复深度">
              <Input
                max={10}
                min={1}
                required
                type="number"
                value={String(values.commentSettings.maxReplyDepth)}
                onChange={(event) =>
                  updateCommentValue("maxReplyDepth", Number(event.target.value || 1), setValues)
                }
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          description="分析和外部服务标识符。"
          id={getSectionId("集成")}
          title="集成"
        >
          <Field label="Google Analytics ID">
            <Input
              maxLength={32}
              placeholder="G-XXXXXXXXXX"
              value={values.googleAnalyticsId}
              onChange={(event) => updateValue("googleAnalyticsId", event.target.value, setValues)}
            />
          </Field>
        </SettingsSection>

        <div className={`
          sticky bottom-6 z-10 flex flex-col gap-3 rounded-2xl border border-white/8 bg-popover/90 p-4 backdrop-blur-xl
          sm:flex-row sm:items-center sm:justify-between
        `}>
          <div className="text-sm text-muted">
            {isValidating ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="size-3 animate-spin" />
                刷新设置中
              </span>
            ) : (
              "更改将保存到实时 CMS 设置记录中。"
            )}
          </div>
          <Button disabled={updateMutation.isMutating} type="submit" variant="primary">
            {updateMutation.isMutating ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
            保存设置
          </Button>
        </div>
      </form>
    </div>
  );
}

function SettingsSection({
  children,
  description,
  id,
  title,
}: {
  children: React.ReactNode;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section id={id} className="glass-card scroll-mt-28 overflow-hidden rounded-2xl border border-white/8">
      <div className="border-b border-white/8 px-6 py-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={`
      space-y-2
      ${className ?? ""}
    `}>
      <span className="block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({
  checked,
  description,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-8 py-5">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-1 text-xs text-muted">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className={`
      grid gap-8
      xl:grid-cols-[240px_1fr]
    `}>
      <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
      <div className="space-y-8">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

function SettingsError({
  error,
  onRetry,
}: {
  error: SettingsApiError;
  onRetry: () => void;
}) {
  return (
    <div className={`
      glass-card flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/8
    `}>
      <Settings2 className="size-10 text-muted" />
      <p className="max-w-md text-center text-sm text-muted">{error.message || "加载设置失败。"}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        重试
      </Button>
    </div>
  );
}

function createEmptySettingsForm(): SettingsFormState {
  return {
    accentColor: "",
    blogDescription: "",
    blogName: "",
    blogUrl: "",
    commentSettings: {
      allowAnonymous: false,
      enabled: true,
      maxReplyDepth: 3,
      moderationRequired: true,
      nestedRepliesEnabled: true,
    },
    contactEmail: "",
    defaultMetaDescription: "",
    defaultMetaTitle: "",
    fontFamily: "",
    googleAnalyticsId: "",
    languageCode: "en",
    sitemapUrl: "",
    theme: "dark",
    timezone: "Asia/Shanghai",
  };
}

function toFormState(settings: SettingsDto): SettingsFormState {
  return {
    accentColor: settings.accentColor ?? "",
    blogDescription: settings.blogDescription ?? "",
    blogName: settings.blogName,
    blogUrl: settings.blogUrl,
    commentSettings: {
      allowAnonymous: settings.commentSettings.allowAnonymous,
      enabled: settings.commentSettings.enabled,
      maxReplyDepth: settings.commentSettings.maxReplyDepth,
      moderationRequired: settings.commentSettings.moderationRequired,
      nestedRepliesEnabled: settings.commentSettings.nestedRepliesEnabled,
    },
    contactEmail: settings.contactEmail ?? "",
    defaultMetaDescription: settings.defaultMetaDescription ?? "",
    defaultMetaTitle: settings.defaultMetaTitle ?? "",
    fontFamily: settings.fontFamily ?? "",
    googleAnalyticsId: settings.googleAnalyticsId ?? "",
    languageCode: settings.languageCode,
    sitemapUrl: settings.sitemapUrl ?? "",
    theme: settings.theme,
    timezone: settings.timezone,
  };
}

function toUpdateInput(values: SettingsFormState): UpdateSettingsInput {
  return {
    accentColor: values.accentColor || null,
    blogDescription: values.blogDescription || null,
    blogName: values.blogName,
    blogUrl: values.blogUrl,
    commentSettings: values.commentSettings,
    contactEmail: values.contactEmail || null,
    defaultMetaDescription: values.defaultMetaDescription || null,
    defaultMetaTitle: values.defaultMetaTitle || null,
    fontFamily: values.fontFamily || null,
    googleAnalyticsId: values.googleAnalyticsId || null,
    languageCode: values.languageCode,
    sitemapUrl: values.sitemapUrl || null,
    theme: values.theme,
    timezone: values.timezone,
  };
}

function updateValue<TKey extends keyof Omit<SettingsFormState, "commentSettings">>(
  key: TKey,
  value: SettingsFormState[TKey],
  setValues: React.Dispatch<React.SetStateAction<SettingsFormState>>,
) {
  setValues((currentValues) => ({
    ...currentValues,
    [key]: value,
  }));
}

function updateCommentValue<TKey extends keyof SettingsFormState["commentSettings"]>(
  key: TKey,
  value: SettingsFormState["commentSettings"][TKey],
  setValues: React.Dispatch<React.SetStateAction<SettingsFormState>>,
) {
  setValues((currentValues) => ({
    ...currentValues,
    commentSettings: {
      ...currentValues.commentSettings,
      [key]: value,
    },
  }));
}

function getSectionId(section: (typeof sections)[number]) {
  return `settings-${section.toLowerCase()}`;
}
