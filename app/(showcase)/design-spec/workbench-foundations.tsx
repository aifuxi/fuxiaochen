"use client";

import { BookOpen, Check, Copy, ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FoundationsProps = {
  sectionId: string;
  onNotice: (message: string) => void;
};

const paletteGroups = [
  {
    title: "表面",
    description: "用近黑灰阶区分页面、预览和操作区域。",
    colors: [
      { token: "background", label: "页面底色", usage: "工作台的连续背景" },
      { token: "surface", label: "内容表面", usage: "预览面板与内容分组" },
      { token: "stage", label: "效果舞台", usage: "需要独立背景的效果样本" },
      { token: "raised", label: "浮起表面", usage: "次级操作与浮层" },
      { token: "input", label: "输入底色", usage: "表单控件的默认表面" },
      { token: "input-hover", label: "输入悬停", usage: "输入控件的悬停表面" },
    ],
  },
  {
    title: "文字",
    description: "按阅读职责分层，字段标签和必要说明保持清晰。",
    colors: [
      { token: "foreground", label: "主要文字", usage: "标题、字段值与重要内容" },
      { token: "foreground-reading", label: "阅读文字", usage: "正文与连续说明" },
      { token: "muted", label: "辅助文字", usage: "说明与输入占位文字" },
      { token: "subtle", label: "弱化文字", usage: "仅用于近黑底色上的次要元数据" },
      { token: "primary-foreground", label: "主要操作文字", usage: "蓝色按钮内的白色文字" },
    ],
  },
  {
    title: "交互与状态",
    description: "主要操作、键盘焦点与结果反馈各自承担明确职责。",
    colors: [
      { token: "primary", label: "主要操作", usage: "主按钮与重点标识" },
      { token: "primary-hover", label: "主要操作悬停", usage: "主按钮悬停时提亮" },
      { token: "primary-pressed", label: "主要操作按下", usage: "主按钮按下时压暗" },
      { token: "focus", label: "键盘焦点", usage: "独立的 2px 焦点轮廓" },
      { token: "success", label: "成功状态", usage: "完成操作与成功反馈" },
      { token: "danger", label: "错误状态", usage: "错误信息与无效字段" },
    ],
  },
] as const;

function readColor(element: HTMLElement, token: string) {
  const value = getComputedStyle(element).getPropertyValue(`--color-${token}`).trim();
  return value.startsWith("#") ? value.toUpperCase() : value;
}

function ColorFoundations({ onNotice }: Pick<FoundationsProps, "onNotice">) {
  const paletteRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!paletteRef.current) return;
    const element = paletteRef.current;
    // 从试验区的实际作用域读取，避免色块、文案和复制值分别维护。
    setValues(
      Object.fromEntries(
        paletteGroups.flatMap(({ colors }) =>
          colors.map(({ token }) => [token, readColor(element, token)]),
        ),
      ),
    );
  }, []);

  async function copyColor(token: string, label: string) {
    if (!paletteRef.current) return;
    const value = readColor(paletteRef.current, token);
    if (!value) {
      onNotice("未读取到当前色值，请刷新页面后重试。");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      onNotice(`已复制${label} ${value}`);
    } catch {
      onNotice("复制失败，请选择色值手动复制。");
    }
  }

  return (
    <div ref={paletteRef} className="workbench-stack">
      <p className="workbench-note">色值来自当前试验区。点击复制按钮可获取正在使用的值。</p>
      {paletteGroups.map(({ title, description, colors }) => (
        <section key={title} className="space-y-4" aria-label={title}>
          <div>
            <h2 className="text-[18px] leading-[26px] font-semibold">{title}</h2>
            <p className="workbench-note mt-1">{description}</p>
          </div>
          <div className="workbench-palette">
            {colors.map(({ token, label, usage }) => (
              <div key={token} className="workbench-swatch">
                <div
                  className="workbench-swatch-color"
                  style={{ backgroundColor: `var(--color-${token})` }}
                  aria-hidden="true"
                />
                <div className="workbench-swatch-details">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm leading-5 font-medium">{label}</h3>
                      <p className="workbench-caption mt-1 font-mono break-all">{token}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="workbench-copy shrink-0"
                      aria-label={`复制 ${token} 色值`}
                      disabled={!values[token]}
                      onClick={() => void copyColor(token, label)}
                    >
                      <Copy size={16} aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="mt-3 font-mono text-xs leading-[18px] select-text">
                    {values[token] || "读取中…"}
                  </p>
                  <p className="workbench-caption mt-1">{usage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <section className="workbench-sample space-y-5" aria-labelledby="color-usage-title">
        <div>
          <h2 id="color-usage-title" className="text-[18px] leading-[26px] font-semibold">
            颜色表达信息
          </h2>
          <p className="workbench-note mt-1">状态同时使用文字或符号；分类始终保留名称和图例。</p>
        </div>
        <div className="workbench-grid">
          <div className="space-y-3">
            <h3 className="text-base leading-6 font-medium">重点与分类</h3>
            <div className="workbench-row">
              <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs leading-[18px] text-[var(--color-primary-foreground)]">
                精选
              </span>
              <span className="flex items-center gap-2 text-sm">
                <BookOpen size={16} className="text-[var(--color-focus)]" aria-hidden="true" />
                阅读入口
              </span>
            </div>
            <div className="workbench-row text-sm" aria-label="数据系列图例示例">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-focus)]" aria-hidden="true" />
                PV 浏览量
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-muted)]" aria-hidden="true" />
                UV 访客数
              </span>
            </div>
            <p className="workbench-caption">静态标识与图例样本，不附加操作状态。</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-base leading-6 font-medium">状态与焦点</h3>
            <div className="workbench-row text-sm" aria-label="状态文字样本">
              <span className="flex items-center gap-2 text-[var(--color-success)]">
                <Check size={16} aria-hidden="true" /> 成功状态
              </span>
              <span className="flex items-center gap-2 text-[var(--color-danger)]">
                <X size={16} aria-hidden="true" /> 错误状态
              </span>
            </div>
            <label htmlFor="color-focus-example" className="block text-sm leading-5 font-medium">
              独立键盘焦点
            </label>
            <Input
              id="color-focus-example"
              defaultValue="按 Tab 查看焦点轮廓"
              aria-describedby="color-focus-description"
              className="w-full"
            />
            <p id="color-focus-description" className="workbench-caption">
              可操作示例。焦点保留 2px 轮廓与 2px 外距，独立于选中和错误状态。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const typeSamples = [
  {
    name: "页面标题",
    spec: "24 / 32 · 600",
    text: "设计工作台 Design spec",
    className: "text-[24px] leading-[32px] font-semibold",
  },
  {
    name: "章节标题",
    spec: "18 / 26 · 600",
    text: "视觉基础 Foundations",
    className: "text-[18px] leading-[26px] font-semibold",
  },
  {
    name: "分组标题",
    spec: "16 / 24 · 500",
    text: "组件与状态 Components",
    className: "text-base leading-6 font-medium",
  },
  {
    name: "正文",
    spec: "14 / 22 · 400",
    text: "清晰的结构，让细节更动人。Design with clarity.",
    className: "text-sm leading-[22px] text-[var(--color-foreground-reading)]",
  },
  {
    name: "导航与标签",
    spec: "14 / 20 · 500",
    text: "联系邮箱 Email address",
    className: "text-sm leading-5 font-medium",
  },
  {
    name: "辅助说明",
    spec: "12 / 18 · 400",
    text: "用于说明字段、状态与参数。Optional information.",
    className: "text-xs leading-[18px] text-[var(--color-muted)]",
  },
  {
    name: "参数与代码",
    spec: "12 / 18 · 400",
    text: "--radius-form: 12px; 0123456789",
    className: "font-mono text-xs leading-[18px] text-[var(--color-muted)]",
  },
] as const;

function TypographyFoundations() {
  return (
    <div className="workbench-stack">
      <p className="workbench-note">
        英文使用 Inter，中文使用系统字体。工作台以 14px 正文为基础，用字号、字重与间距建立层级。
      </p>
      <section className="workbench-sample" aria-label="工作台排版阶梯">
        <div className="space-y-2">
          {typeSamples.map(({ name, spec, text, className }) => (
            <div
              key={name}
              className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6"
            >
              <div>
                <h2 className="text-sm leading-5 font-medium">{name}</h2>
                <p className="workbench-caption mt-1 font-mono">{spec}</p>
              </div>
              <p className={`${className} min-w-0 break-words`}>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="workbench-sample space-y-5" aria-labelledby="display-sample-title">
        <div>
          <h2 id="display-sample-title" className="text-[18px] leading-[26px] font-semibold">
            展示字号样本
          </h2>
          <p className="workbench-note mt-1">保留原有 display 尺度，供展示场景查看实际效果。</p>
        </div>
        <p className="text-[42px] leading-[45px] font-medium tracking-[-0.005em] max-sm:text-[30px] max-sm:leading-[34px]">
          清晰，自有力量。
          <br />
          Shape the feeling.
        </p>
        <p className="workbench-caption font-mono">桌面 42 / 45 · 窄屏 30 / 34 · 字重 500</p>
      </section>
      <p className="workbench-rule">
        标题保持简短，中文自然换行。必要说明不小于 12px；连续正文用阅读文字色，参数使用等宽字体。
      </p>
    </div>
  );
}

function SpacingFoundations() {
  return (
    <div className="workbench-stack">
      <section className="workbench-sample space-y-5" aria-labelledby="radius-title">
        <div>
          <h2 id="radius-title" className="text-[18px] leading-[26px] font-semibold">
            圆角分工
          </h2>
          <p className="workbench-note mt-1">
            同级控件保持一致，内嵌操作比外层小一档；开关、徽标与状态圆点保留自身形状。
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            [
              "8px",
              "内嵌操作与列表项",
              "--radius-sm",
              "输入框内的图标操作、选项、标签项、目录与折叠面板标题。",
            ],
            [
              "12px",
              "独立控件与组合外壳",
              "--radius-form",
              "按钮、输入、选择浮层与标签组外壳；外壳与 8px 选项之间保留 4px。",
            ],
            ["16px", "卡片与对话框", "--radius-lg", "样本、色板卡片、对话框与反馈浮层。"],
          ].map(([value, label, token, description]) => (
            <div key={token} className="space-y-3">
              <div
                className="flex h-24 items-center justify-center bg-[var(--color-raised)] font-mono text-sm"
                style={{ borderRadius: `var(${token})` }}
              >
                {value}
              </div>
              <p className="text-sm leading-5 font-medium">{label}</p>
              <p className="workbench-caption font-mono">{token}</p>
              <p className="workbench-caption">{description}</p>
            </div>
          ))}
        </div>
        <p className="workbench-caption">静态形状样本，按真实圆角显示。</p>
      </section>
      <section className="workbench-sample space-y-5" aria-labelledby="spacing-title">
        <div>
          <h2 id="spacing-title" className="text-[18px] leading-[26px] font-semibold">
            间距阶梯
          </h2>
          <p className="workbench-note mt-1">色块之间为实际间距，统一使用 4px 基础节奏。</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {[4, 8, 12, 16, 24, 32, 48].map((value) => (
            <div key={value} className="space-y-3">
              <div className="flex" style={{ gap: value }} aria-hidden="true">
                <span className="h-8 w-4 rounded-sm bg-[var(--color-muted)]" />
                <span className="h-8 w-4 rounded-sm bg-[var(--color-muted)]" />
              </div>
              <p className="font-mono text-xs leading-[18px]">{value}px</p>
            </div>
          ))}
        </div>
        <p className="workbench-rule">
          控件间 8–12px，样本间 16px，标题到样本 16–24px，章节间 32–48px。
        </p>
      </section>
      <section className="workbench-sample space-y-5" aria-labelledby="density-title">
        <div>
          <h2 id="density-title" className="text-[18px] leading-[26px] font-semibold">
            尺寸与密度
          </h2>
          <p className="workbench-note mt-1">桌面保持紧凑，触屏保留足够的点击面积。</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            [36, "桌面导航与工具栏"],
            [40, "桌面表单"],
            [44, "触屏操作目标"],
          ].map(([value, label]) => (
            <div key={value} className="space-y-3">
              <div className="flex h-11 items-center">
                <div
                  className="flex w-full items-center rounded-[var(--radius-form)] bg-[var(--color-input)] px-3 font-mono text-xs"
                  style={{ height: value }}
                >
                  {value}px
                </div>
              </div>
              <p className="text-sm leading-5 font-medium">{label}</p>
            </div>
          ))}
        </div>
        <p className="workbench-caption">
          静态尺寸样本。触屏中的图标按钮同时保证至少 44px 宽和 44px 高。
        </p>
      </section>
    </div>
  );
}

function Guidelines() {
  return (
    <div className="workbench-stack">
      <section className="workbench-sample space-y-4" aria-labelledby="preview-scope-title">
        <h2 id="preview-scope-title" className="text-[18px] leading-[26px] font-semibold">
          设计试验区
        </h2>
        <p className="workbench-note">
          这里用来查看和试用设计规则。当前视觉只作用于 design-spec
          页面及其弹窗、选择菜单，其他页面继续使用共享设计系统。
        </p>
        <p className="workbench-note">
          从左侧目录选择一个主题，先操作样本，再检查状态与使用规则。预览操作只提供本页反馈；切换主题后，组件回到初始状态。
        </p>
        <p className="workbench-rule">
          本页为开发环境预览。方案确认后，再按授权范围推广到实际页面。
        </p>
      </section>
      <section className="workbench-sample space-y-5" aria-labelledby="principles-title">
        <h2 id="principles-title" className="text-[18px] leading-[26px] font-semibold">
          使用原则
        </h2>
        <dl className="space-y-5">
          {[
            [
              "表面保持安静",
              "以灰阶表面、留白与字重建立层级。禁止常驻浅色描边和装饰分割线，也不使用内阴影或伪元素变相画线。",
            ],
            [
              "每次操作都有回应",
              "悬停提亮，按下压暗；键盘焦点始终清晰。错误同时提供文字和颜色，禁用状态不能继续触发操作。",
            ],
            [
              "动态服务于理解",
              "反馈保持短促，连续效果集中在效果舞台。允许暂停与重播，并尊重系统减少动态效果的偏好。",
            ],
            [
              "样本与功能各有语义",
              "静态样本明确标注状态和尺寸，可操作的控件保留真实标签、键盘行为与结果反馈。",
            ],
          ].map(([title, description]) => (
            <div key={title}>
              <dt className="text-base leading-6 font-medium">{title}</dt>
              <dd className="workbench-note mt-1">{description}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="workbench-sample space-y-5" aria-labelledby="sources-title">
        <h2 id="sources-title" className="text-[18px] leading-[26px] font-semibold">
          规范与组件来源
        </h2>
        <dl className="space-y-2">
          {[
            ["DESIGN.md", "共享设计目标与 token"],
            ["docs/design/frontend.md", "前台场景与试验区边界"],
            ["app/globals.css", "全站主题与共享默认样式"],
            ["components/ui/*", "本地组件与 Base UI 交互语义"],
            ["design-spec/preview.module.css", "当前试验区的局部视觉"],
          ].map(([path, role]) => (
            <div
              key={path}
              className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4"
            >
              <dt className="min-w-0 font-mono text-xs leading-[18px] break-words">{path}</dt>
              <dd className="workbench-note">{role}</dd>
            </div>
          ))}
        </dl>
        <p className="workbench-note">
          设计语言与效果实现参考{" "}
          <a
            href="https://libraries.dev/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-sm text-[var(--color-focus)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Libraries.dev <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only">（在新标签页打开）</span>
          </a>
          。Border beam 与 Thinking orb 沿用项目已安装的库组件。
        </p>
      </section>
    </div>
  );
}

export function WorkbenchFoundations({ sectionId, onNotice }: FoundationsProps) {
  switch (sectionId) {
    case "colors":
      return <ColorFoundations onNotice={onNotice} />;
    case "typography":
      return <TypographyFoundations />;
    case "spacing":
      return <SpacingFoundations />;
    case "guidelines":
      return <Guidelines />;
    default:
      return null;
  }
}
