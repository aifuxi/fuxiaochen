"use client";

import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, SaveIcon } from "lucide-react";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminSiteSettings } from "@/lib/server/settings/mappers";
import type { SiteSettings } from "@/lib/settings/types";

const jsonArrayString = z
  .string()
  .trim()
  .refine(
    (value) => {
      try {
        return Array.isArray(JSON.parse(value));
      } catch {
        return false;
      }
    },
    { message: "必须是有效的 JSON 数组" },
  );

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || z.string().url().safeParse(value).success,
    { message: "链接格式不正确" },
  );

const assetPath = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) =>
      value.startsWith("/") || z.string().url().safeParse(value).success,
    { message: "必须是绝对路径或 URL" },
  );

const settingsFormSchema = z.object({
  general: z.object({
    siteName: z.string().trim().min(1),
    siteUrl: z.string().trim().url(),
    siteDescription: z.string().trim().min(1),
    logoUrl: assetPath,
    avatarUrl: assetPath,
    email: z.string().trim().email(),
  }),
  seo: z.object({
    defaultTitle: z.string().trim().min(1),
    defaultDescription: z.string().trim().min(1),
    pages: z.object({
      home: z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
      about: z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
      blog: z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
      projects: z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
      friends: z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
      changelog: z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
    }),
  }),
  profile: z.object({
    heroTitle: z.string().trim().min(1),
    heroRole: z.string().trim().min(1),
    heroSummary: z.string().trim().min(1),
    heroDescription: z.string().trim().min(1),
    aboutTitle: z.string().trim().min(1),
    aboutRole: z.string().trim().min(1),
    aboutLocation: z.string().trim().min(1),
    bioTitle: z.string().trim().min(1),
    bioText: z.string().trim().min(1),
    experienceTitle: z.string().trim().min(1),
    experienceJson: jsonArrayString,
    skillsTitle: z.string().trim().min(1),
    languagesText: z.string().trim().min(1),
    frontendText: z.string().trim().min(1),
    backendText: z.string().trim().min(1),
    toolsText: z.string().trim().min(1),
    beyondCodeTitle: z.string().trim().min(1),
    interestsJson: jsonArrayString,
    ctaTitle: z.string().trim().min(1),
    ctaDescription: z.string().trim().min(1),
  }),
  social: z.object({
    githubUrl: optionalUrl,
    twitterUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    juejinUrl: optionalUrl,
    bilibiliUrl: optionalUrl,
    sourceCodeUrl: optionalUrl,
  }),
  compliance: z.object({
    icpNumber: z.string().trim(),
    icpLink: optionalUrl,
    policeNumber: z.string().trim(),
    policeLink: optionalUrl,
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;
type FieldPath = Path<SettingsFormValues>;

const toLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const toJsonText = (value: unknown) => JSON.stringify(value, null, 2);

const toFormValues = (settings: SiteSettings): SettingsFormValues => ({
  general: settings.general,
  seo: settings.seo,
  profile: {
    heroTitle: settings.profile.heroTitle,
    heroRole: settings.profile.heroRole,
    heroSummary: settings.profile.heroSummary,
    heroDescription: settings.profile.heroDescription,
    aboutTitle: settings.profile.aboutTitle,
    aboutRole: settings.profile.aboutRole,
    aboutLocation: settings.profile.aboutLocation,
    bioTitle: settings.profile.bioTitle,
    bioText: settings.profile.bio.join("\n"),
    experienceTitle: settings.profile.experienceTitle,
    experienceJson: toJsonText(settings.profile.experience),
    skillsTitle: settings.profile.skillsTitle,
    languagesText: settings.profile.skills.languages.join("\n"),
    frontendText: settings.profile.skills.frontend.join("\n"),
    backendText: settings.profile.skills.backend.join("\n"),
    toolsText: settings.profile.skills.tools.join("\n"),
    beyondCodeTitle: settings.profile.beyondCodeTitle,
    interestsJson: toJsonText(settings.profile.interests),
    ctaTitle: settings.profile.ctaTitle,
    ctaDescription: settings.profile.ctaDescription,
  },
  social: settings.social,
  compliance: settings.compliance,
});

const toPayload = (values: SettingsFormValues): SiteSettings => ({
  general: values.general,
  seo: values.seo,
  profile: {
    heroTitle: values.profile.heroTitle,
    heroRole: values.profile.heroRole,
    heroSummary: values.profile.heroSummary,
    heroDescription: values.profile.heroDescription,
    aboutTitle: values.profile.aboutTitle,
    aboutRole: values.profile.aboutRole,
    aboutLocation: values.profile.aboutLocation,
    bioTitle: values.profile.bioTitle,
    bio: toLines(values.profile.bioText),
    experienceTitle: values.profile.experienceTitle,
    experience: JSON.parse(
      values.profile.experienceJson,
    ) as SiteSettings["profile"]["experience"],
    skillsTitle: values.profile.skillsTitle,
    skills: {
      languages: toLines(values.profile.languagesText),
      frontend: toLines(values.profile.frontendText),
      backend: toLines(values.profile.backendText),
      tools: toLines(values.profile.toolsText),
    },
    beyondCodeTitle: values.profile.beyondCodeTitle,
    interests: JSON.parse(
      values.profile.interestsJson,
    ) as SiteSettings["profile"]["interests"],
    ctaTitle: values.profile.ctaTitle,
    ctaDescription: values.profile.ctaDescription,
  },
  social: values.social,
  compliance: values.compliance,
});

export default function AdminSettingsPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const { data, error, isLoading, mutate } = useSWR<AdminSiteSettings>(
    "/api/admin/settings",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const fallbackValues = useMemo(
    () => (data ? toFormValues(data) : undefined),
    [data],
  );
  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    values: fallbackValues,
  });

  useEffect(() => {
    if (data) {
      reset(toFormValues(data));
    }
  }, [data, reset]);

  const fieldError = (name: FieldPath) => {
    const segments = name.split(".");
    let current: unknown = errors;

    for (const segment of segments) {
      if (!current || typeof current !== "object") {
        return undefined;
      }

      current = (current as Record<string, unknown>)[segment];
    }

    return current &&
      typeof current === "object" &&
      "message" in current &&
      typeof current.message === "string"
      ? [{ message: current.message }]
      : undefined;
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const payload = toPayload(values);
      const updated = await apiRequest<AdminSiteSettings>(
        "/api/admin/settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      await mutate(updated.data, {
        revalidate: false,
      });
      reset(toFormValues(updated.data));
      toast.success("设置已保存");
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "设置保存失败",
      );
    }
  });

  const renderInput = (name: FieldPath, label: string, type = "text") => (
    <Field data-invalid={!!fieldError(name)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        type={type}
        aria-invalid={!!fieldError(name)}
        {...register(name)}
      />
      <FieldError errors={fieldError(name)} />
    </Field>
  );

  const renderTextarea = (
    name: FieldPath,
    label: string,
    description?: string,
    rows = 4,
  ) => (
    <Field data-invalid={!!fieldError(name)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea
        id={name}
        rows={rows}
        aria-invalid={!!fieldError(name)}
        {...register(name)}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={fieldError(name)} />
    </Field>
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>设置暂不可用</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !fallbackValues) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">站点设置</h1>
        <p className="text-muted-foreground">
          配置公开站点身份、SEO、个人资料、社交链接和备案信息。
        </p>
      </div>

      {formError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>保存失败</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="general" className="gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="general">基础信息</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="profile">个人资料</TabsTrigger>
          <TabsTrigger value="social">社交链接</TabsTrigger>
          <TabsTrigger value="compliance">备案信息</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
              <CardDescription>
                站点导航、页脚和默认元信息使用的公开身份信息。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {renderInput("general.siteName", "站点名称")}
                {renderInput("general.siteUrl", "站点地址", "url")}
                {renderTextarea("general.siteDescription", "站点描述")}
                {renderInput("general.logoUrl", "Logo 路径或 URL")}
                {renderInput("general.avatarUrl", "头像路径或 URL")}
                {renderInput("general.email", "邮箱", "email")}
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                运行时用于首页和公开页面的元信息。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {renderInput("seo.defaultTitle", "默认标题")}
                {renderTextarea("seo.defaultDescription", "默认描述")}
                {renderInput("seo.pages.home.title", "首页标题")}
                {renderTextarea("seo.pages.home.description", "首页描述")}
                {renderInput("seo.pages.about.title", "关于页标题")}
                {renderTextarea("seo.pages.about.description", "关于页描述")}
                {renderInput("seo.pages.blog.title", "博客页标题")}
                {renderTextarea("seo.pages.blog.description", "博客页描述")}
                {renderInput("seo.pages.projects.title", "项目页标题")}
                {renderTextarea("seo.pages.projects.description", "项目页描述")}
                {renderInput("seo.pages.friends.title", "友链页标题")}
                {renderTextarea("seo.pages.friends.description", "友链页描述")}
                {renderInput("seo.pages.changelog.title", "更新日志页标题")}
                {renderTextarea(
                  "seo.pages.changelog.description",
                  "更新日志页描述",
                )}
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>
                首页首屏和关于页面使用的个人介绍内容。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {renderInput("profile.heroTitle", "首页主标题")}
                {renderInput("profile.heroRole", "首页身份")}
                {renderTextarea("profile.heroSummary", "首页摘要")}
                {renderTextarea("profile.heroDescription", "首页描述")}
                {renderInput("profile.aboutTitle", "关于页标题")}
                {renderInput("profile.aboutRole", "关于页身份")}
                {renderInput("profile.aboutLocation", "所在地")}
                {renderInput("profile.bioTitle", "个人简介标题")}
                {renderTextarea(
                  "profile.bioText",
                  "个人简介段落",
                  "每行一段。",
                  6,
                )}
                {renderInput("profile.experienceTitle", "经历标题")}
                {renderTextarea(
                  "profile.experienceJson",
                  "经历列表",
                  "JSON 数组，每项包含 role、company、period、description。",
                  10,
                )}
                {renderInput("profile.skillsTitle", "技能标题")}
                {renderTextarea("profile.languagesText", "语言", "每行一项。")}
                {renderTextarea("profile.frontendText", "前端", "每行一项。")}
                {renderTextarea("profile.backendText", "后端", "每行一项。")}
                {renderTextarea("profile.toolsText", "工具", "每行一项。")}
                {renderInput("profile.beyondCodeTitle", "兴趣标题")}
                {renderTextarea(
                  "profile.interestsJson",
                  "兴趣列表",
                  "JSON 数组，每项包含 title、description。",
                  8,
                )}
                {renderInput("profile.ctaTitle", "行动区标题")}
                {renderTextarea("profile.ctaDescription", "行动区描述")}
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>社交链接</CardTitle>
              <CardDescription>
                首页、页脚和行动区使用的公开外部链接。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {renderInput("social.githubUrl", "GitHub 链接", "url")}
                {renderInput("social.twitterUrl", "Twitter / X 链接", "url")}
                {renderInput("social.linkedinUrl", "LinkedIn 链接", "url")}
                {renderInput("social.juejinUrl", "掘金链接", "url")}
                {renderInput("social.bilibiliUrl", "B 站链接", "url")}
                {renderInput("social.sourceCodeUrl", "源码仓库链接", "url")}
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>备案信息</CardTitle>
              <CardDescription>
                页脚展示的 ICP 备案和公安备案信息。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {renderInput("compliance.icpNumber", "ICP备案号")}
                {renderInput("compliance.icpLink", "ICP备案链接", "url")}
                {renderInput("compliance.policeNumber", "公安备案号")}
                {renderInput("compliance.policeLink", "公安备案链接", "url")}
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardFooter className="justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || isSubmitting}
            onClick={() => data && reset(toFormValues(data))}
          >
            重置
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon data-icon="inline-start" />
            )}
            保存更改
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
