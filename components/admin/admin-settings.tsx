"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";

import { Check, Code2, Info, Save, Settings, UserRound, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useAdminWorkspace } from "./admin-context";
import { initialSettings } from "./settings-mock-data";
import "./admin-settings.css";

const profileFields = [
  { key: "title", label: "博客站点名称" },
  { key: "subtitle", label: "站点副标题 / Slogan" },
  { key: "authorName", label: "博主昵称 / 显示名" },
  { key: "authorRole", label: "身份头衔 / 标签" },
  { key: "avatarUrl", label: "头像图片链接 (URL)" },
] as const;
type FieldKey = (typeof profileFields)[number]["key"] | "postsPerPage";

function validAvatar(value: string) {
  if (!value || value === initialSettings.avatarUrl) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function AvatarPreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="admin-settings-avatar">
      {url && !failed ? (
        // 用户输入的外链直接预览，不经服务端图片优化代理。
        <Image
          width={56}
          height={56}
          unoptimized
          src={url}
          alt="博主头像预览"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <UserRound size={28} aria-label="默认头像" />
      )}
    </div>
  );
}

export function AdminSettings() {
  const { settings, setSettings, onMessage } = useAdminWorkspace();
  const [draft, setDraft] = useState(settings);
  const [quantity, setQuantity] = useState(String(settings.postsPerPage));
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [showNotice, setShowNotice] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const avatar = draft.avatarUrl.trim();
  const previewUrl = validAvatar(avatar) ? avatar : "";

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const count = Number(quantity);
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (!draft.title.trim()) nextErrors.title = "请输入博客站点名称";
    if (!draft.authorName.trim()) nextErrors.authorName = "请输入博主昵称";
    if (!validAvatar(avatar))
      nextErrors.avatarUrl = "请输入有效的 HTTP(S) 图片地址，或留空使用默认头像";
    if (!quantity.trim() || !Number.isInteger(count) || count < 1 || count > 100) {
      nextErrors.postsPerPage = "请输入 1–100 之间的整数";
    }
    setErrors(nextErrors);
    const firstError = ([...profileFields.map(({ key }) => key), "postsPerPage"] as const).find(
      (key) => nextErrors[key],
    );
    if (firstError) {
      setActiveTab(firstError === "postsPerPage" ? "system" : "profile");
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLInputElement>(`#settings-${firstError}`)?.focus();
      });
      return;
    }
    const cleanDraft = {
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      authorName: draft.authorName.trim(),
      authorRole: draft.authorRole.trim(),
      aboutMe: draft.aboutMe.trim(),
      avatarUrl: avatar,
      postsPerPage: count,
    };
    setSettings(cleanDraft);
    setDraft(cleanDraft);
    setQuantity(String(count));
    onMessage("所有设置已保存（当前会话模拟）；未修改前台或启动云端服务");
  };

  const renderProfileField = ({ key, label }: (typeof profileFields)[number]) => (
    <div className="admin-settings-field" key={key}>
      <label htmlFor={`settings-${key}`}>{label}</label>
      <div className="admin-settings-field-body">
        <Input
          id={`settings-${key}`}
          value={draft[key]}
          maxLength={key === "avatarUrl" ? 2048 : 120}
          onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
          aria-invalid={!!errors[key]}
          aria-describedby={
            errors[key]
              ? `settings-${key}-error`
              : key === "avatarUrl"
                ? "settings-avatarUrl-help"
                : undefined
          }
        />
        {errors[key] && (
          <p id={`settings-${key}-error`} className="admin-settings-error" role="alert">
            {errors[key]}
          </p>
        )}
        {key === "avatarUrl" && (
          <p id="settings-avatarUrl-help" className="admin-settings-help">
            允许留空或使用 HTTP(S) 图片地址；本地初始头像保留。
          </p>
        )}
      </div>
    </div>
  );

  return (
    <form className="admin-settings" onSubmit={save} noValidate ref={formRef}>
      <div className="admin-page-heading">
        <div>
          <h1>系统设置</h1>
          <p>管理站点信息、个人资料与系统偏好。</p>
        </div>
        <Button variant="primary" size="compact" type="submit">
          <Save size={16} aria-hidden="true" />
          保存所有变更
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(String(value))}>
        <div className="admin-settings-tab-scroll">
          <TabsList size="compact" aria-label="设置分组">
            <TabsTrigger value="profile">
              <UserRound size={16} aria-hidden="true" />
              个人资料与站点信息
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings size={16} aria-hidden="true" />
              系统偏好与自动化
            </TabsTrigger>
            <TabsTrigger value="developer">
              <Code2 size={16} aria-hidden="true" />
              高阶开发与 API 凭证
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsPanel value="profile" className="admin-settings-panel">
          <div className="admin-settings-stack">
            <section className="admin-settings-section" aria-labelledby="settings-site-heading">
              <div className="admin-settings-section-heading">
                <h2 id="settings-site-heading">站点信息</h2>
                <p>博客名称与简短介绍。</p>
              </div>
              <div className="admin-settings-fields">
                {profileFields.slice(0, 2).map(renderProfileField)}
              </div>
            </section>
            <section className="admin-settings-section" aria-labelledby="settings-profile-heading">
              <div className="admin-settings-section-heading">
                <h2 id="settings-profile-heading">个人资料</h2>
                <p>在博客中展示的身份与个人介绍。</p>
              </div>
              <div className="admin-settings-fields">
                <div className="admin-settings-field admin-settings-avatar-row">
                  <span className="admin-settings-field-label">博主头像预览</span>
                  <div className="admin-settings-identity">
                    <AvatarPreview key={previewUrl} url={previewUrl} />
                    <div>
                      <span>{draft.authorName}</span>
                      <p>在下方设置头像图片地址。</p>
                    </div>
                  </div>
                </div>
                {profileFields.slice(2).map(renderProfileField)}
                <div className="admin-settings-field">
                  <label htmlFor="settings-about">个人简介 (关于我)</label>
                  <div className="admin-settings-field-body admin-settings-field-wide">
                    <Textarea
                      id="settings-about"
                      rows={4}
                      value={draft.aboutMe}
                      maxLength={2000}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, aboutMe: event.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </TabsPanel>
        <TabsPanel value="system" className="admin-settings-panel">
          <div className="admin-settings-stack">
            <section className="admin-settings-section" aria-labelledby="settings-system-heading">
              <div className="admin-settings-section-heading">
                <h2 id="settings-system-heading">系统偏好与自动化</h2>
                <p>偏好保存在当前会话，本演示不会修改前台或执行备份。</p>
              </div>
              <div className="admin-settings-toggle-list">
                <div className="admin-settings-toggle">
                  <div>
                    <h3 id="settings-comments-label">允许读者发表评论</h3>
                    <p id="settings-comments-description">
                      开启后，读者可在前台博文底部留言，新评论进入待审核队列。
                    </p>
                  </div>
                  <Switch
                    touchTarget
                    aria-label="允许读者发表评论"
                    aria-labelledby="settings-comments-label"
                    aria-describedby="settings-comments-description"
                    checked={draft.enableComments}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({ ...current, enableComments: checked }))
                    }
                  />
                </div>
                <div className="admin-settings-toggle">
                  <div>
                    <h3 id="settings-backup-label">每日自动云端备份</h3>
                    <p id="settings-backup-description">
                      模拟凌晨自动归档文章、评论及配置的偏好；此演示不会执行备份。
                    </p>
                  </div>
                  <Switch
                    touchTarget
                    aria-label="每日自动云端备份"
                    aria-labelledby="settings-backup-label"
                    aria-describedby="settings-backup-description"
                    checked={draft.autoBackup}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({ ...current, autoBackup: checked }))
                    }
                  />
                </div>
              </div>
            </section>
            <section className="admin-settings-section" aria-labelledby="settings-reading-heading">
              <div className="admin-settings-section-heading">
                <h2 id="settings-reading-heading">阅读设置</h2>
                <p>首页列表每页展示的文章数量。</p>
              </div>
              <div className="admin-settings-field">
                <label htmlFor="settings-postsPerPage">每页文章展示数量</label>
                <div className="admin-settings-field-body">
                  <Input
                    id="settings-postsPerPage"
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    aria-invalid={!!errors.postsPerPage}
                    aria-describedby={
                      errors.postsPerPage ? "settings-postsPerPage-error" : undefined
                    }
                  />
                  {errors.postsPerPage && (
                    <p
                      id="settings-postsPerPage-error"
                      className="admin-settings-error"
                      role="alert"
                    >
                      {errors.postsPerPage}
                    </p>
                  )}
                  <p className="admin-settings-help">请输入 1–100 之间的整数。</p>
                </div>
              </div>
            </section>
          </div>
        </TabsPanel>
        <TabsPanel value="developer" className="admin-settings-panel">
          <div className="admin-settings-stack">
            {showNotice && (
              <output className="admin-settings-notice">
                <Info size={18} aria-hidden="true" />
                <span>
                  安全提示：真实 API 密钥应仅在服务端使用。此处仅展示演示占位，不读取或暴露凭证。
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  aria-label="关闭安全提示"
                  onClick={() => setShowNotice(false)}
                >
                  <X size={16} />
                </Button>
              </output>
            )}
            <section className="admin-settings-section" aria-labelledby="settings-ai-heading">
              <div className="admin-settings-section-heading">
                <h2 id="settings-ai-heading">Gemini AI 大模型服务状态</h2>
                <p>仅展示模拟摘要，不连接真实服务。</p>
              </div>
              <Card className="admin-settings-status">
                <div>
                  <span>SDK: @google/genai（演示）</span>
                  <span className="admin-settings-ready">
                    <Check size={16} aria-hidden="true" />
                    模拟就绪
                  </span>
                </div>
                <div>
                  <span>GEMINI_API_KEY</span>
                  <span>
                    •••••••••••••••• <small>（模拟占位）</small>
                  </span>
                </div>
              </Card>
            </section>
            <section className="admin-settings-section" aria-labelledby="settings-design-heading">
              <div className="admin-settings-section-heading">
                <h2 id="settings-design-heading">前端设计系统框架</h2>
                <p>当前项目使用的设计语言与字体体系。</p>
              </div>
              <Card className="admin-settings-status">
                <div>
                  <span>Design System: Fuxiaochen Afterglow</span>
                  <span className="admin-settings-ready">
                    <Check size={16} aria-hidden="true" />
                    @base-ui/react
                  </span>
                </div>
                <div>
                  <span>字体家族体系</span>
                  <span>Space Grotesk / Inter / ui-monospace</span>
                </div>
              </Card>
            </section>
          </div>
        </TabsPanel>
      </Tabs>
      <p className="admin-settings-footnote">
        演示设置仅保留在当前会话；刷新恢复初始数据，离开页面会丢弃未保存变更。
      </p>
    </form>
  );
}
