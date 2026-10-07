"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type SubmitEvent, type ReactNode } from "react";

import { ConfiguredImage, SocialIcon } from "@/components/frontend/configured-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  settingsSchema,
  socialIcons,
  type SiteSettings,
  type SocialAccount,
} from "@/lib/settings/schema";

import { useAdminWorkspace } from "./admin-context";
import { resourceRequest } from "./business-request";
import { BusinessStatus } from "./business-status";
import { useNavigationGuard } from "./navigation-guard";
import { AdminRequestError, usePostQuery } from "./use-posts";
import "./admin-settings.css";
import "./admin-business.css";

const request = resourceRequest("/api/admin/settings");
const load = request<SiteSettings>;
const groups = {
  profile: "资料与站点",
  seo: "SEO",
  system: "系统偏好",
  filing: "备案",
  social: "社交账号",
  analytics: "访问统计",
};
function fieldGroup(key: string) {
  if (
    [
      "seoDescription",
      "ogImageUrl",
      "googleVerification",
      "bingVerification",
      "baiduVerification",
    ].includes(key)
  )
    return "seo";
  if (key.startsWith("socials")) return "social";
  if (/^(icp|police)/.test(key)) return "filing";
  if (/^(localAnalytics|google|baidu)/.test(key)) return "analytics";
  if (["postsPerPage", "enableComments"].includes(key)) return "system";
  return "profile";
}
export function AdminSettings({
  initialGroup = "profile",
}: {
  initialGroup?: "profile" | "analytics";
}) {
  const query = usePostQuery("", 0, load);
  return (
    <>
      {query.loading || query.error ? (
        <BusinessStatus {...query} />
      ) : (
        query.data && (
          <SettingsForm
            key={`${query.data.updatedAt}:${initialGroup}`}
            initial={query.data}
            initialGroup={initialGroup}
          />
        )
      )}
    </>
  );
}
function SettingsForm({
  initial,
  initialGroup,
}: {
  initial: SiteSettings;
  initialGroup: "profile" | "analytics";
}) {
  const { onMessage } = useAdminWorkspace();
  const [draft, setDraft] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [quantity, setQuantity] = useState(String(initial.postsPerPage));
  const [tab, setTab] = useState<string>(initialGroup);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [pending, setPending] = useState(false);
  const [reloadOpen, setReloadOpen] = useState(false);
  useNavigationGuard(
    JSON.stringify(draft) !== JSON.stringify(baseline) ||
      quantity !== String(baseline.postsPerPage),
    pending,
  );
  const busy = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const errorFocus = useRef<string | null>(null);
  useEffect(() => {
    const key = errorFocus.current;
    if (!key || pending || fieldGroup(key) !== tab || !errors[key]) return;
    const target = document.getElementById(`settings-${key}`);
    target?.focus();
    errorFocus.current = null;
  }, [errors, tab, pending]);
  function focusError(next: Record<string, string[]>) {
    setErrors(next);
    const key = Object.keys(next)[0];
    if (!key) return;
    errorFocus.current = key;
    setTab(fieldGroup(key));
  }
  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || conflict) return;
    const { updatedAt: _updatedAt, localAnalyticsStartedAt: _startedAt, ...fields } = draft;
    const parsed = settingsSchema.safeParse({
      ...fields,
      postsPerPage: quantity.trim() ? Number(quantity) : NaN,
    });
    if (!parsed.success) {
      const next: Record<string, string[]> = {};
      for (const issue of parsed.error.issues)
        (next[issue.path.join(".")] ??= []).push(issue.message);
      focusError(next);
      return;
    }
    busy.current = true;
    setPending(true);
    setError("");
    setErrors({});
    try {
      const saved = await request<SiteSettings>("", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      setDraft(saved);
      setBaseline(saved);
      setQuantity(String(saved.postsPerPage));
      onMessage("设置已保存。");
    } catch (e) {
      setError(e instanceof Error ? e.message : "设置保存失败。");
      if (e instanceof AdminRequestError) {
        setConflict(e.code === "VERSION_CONFLICT");
        focusError(e.fieldErrors);
      }
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  async function reload() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      const saved = await load("");
      setDraft(saved);
      setBaseline(saved);
      setQuantity(String(saved.postsPerPage));
      setErrors({});
      setError("");
      setConflict(false);
      setReloadOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "重新载入失败，草稿已保留。");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const field = (key: string, label: string, control: ReactNode, help?: string) => (
    <div className="admin-settings-field" key={key}>
      <label htmlFor={`settings-${key}`}>{label}</label>
      <div className="admin-settings-field-body">
        {control}
        {help && <p className="admin-settings-help">{help}</p>}
        {errors[key] && (
          <p id={`settings-${key}-error`} className="admin-settings-error" role="alert">
            {errors[key][0]}
          </p>
        )}
      </div>
    </div>
  );
  const text = (
    key: keyof Pick<
      SiteSettings,
      | "title"
      | "subtitle"
      | "ogImageUrl"
      | "googleVerification"
      | "bingVerification"
      | "baiduVerification"
      | "authorName"
      | "authorRole"
      | "avatarUrl"
      | "icpText"
      | "icpUrl"
      | "policeText"
      | "policeUrl"
      | "googleId"
      | "baiduId"
    >,
    label: string,
    maxLength = 120,
    help?: string,
  ) =>
    field(
      key,
      label,
      <Input
        id={`settings-${key}`}
        value={draft[key]}
        maxLength={maxLength}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `settings-${key}-error` : undefined}
      />,
      help,
    );
  const toggle = (
    key: "enableComments" | "localAnalyticsEnabled" | "googleEnabled" | "baiduEnabled",
    label: string,
    help: string,
  ) => (
    <div className="admin-settings-toggle">
      <div>
        <h3 id={`settings-${key}-label`}>{label}</h3>
        <p>{help}</p>
      </div>
      <Switch
        id={`settings-${key}`}
        touchTarget
        checked={draft[key]}
        onCheckedChange={(v) => set(key, v)}
        disabled={pending}
        aria-labelledby={`settings-${key}-label`}
      />
    </div>
  );
  const updateSocial = (index: number, patch: Partial<SocialAccount>) =>
    set(
      "socials",
      draft.socials.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  function move(index: number, direction: number) {
    const next = [...draft.socials];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    set("socials", next);
    requestAnimationFrame(() =>
      form.current
        ?.querySelector<HTMLInputElement>(`[data-social-label="${draft.socials[index].id}"]`)
        ?.focus(),
    );
  }
  return (
    <form className="admin-settings" ref={form} onSubmit={save} noValidate>
      <div className="admin-page-heading">
        <div>
          <h1>系统设置</h1>
          <p>管理站点资料、SEO、备案、社交账号与访问统计。</p>
        </div>
        <Button variant="primary" size="compact" type="submit" disabled={pending || conflict}>
          <Save size={16} aria-hidden="true" />
          {pending ? "正在处理…" : "保存所有变更"}
        </Button>
      </div>
      {error && (
        <div role="alert" className="admin-business-feedback">
          <p className="admin-business-error">{error}</p>
          {error.includes("登录") && <Link href="/login">重新登录</Link>}
        </div>
      )}
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <div className="admin-settings-toolbar">
          <div className="admin-settings-tab-scroll">
            <TabsList size="compact" aria-label="设置分组">
              {Object.entries(groups).map(([key, label]) => (
                <TabsTrigger value={key} key={key}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button
            type="button"
            size="compact"
            variant="ghost"
            disabled={pending}
            onClick={() => setReloadOpen(true)}
          >
            重新载入已保存设置
          </Button>
        </div>
        <fieldset disabled={pending} className="admin-settings-fieldset">
          <TabsPanel value="profile" className="admin-settings-panel">
            <div className="admin-settings-stack">
              <section className="admin-settings-section">
                <div className="admin-settings-section-heading">
                  <h2>站点信息</h2>
                  <p>首页、导航与页脚使用这些资料。</p>
                </div>
                <div className="admin-settings-fields">
                  {text("title", "站点名称")}
                  {text("subtitle", "站点副标题")}
                </div>
              </section>
              <section className="admin-settings-section">
                <div className="admin-settings-section-heading">
                  <h2>个人资料</h2>
                </div>
                <div className="admin-settings-fields">
                  <div className="admin-settings-identity">
                    <ConfiguredImage src={draft.avatarUrl} size={56} profile />
                    <span>{draft.authorName}</span>
                  </div>
                  {text("authorName", "博主昵称")}
                  {text("authorRole", "身份头衔")}
                  {text(
                    "avatarUrl",
                    "头像图片链接",
                    2048,
                    "HTTPS 图片链接或站内绝对路径；留空使用默认图标。",
                  )}
                  {field(
                    "aboutMe",
                    "个人简介",
                    <Textarea
                      id="settings-aboutMe"
                      rows={4}
                      maxLength={2000}
                      value={draft.aboutMe}
                      onChange={(e) => set("aboutMe", e.target.value)}
                      aria-invalid={!!errors.aboutMe}
                      aria-describedby={errors.aboutMe ? "settings-aboutMe-error" : undefined}
                    />,
                  )}
                </div>
              </section>
            </div>
          </TabsPanel>
          <TabsPanel value="seo" className="admin-settings-panel">
            <div className="admin-settings-stack">
              <section className="admin-settings-section">
                <div className="admin-settings-section-heading">
                  <h2>搜索与分享</h2>
                  <p>设置站点的默认搜索描述与分享图片。</p>
                </div>
                <div className="admin-settings-fields">
                  {field(
                    "seoDescription",
                    "搜索描述",
                    <Textarea
                      id="settings-seoDescription"
                      rows={4}
                      maxLength={300}
                      value={draft.seoDescription}
                      onChange={(e) => set("seoDescription", e.target.value)}
                      aria-invalid={!!errors.seoDescription}
                      aria-describedby={
                        errors.seoDescription ? "settings-seoDescription-error" : undefined
                      }
                    />,
                    "最多 300 个字符；留空时使用站点副标题或个人简介。文章页优先使用文章摘要。",
                  )}
                  {text(
                    "ogImageUrl",
                    "默认分享图片",
                    2048,
                    "HTTPS 图片链接或站内绝对路径；留空时使用站点默认分享图。",
                  )}
                </div>
              </section>
              <section className="admin-settings-section">
                <div className="admin-settings-section-heading">
                  <h2>站长平台验证</h2>
                  <p>
                    填写验证标签 content
                    中的验证码，支持字母、数字、下划线和连字符；留空时不输出验证标签。
                  </p>
                </div>
                <div className="admin-settings-fields">
                  {text("googleVerification", "Google Search Console", 200)}
                  {text("bingVerification", "Bing Webmaster Tools", 200)}
                  {text("baiduVerification", "百度搜索资源平台", 200)}
                </div>
              </section>
            </div>
          </TabsPanel>
          <TabsPanel value="system" className="admin-settings-panel">
            <div className="admin-settings-stack">
              <section className="admin-settings-section">
                <div className="admin-settings-section-heading">
                  <h2>阅读与评论偏好</h2>
                  <p>控制前台文章分页与新评论；关闭评论后保留已通过的历史留言。</p>
                </div>
                {field(
                  "postsPerPage",
                  "每页文章数量",
                  <Input
                    id="settings-postsPerPage"
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    aria-invalid={!!errors.postsPerPage}
                    aria-describedby={
                      errors.postsPerPage ? "settings-postsPerPage-error" : undefined
                    }
                  />,
                  "1–100之间的整数。",
                )}
                {toggle("enableComments", "允许读者发表评论", "关闭后停止接收新评论和回复。")}
              </section>
            </div>
          </TabsPanel>
          <TabsPanel value="filing" className="admin-settings-panel">
            <section className="admin-settings-section">
              <div className="admin-settings-section-heading">
                <h2>备案信息（选填）</h2>
                <p>每项文案与链接一起填写或一起留空；留空不展示。</p>
              </div>
              <div className="admin-settings-fields">
                {text("icpText", "网站备案展示文案")}
                {text("icpUrl", "网站备案查询链接", 2048)}
                {text("policeText", "公安备案展示文案")}
                {text("policeUrl", "公安备案查询链接", 2048)}
              </div>
            </section>
          </TabsPanel>
          <TabsPanel value="social" className="admin-settings-panel">
            <section className="admin-settings-section">
              <div className="admin-settings-section-heading">
                <h2
                  id="settings-socials"
                  tabIndex={-1}
                  className="admin-settings-group-target"
                  aria-describedby={errors.socials ? "settings-socials-error" : undefined}
                >
                  社交账号
                </h2>
                <p>最多20条，支持同一平台多个账号。按列表顺序展示启用账号。</p>
              </div>
              {errors.socials && (
                <p id="settings-socials-error" className="admin-settings-error" role="alert">
                  {errors.socials[0]}
                </p>
              )}
              {draft.socials.map((social, index) => (
                <section
                  key={social.id}
                  className="admin-social-editor"
                  aria-label={`社交账号 ${index + 1}`}
                >
                  <div className="admin-social-actions">
                    <SocialIcon account={social} />
                    <span>账号 {index + 1}</span>
                    <Switch
                      checked={social.enabled}
                      disabled={pending}
                      onCheckedChange={(v) => updateSocial(index, { enabled: v })}
                      touchTarget
                      aria-label={`展示账号 ${index + 1}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      aria-label={`上移账号 ${index + 1}`}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === draft.socials.length - 1}
                      aria-label={`下移账号 ${index + 1}`}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown size={16} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`删除账号 ${index + 1}`}
                      onClick={() => {
                        set(
                          "socials",
                          draft.socials.filter((s) => s.id !== social.id),
                        );
                        requestAnimationFrame(() => {
                          const next = draft.socials[index + 1] ?? draft.socials[index - 1];
                          if (next)
                            form.current
                              ?.querySelector<HTMLInputElement>(`[data-social-label="${next.id}"]`)
                              ?.focus();
                          else addButton.current?.focus();
                        });
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="admin-settings-fields">
                    {field(
                      `socials.${index}.label`,
                      "展示文案",
                      <Input
                        id={`settings-socials.${index}.label`}
                        render={<input data-social-label={social.id} />}
                        value={social.label}
                        maxLength={80}
                        onChange={(e) => updateSocial(index, { label: e.target.value })}
                        aria-invalid={!!errors[`socials.${index}.label`]}
                        aria-describedby={
                          errors[`socials.${index}.label`]
                            ? `settings-socials.${index}.label-error`
                            : undefined
                        }
                      />,
                    )}
                    {field(
                      `socials.${index}.url`,
                      "账号链接",
                      <Input
                        id={`settings-socials.${index}.url`}
                        value={social.url}
                        maxLength={2048}
                        onChange={(e) => updateSocial(index, { url: e.target.value })}
                        aria-invalid={!!errors[`socials.${index}.url`]}
                        aria-describedby={
                          errors[`socials.${index}.url`]
                            ? `settings-socials.${index}.url-error`
                            : undefined
                        }
                      />,
                    )}
                    {field(
                      `socials.${index}.icon`,
                      "图标",
                      <Select
                        items={Object.entries(socialIcons).map(([value, label]) => ({
                          value,
                          label,
                        }))}
                        value={social.icon}
                        onValueChange={(v) => {
                          if (v) updateSocial(index, { icon: v });
                        }}
                        disabled={pending}
                      >
                        <SelectTrigger id={`settings-socials.${index}.icon`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(socialIcons).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>,
                    )}
                    {social.icon === "image" &&
                      field(
                        `socials.${index}.imageUrl`,
                        "图标图片链接",
                        <Input
                          id={`settings-socials.${index}.imageUrl`}
                          value={social.imageUrl}
                          maxLength={2048}
                          onChange={(e) => updateSocial(index, { imageUrl: e.target.value })}
                          aria-invalid={!!errors[`socials.${index}.imageUrl`]}
                          aria-describedby={
                            errors[`socials.${index}.imageUrl`]
                              ? `settings-socials.${index}.imageUrl-error`
                              : undefined
                          }
                        />,
                      )}
                  </div>
                </section>
              ))}
              <Button
                ref={addButton}
                type="button"
                size="sm"
                variant="secondary"
                disabled={draft.socials.length >= 20}
                onClick={() => {
                  set("socials", [
                    ...draft.socials,
                    {
                      id: crypto.randomUUID(),
                      label: "",
                      url: "",
                      icon: "globe",
                      imageUrl: "",
                      enabled: true,
                    },
                  ]);
                  requestAnimationFrame(() =>
                    document
                      .getElementById(`settings-socials.${draft.socials.length}.label`)
                      ?.focus(),
                  );
                }}
              >
                <Plus size={16} />
                新增账号
              </Button>
            </section>
          </TabsPanel>
          <TabsPanel value="analytics" className="admin-settings-panel">
            <div className="admin-settings-stack">
              <section className="admin-settings-section">
                <div className="admin-settings-section-heading">
                  <h2>本地访问统计</h2>
                  <p>查看站点的访问量、访客日志和文章表现。</p>
                </div>
                {toggle(
                  "localAnalyticsEnabled",
                  "启用本地统计",
                  "使用匿名标识和脱敏 IP，访问明细保留 180 天。",
                )}
                {draft.localAnalyticsStartedAt && (
                  <p className="admin-settings-help">
                    首次启用：
                    {new Date(draft.localAnalyticsStartedAt).toLocaleString("zh-CN", {
                      timeZone: "Asia/Shanghai",
                    })}
                  </p>
                )}
              </section>
              <section className="admin-settings-section">
                <div className="admin-settings-section-heading">
                  <h2>Google Analytics（GA4）</h2>
                  <p>请在 GA4 数据流设置中关闭基于浏览器历史记录的网页浏览，避免重复计数。</p>
                </div>
                {toggle(
                  "googleEnabled",
                  "启用 Google 统计",
                  "填写 Measurement ID，支持与百度统计同时开启。",
                )}
                {text("googleId", "Measurement ID", 32, "例如 G-XXXXXXXXXX；不接受脚本代码。")}
              </section>
              <section className="admin-settings-section">
                <div className="admin-settings-section-heading">
                  <h2>百度统计</h2>
                </div>
                {toggle("baiduEnabled", "启用百度统计", "填写统计代码 hm.js 后的32位站点 ID。")}
                {text("baiduId", "站点 ID", 32)}
              </section>
            </div>
          </TabsPanel>
        </fieldset>
      </Tabs>
      <p className="admin-settings-footnote">
        最近保存：{new Date(draft.updatedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
        。离开页面会丢弃未保存草稿。
      </p>
      <Dialog
        open={reloadOpen}
        onOpenChange={(v) => {
          if (!pending) setReloadOpen(v);
        }}
      >
        <DialogContent>
          <DialogTitle>重新载入设置</DialogTitle>
          <DialogDescription>将替换当前未保存草稿，请确认后继续。</DialogDescription>
          <div className="admin-business-actions">
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => setReloadOpen(false)}
            >
              保留草稿
            </Button>
            <Button type="button" disabled={pending} onClick={() => void reload()}>
              确认重新载入
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
