"use client";

import { Check, Code2, Info, Save, Settings, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardStage } from "@/components/ui/card";
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
          width={72}
          height={72}
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

  return (
    <form className="admin-dashboard admin-settings" onSubmit={save} noValidate ref={formRef}>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">SYSTEM SETTINGS</p>
          <h1>系统设置</h1>
          <p>定制博客基础信息、博主档案资料、系统自动化运维策略与开发配置。</p>
        </div>
        <Button variant="primary" type="submit">
          <Save size={16} aria-hidden="true" />
          保存所有变更
        </Button>
      </div>
      <Card className="admin-settings-card">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(String(value))}>
          <div className="admin-settings-tab-scroll">
            <TabsList aria-label="设置分组">
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
          <TabsPanel value="profile">
            <div className="admin-settings-stack">
              <CardStage className="admin-settings-identity">
                <AvatarPreview key={previewUrl} url={previewUrl} />
                <div>
                  <h2>博主头像预览</h2>
                  <p>在下方输入头像图片外链 URL 进行更新</p>
                </div>
              </CardStage>
              <div className="admin-settings-fields">
                {profileFields.map(({ key, label }) => (
                  <div
                    className={`admin-settings-field ${key === "avatarUrl" ? "admin-settings-full" : ""}`}
                    key={key}
                  >
                    <label htmlFor={`settings-${key}`}>{label}</label>
                    <Input
                      id={`settings-${key}`}
                      value={draft[key]}
                      maxLength={key === "avatarUrl" ? 2048 : 120}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, [key]: event.target.value }))
                      }
                      aria-invalid={!!errors[key]}
                      aria-describedby={errors[key] ? `settings-${key}-error` : undefined}
                    />
                    {errors[key] && (
                      <p id={`settings-${key}-error`} className="admin-settings-error" role="alert">
                        {errors[key]}
                      </p>
                    )}
                  </div>
                ))}
                <div className="admin-settings-field admin-settings-full">
                  <label htmlFor="settings-about">个人简介 (关于我)</label>
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
          </TabsPanel>
          <TabsPanel value="system">
            <div className="admin-settings-stack">
              <CardStage className="admin-settings-toggle">
                <div>
                  <h2 id="settings-comments-label">允许读者发表评论</h2>
                  <p id="settings-comments-description">
                    开启后，读者可在前台博文底部留言，新评论进入待审核队列。
                  </p>
                </div>
                <Switch
                  aria-label="允许读者发表评论"
                  aria-labelledby="settings-comments-label"
                  aria-describedby="settings-comments-description"
                  checked={draft.enableComments}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({ ...current, enableComments: checked }))
                  }
                />
              </CardStage>
              <CardStage className="admin-settings-toggle">
                <div>
                  <h2 id="settings-backup-label">每日自动云端备份</h2>
                  <p id="settings-backup-description">
                    模拟凌晨自动归档文章、评论及配置的偏好；此演示不会执行备份。
                  </p>
                </div>
                <Switch
                  aria-label="每日自动云端备份"
                  aria-labelledby="settings-backup-label"
                  aria-describedby="settings-backup-description"
                  checked={draft.autoBackup}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({ ...current, autoBackup: checked }))
                  }
                />
              </CardStage>
              <div className="admin-settings-field admin-settings-quantity">
                <label htmlFor="settings-postsPerPage">每页文章展示数量</label>
                <Input
                  id="settings-postsPerPage"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  aria-invalid={!!errors.postsPerPage}
                  aria-describedby={errors.postsPerPage ? "settings-postsPerPage-error" : undefined}
                />
                {errors.postsPerPage && (
                  <p id="settings-postsPerPage-error" className="admin-settings-error" role="alert">
                    {errors.postsPerPage}
                  </p>
                )}
              </div>
            </div>
          </TabsPanel>
          <TabsPanel value="developer">
            <div className="admin-settings-stack">
              {showNotice && (
                <output className="admin-settings-notice">
                  <Info size={18} aria-hidden="true" />
                  <p>
                    安全提示：真实 API 密钥应仅在服务端使用。此处仅展示演示占位，不读取或暴露凭证。
                  </p>
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
              <section className="admin-settings-stack admin-settings-service">
                <h2>Gemini AI 大模型服务状态</h2>
                <CardStage className="admin-settings-status">
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
                </CardStage>
              </section>
              <section className="admin-settings-stack admin-settings-service">
                <h2>前端设计系统框架</h2>
                <CardStage className="admin-settings-status">
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
                </CardStage>
              </section>
            </div>
          </TabsPanel>
        </Tabs>
      </Card>
      <p className="admin-settings-footnote">
        演示设置仅保留在当前会话；刷新恢复初始数据，离开页面会丢弃未保存变更。
      </p>
    </form>
  );
}
