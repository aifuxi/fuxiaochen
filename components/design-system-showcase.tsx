"use client";

import NiceModal from "@ebay/nice-modal-react";
import {
  BookOpen,
  Box,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CircleDashed,
  Download,
  Edit3,
  FileText,
  Github,
  LayoutPanelLeft,
  MousePointer2,
  Palette,
  Plus,
  Search,
  Settings2,
  Sparkles,
  SquareStack,
  Table2,
  Trash2,
  Type,
  User,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BasicActionDialog, ProfileFormDialog } from "@/components/design-system-modals";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const sectionItems = [
  { id: "colors", icon: Palette, label: "色彩系统" },
  { id: "typography", icon: Type, label: "字体系统" },
  { id: "components", icon: Box, label: "组件库" },
  { id: "avatar", icon: User, label: "头像" },
  { id: "table", icon: Table2, label: "数据表格" },
  { id: "pagination", icon: FileText, label: "分页" },
  { id: "modal", icon: LayoutPanelLeft, label: "模态框" },
  { id: "animation", icon: Sparkles, label: "动画规范" },
  { id: "effects", icon: WandSparkles, label: "特效组件" },
] as const;

type ColorSwatch = {
  bordered?: boolean;
  darkText: boolean;
  name: string;
  swatch: string;
  value: string;
};

const heroButtons = [
  { icon: Download, label: "下载资源", variant: "primary" as const },
  { icon: BookOpen, label: "阅读文档", variant: "outline" as const },
];

const tabs = ["Overview", "Components", "Tokens", "Resources"] as const;

const colorGroups = [
  {
    title: "主色调 / Primary",
    items: [
      { name: "Background", value: "#050505", swatch: "#050505", darkText: false, bordered: true },
      { name: "Primary", value: "#10b981", swatch: "#10b981", darkText: true },
      { name: "Foreground", value: "#EBEBEB", swatch: "#ebebeb", darkText: true },
      { name: "Muted", value: "rgba(255,255,255,0.4)", swatch: "rgba(255,255,255,0.4)", darkText: true },
    ],
  },
  {
    title: "语义色 / Semantic",
    items: [
      { name: "Success", value: "#10b981", swatch: "#10b981", darkText: true },
      { name: "Warning", value: "#f59e0b", swatch: "#f59e0b", darkText: true },
      { name: "Destructive", value: "#ef4444", swatch: "#ef4444", darkText: false },
      { name: "Info", value: "#3b82f6", swatch: "#3b82f6", darkText: false },
    ],
  },
  {
    title: "中性色 / Neutral",
    items: [
      { name: "Card", value: "rgba(255,255,255,0.02)", swatch: "rgba(255,255,255,0.02)", darkText: false, bordered: true },
      { name: "Secondary", value: "rgba(255,255,255,0.08)", swatch: "rgba(255,255,255,0.08)", darkText: false },
      { name: "Border", value: "rgba(255,255,255,0.08)", swatch: "rgba(255,255,255,0.08)", darkText: false, bordered: true },
      { name: "Input", value: "rgba(255,255,255,0.15)", swatch: "rgba(255,255,255,0.15)", darkText: false },
    ],
  },
] satisfies ReadonlyArray<{
  items: ReadonlyArray<ColorSwatch>;
  title: string;
}>;

const typeScale = [
  { name: "Hero", sample: "Aa", className: "font-serif text-[clamp(4rem,10vw,6.25rem)] font-light leading-[0.9]" },
  { name: "H1", sample: "Aa", className: "font-serif text-[clamp(2.8rem,6vw,4rem)] font-bold leading-none" },
  { name: "H2", sample: "Aa", className: "font-serif text-[clamp(2.3rem,5vw,3rem)] font-semibold leading-none" },
  { name: "H3", sample: "Aa", className: "font-serif text-[24px] font-medium leading-tight" },
  { name: "Body Large", sample: "Aa", className: "text-lg font-light" },
  { name: "Body", sample: "Aa", className: "text-base" },
  { name: "Small", sample: "Aa", className: "text-sm" },
  { name: "Label", sample: "Aa", className: "font-mono text-[12px] uppercase tracking-[0.2em]" },
] as const;

const fontWeights = [
  { label: "Light 300", className: "font-light" },
  { label: "Regular 400", className: "font-normal" },
  { label: "Medium 500", className: "font-medium" },
  { label: "Semibold 600", className: "font-semibold" },
  { label: "Bold 700", className: "font-bold" },
] as const;

const listItems = [
  { icon: Palette, title: "色彩系统", description: "精心调配的深色系配色" },
  { icon: Type, title: "字体系统", description: "三种精心搭配的字体" },
  { icon: Box, title: "组件库", description: "可直接用于生产环境" },
] as const;

const tableRows = [
  { title: "设计系统的未来趋势", category: "Design", state: "已发布" },
  { title: "2026 年 Web 开发路线图", category: "Development", state: "草稿" },
  { title: "用户体验设计原则", category: "Design", state: "已发布" },
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-8">
      <div className="space-y-3">
        <h2 className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] font-semibold tracking-[-0.04em]">
          {title}
        </h2>
        <p className="max-w-3xl text-[15px] leading-7 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function DemoCard({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "shimmer" | "spotlight";
}) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        variant === "shimmer" &&
          `
            before:absolute before:inset-0
            before:bg-[linear-gradient(115deg,transparent_20%,rgb(255_255_255_/_0.12)_50%,transparent_80%)]
            before:opacity-0 before:transition before:duration-700 before:ease-[var(--ease-smooth)]
            hover:before:translate-x-full hover:before:opacity-100
          `,
        variant === "spotlight" &&
          `
            before:absolute before:top-1/2 before:-left-16 before:size-40 before:-translate-y-1/2 before:rounded-full
            before:bg-primary/10 before:opacity-0 before:blur-3xl before:transition before:duration-500
            hover:before:opacity-100
          `,
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </Card>
  );
}

function StatusBadge({ state }: { state: string }) {
  return state === "已发布" ? (
    <Badge variant="success">已发布</Badge>
  ) : (
    <Badge variant="warning">草稿</Badge>
  );
}

export function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const [activeSection, setActiveSection] = useState<string>("colors");

  const sectionIds = useMemo(() => sectionItems.map((item) => item.id), []);

  useEffect(() => {
    const observers = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    );

    observers.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sectionIds]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className={`
        pointer-events-none absolute inset-0
        bg-[radial-gradient(circle_at_top_left,rgb(16_185_129_/_0.14),transparent_24%),radial-gradient(circle_at_85%_12%,rgb(255_255_255_/_0.06),transparent_20%)]
      `} />
      <aside className={`
        fixed inset-y-0 left-0 z-20 hidden w-[270px] overflow-y-auto border-r border-border/80 bg-bg/85 px-6 py-8
        backdrop-blur-2xl
        lg:block
      `}>
        <div className="mb-12">
          <div className="mb-5 font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Design System
          </div>
          <div className="font-serif text-[34px] font-semibold tracking-[-0.04em]">
            Chen <span className="text-primary italic">Serif</span>
          </div>
        </div>

        <nav className="space-y-2">
          {sectionItems.map(({ icon: Icon, id, label }) => (
            <a
              key={id}
              className={cn(
                `
                  flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition-all
                  duration-[var(--duration-base)] ease-[var(--ease-smooth)]
                `,
                activeSection === id
                  ? "border-primary/25 bg-primary/12 text-primary shadow-[0_10px_28px_rgb(16_185_129_/_0.08)]"
                  : `
                    border-transparent text-fg
                    hover:border-border hover:bg-surface/80
                  `,
              )}
              href={`#${id}`}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-3 border-t border-border pt-6">
          <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
            Resources
          </div>
          <a
            className={`
              flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition-colors
              hover:bg-surface hover:text-fg
            `}
            href="#effects"
          >
            <FileText className="size-4" />
            设计文档
          </a>
          <a
            className={`
              flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition-colors
              hover:bg-surface hover:text-fg
            `}
            href="https://github.com/aifuxi/fuxiaochen"
            rel="noreferrer"
            target="_blank"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </div>
      </aside>

      <main className={`
        relative px-5 py-6
        sm:px-8
        lg:pr-10 lg:pl-[318px]
      `}>
        <div className="mx-auto max-w-7xl space-y-20">
          <header className={`
            sticky top-0 z-10 -mx-5 mb-6 flex items-center gap-3 overflow-x-auto border-b border-border/60 bg-bg/70 px-5
            py-4 backdrop-blur-xl
            sm:-mx-8 sm:px-8
            lg:hidden
          `}>
            {sectionItems.map(({ id, label }) => (
              <a
                key={id}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                  activeSection === id
                    ? "border-primary/30 bg-primary/12 text-primary"
                    : "border-border bg-surface/60 text-fg",
                )}
                href={`#${id}`}
              >
                {label}
              </a>
            ))}
          </header>

          <section className={`
            relative overflow-hidden rounded-[32px] border border-border/80
            bg-[linear-gradient(180deg,rgb(255_255_255_/_0.03),transparent)] px-6 py-12
            shadow-[0_30px_90px_rgb(0_0_0_/_0.34)]
            sm:px-10
            lg:px-14 lg:py-16
          `}>
            <div className="absolute top-8 -right-10 size-40 rounded-full bg-primary/12 blur-3xl" />
            <div className={`
              absolute bottom-0 left-0 h-px w-full
              bg-[linear-gradient(90deg,transparent,rgb(16_185_129_/_0.36),transparent)]
            `} />
            <div className="mx-auto max-w-4xl text-center">
              <div className={`
                mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2
                font-mono text-[11px] tracking-[0.24em] text-primary uppercase
              `}>
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                Design System v1.0
              </div>
              <h1 className="font-serif text-[clamp(4rem,10vw,7rem)] leading-[0.88] font-light tracking-[-0.06em]">
                Chen <span className="text-primary italic">Serif</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 font-light text-muted">
                一个精致的深色模式设计系统，将经典的 Newsreader 衬线字体与现代科技感完美融合。
                翡翠绿强调色、玻璃拟态层次与可复用组件共同构成优雅而专业的前端基线。
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {heroButtons.map(({ icon: Icon, label, variant }) => (
                  <Button key={label} size="lg" variant={variant}>
                    <Icon className="size-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <Section
            id="colors"
            title="色彩系统"
            description="经过精心调配的深色系配色方案，以翡翠绿为主强调色，营造专业而现代的视觉风格。"
          >
            <div className="space-y-8">
              {colorGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <h3 className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                    {group.title}
                  </h3>
                  <div className={`
                    grid gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                  `}>
                    {group.items.map((item) => (
                      <DemoCard key={item.name} variant="spotlight">
                        <div
                          className={cn(
                            `
                              flex h-36 flex-col justify-end rounded-lg p-4
                              shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)]
                            `,
                            "bordered" in item && item.bordered
                              ? "border border-white/10"
                              : "",
                          )}
                          style={{ background: item.swatch }}
                        >
                          <div className={cn("text-sm font-medium", item.darkText ? "text-black" : "text-fg")}>
                            {item.name}
                          </div>
                          <div
                            className={cn(
                              "mt-1 font-mono text-[11px] tracking-[0.18em] uppercase",
                              item.darkText ? "text-black/70" : "text-fg/70",
                            )}
                          >
                            {item.value}
                          </div>
                        </div>
                      </DemoCard>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-4">
                <h3 className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                  渐变色 / Gradient
                </h3>
                <div className={`
                  grid gap-4
                  md:grid-cols-3
                `}>
                  <Card className="h-32 bg-[linear-gradient(135deg,#10b981,#050505)]" />
                  <Card className="h-32 bg-[linear-gradient(135deg,rgb(16_185_129_/_0.28),#050505)]" />
                  <Card className="h-32 bg-[linear-gradient(90deg,#ebebeb,#10b981,#ebebeb)]" />
                </div>
              </div>
            </div>
          </Section>

          <Section
            id="typography"
            title="字体系统"
            description="三种精心搭配的字体：Newsreader 衬线用于标题，Space Grotesk 用于技术标签，Inter 用于正文。"
          >
            <div className="space-y-8">
              <div className={`
                grid gap-4
                lg:grid-cols-3
              `}>
                {[
                  {
                    label: "Headlines",
                    className: "font-serif text-[2rem]",
                    title: "Newsreader",
                    desc: "用于标题和强调文字",
                  },
                  {
                    label: "Technical",
                    className: "font-mono text-[2rem]",
                    title: "Space Grotesk",
                    desc: "用于技术标签和代码",
                  },
                  {
                    label: "Body",
                    className: "text-[2rem]",
                    title: "Inter",
                    desc: "用于正文内容",
                  },
                ].map((font) => (
                  <Card key={font.label}>
                    <CardHeader>
                      <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                        {font.label}
                      </div>
                      <CardTitle className={cn("font-normal", font.className)}>
                        {font.title}
                      </CardTitle>
                      <CardDescription>{font.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                    字号比例 / Type Scale
                  </div>
                </CardHeader>
                <CardContent className="space-y-0">
                  {typeScale.map((item, index) => (
                    <div
                      key={item.name}
                      className={cn(
                        "flex items-center justify-between gap-4 py-4",
                        index < typeScale.length - 1 ? "border-b border-border" : "",
                      )}
                    >
                      <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                        {item.name}
                      </span>
                      <span className={item.className}>{item.sample}</span>
                      <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                        {item.name === "Hero"
                          ? "100px / 200"
                          : item.name === "H1"
                            ? "64px / 700"
                            : item.name === "H2"
                              ? "48px / 600"
                              : item.name === "H3"
                                ? "24px / 500"
                                : item.name === "Body Large"
                                  ? "18px / 300"
                                  : item.name === "Body"
                                    ? "16px / 400"
                                    : item.name === "Small"
                                      ? "14px / 400"
                                      : "12px / 500"}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                    字重系列 / Font Weights
                  </div>
                </CardHeader>
                <CardContent className="space-y-0">
                  {fontWeights.map((weight, index) => (
                    <div
                      key={weight.label}
                      className={cn(
                        "flex items-center justify-between gap-4 py-4",
                        index < fontWeights.length - 1 ? "border-b border-border" : "",
                      )}
                    >
                      <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                        {weight.label}
                      </span>
                      <span className={cn("text-xl", weight.className)}>
                        The quick brown fox
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            id="components"
            title="组件库"
            description="精心设计的 UI 组件，每个都包含多种状态和变体，可直接用于生产环境。"
          >
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                    按钮 / Buttons
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="text-sm text-muted">变体 / Variants</div>
                    <div className="flex flex-wrap gap-3">
                      <Button>Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="text-sm text-muted">尺寸 / Sizes</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm">Small</Button>
                      <Button>Medium</Button>
                      <Button size="lg">Large</Button>
                      <Button size="icon">
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="text-sm text-muted">状态 / States</div>
                    <div className="flex flex-wrap gap-3">
                      <Button>Default</Button>
                      <Button disabled>Disabled</Button>
                      <Button loading>Loading</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                    输入框 / Inputs
                  </div>
                </CardHeader>
                <CardContent className={`
                  grid gap-6
                  lg:grid-cols-2
                `}>
                  <div className="space-y-2">
                    <label className="text-sm text-muted">Text Input</label>
                    <Input placeholder="Enter your name..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted">Search Input</label>
                    <div className="relative">
                      <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
                      <Input className="pl-10" placeholder="Search..." type="search" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted">Error State</label>
                    <Input defaultValue="Invalid input" hasError />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted">Disabled</label>
                    <Input disabled placeholder="Disabled" />
                  </div>
                </CardContent>
              </Card>

              <div className={`
                grid gap-8
                xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]
              `}>
                <Card>
                  <CardHeader>
                    <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                      徽章 / Badges
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="warning">Warning</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                      标签页 / Tabs
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="inline-flex rounded-full border border-border bg-surface/50 p-1">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          className={cn(
                            `
                              rounded-full px-4 py-2 text-sm transition-all duration-[var(--duration-base)]
                              ease-[var(--ease-smooth)]
                            `,
                            activeTab === tab
                              ? "bg-primary text-primary-fg shadow-[0_10px_24px_rgb(16_185_129_/_0.18)]"
                              : `
                                text-muted
                                hover:text-fg
                              `,
                          )}
                          onClick={() => setActiveTab(tab)}
                          type="button"
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-muted">
                      {activeTab === "Overview" && "Tab content area - select a tab to see the content change."}
                      {activeTab === "Components" && "通过 Button、Input、Dialog、Avatar 等基础件搭出完整页面。"}
                      {activeTab === "Tokens" && "颜色、字体、圆角、动效统一来自 Chen Serif token。"}
                      {activeTab === "Resources" && "设计规范、文档与源码资源在侧边栏统一收口。"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                  卡片 / Cards
                </h3>
                <div className={`
                  grid gap-4
                  lg:grid-cols-3
                `}>
                  <DemoCard variant="shimmer">
                    <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
                      Shimmer Card
                    </div>
                    <p className="mt-4 text-sm text-muted">悬停查看闪光边框效果</p>
                  </DemoCard>
                  <DemoCard variant="spotlight">
                    <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
                      Spotlight Card
                    </div>
                    <p className="mt-4 text-sm text-muted">悬停查看局部光晕聚焦效果</p>
                  </DemoCard>
                  <DemoCard>
                    <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
                      Glass Card
                    </div>
                    <p className="mt-4 text-sm text-muted">标准玻璃拟态卡片，可作为后台信息容器</p>
                  </DemoCard>
                </div>
              </div>

              <Card className="overflow-hidden p-0">
                <CardContent className="divide-y divide-border">
                  {listItems.map(({ description, icon: Icon, title }) => (
                    <div
                      key={title}
                      className={`
                        flex items-center gap-4 px-6 py-5 transition-colors
                        hover:bg-surface/60
                      `}
                    >
                      <div className={`
                        flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10
                        text-primary
                      `}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{title}</div>
                        <div className="text-sm text-muted">{description}</div>
                      </div>
                      <ChevronsRight className="size-4 text-muted" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            id="avatar"
            title="头像"
            description="多种尺寸的头像组件，支持文字头像和图片头像，以及头像环效果。"
          >
            <Card>
              <CardContent className="flex flex-wrap items-center gap-10">
                <div className="flex flex-col items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                    Small
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <Avatar size="md">
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                    Medium
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                    Large
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full border border-primary/30 p-1 shadow-[0_0_0_6px_rgb(16_185_129_/_0.08)]">
                    <Avatar size="md">
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                    With Ring
                  </span>
                </div>
              </CardContent>
            </Card>
          </Section>

          <Section
            id="table"
            title="数据表格"
            description="结构化的数据展示表格，包含状态显示和操作按钮。"
          >
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map((row) => (
                    <TableRow key={row.title}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>
                        <Badge variant={row.category === "Design" ? "primary" : "default"}>
                          {row.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge state={row.state} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost">
                            <Edit3 className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Section>

          <Section
            id="pagination"
            title="分页"
            description="用于长内容列表的分页导航组件，支持上一页、下一页和页码跳转。"
          >
            <Card className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                  基础分页
                </h3>
                <Pagination>
                  <PaginationContent className="flex-wrap">
                    <Button size="sm" variant="secondary">
                      <ChevronLeft className="size-4" />
                      上一页
                    </Button>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <PaginationItem key={page} active={page === 2}>
                        {page}
                      </PaginationItem>
                    ))}
                    <Button size="sm" variant="secondary">
                      下一页
                      <ChevronRight className="size-4" />
                    </Button>
                  </PaginationContent>
                </Pagination>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                  紧凑分页
                </h3>
                <Pagination>
                  <PaginationContent>
                    <Button disabled size="icon" variant="secondary">
                      <ChevronLeft className="size-4" />
                    </Button>
                    {[1, 2, 3].map((page) => (
                      <PaginationItem key={page} active={page === 1}>
                        {page}
                      </PaginationItem>
                    ))}
                    <span className="px-2 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                      ...
                    </span>
                    <PaginationItem>10</PaginationItem>
                    <Button size="icon" variant="secondary">
                      <ChevronRight className="size-4" />
                    </Button>
                  </PaginationContent>
                </Pagination>
              </div>
            </Card>
          </Section>

          <Section
            id="modal"
            title="模态框"
            description="集中的对话框组件，用于重要信息确认和表单输入，并通过 NiceModal 统一管理。"
          >
            <div className={`
              grid gap-4
              lg:grid-cols-2
            `}>
              <Card className="text-center">
                <CardContent className="space-y-4">
                  <Button onClick={() => NiceModal.show(BasicActionDialog)}>
                    <SquareStack className="size-4" />
                    基础模态框
                  </Button>
                  <p className="text-sm text-muted">标准确认对话框</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => NiceModal.show(ProfileFormDialog)}
                  >
                    <FileText className="size-4" />
                    表单模态框
                  </Button>
                  <p className="text-sm text-muted">包含表单输入与 Radix Select</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            id="animation"
            title="动画规范"
            description="统一的动画系统，使用 cubic-bezier(0.16, 1, 0.3, 1) 作为主缓动曲线，创造流畅自然的交互体验。"
          >
            <div className="space-y-8">
              <div className={`
                grid gap-4
                lg:grid-cols-2
              `}>
                <Card>
                  <CardContent className="space-y-2">
                    <div className="text-sm font-medium">Smooth (Primary)</div>
                    <code className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
                      cubic-bezier(0.16, 1, 0.3, 1)
                    </code>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2">
                    <div className="text-sm font-medium">Ease In Out</div>
                    <code className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                      cubic-bezier(0.4, 0, 0.2, 1)
                    </code>
                  </CardContent>
                </Card>
              </div>

              <div className={`
                grid gap-4
                md:grid-cols-2
                xl:grid-cols-5
              `}>
                {[
                  ["150ms", "Fast", "Micro-interactions"],
                  ["200ms", "Normal", "Standard transitions"],
                  ["300ms", "Slow", "Panel transitions"],
                  ["400ms", "Slower", "Page transitions"],
                  ["600ms", "Slowest", "Complex animations"],
                ].map(([time, name, desc]) => (
                  <Card key={time} className="text-center">
                    <CardContent className="space-y-2">
                      <div className="font-mono text-2xl text-primary">{time}</div>
                      <div className="text-[11px] tracking-[0.18em] text-muted uppercase">
                        {name}
                      </div>
                      <div className="text-[11px] tracking-[0.12em] text-muted/80 uppercase">
                        {desc}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className={`
                grid gap-4
                lg:grid-cols-4
              `}>
                {[
                  {
                    label: "Scale",
                    demo: (
                      <div className={`
                        size-16 rounded-2xl bg-primary transition-transform duration-200 ease-[var(--ease-smooth)]
                        hover:scale-110
                      `} />
                    ),
                  },
                  {
                    label: "Lift",
                    demo: (
                      <div className={`
                        size-16 rounded-2xl bg-surface transition-transform duration-200 ease-[var(--ease-smooth)]
                        hover:-translate-y-1
                      `} />
                    ),
                  },
                  {
                    label: "Fade",
                    demo: (
                      <div className={`
                        size-16 rounded-2xl bg-surface-h transition-opacity duration-200
                        hover:opacity-50
                      `} />
                    ),
                  },
                  {
                    label: "Shimmer",
                    demo: <div className="animate-shimmer-demo size-16 rounded-2xl" />,
                  },
                ].map((item) => (
                  <Card key={item.label} className="text-center">
                    <CardContent className="flex flex-col items-center gap-4">
                      {item.demo}
                      <div className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                        {item.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className={`
                  grid gap-6
                  lg:grid-cols-3
                `}>
                  <div className="text-center">
                    <div className={`
                      mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-surface transition-all
                      duration-200 ease-[var(--ease-smooth)]
                      hover:bg-primary hover:text-black
                    `}>
                      <Plus className="size-4" />
                    </div>
                    <div className="text-sm font-medium">Hover</div>
                    <div className="text-[11px] tracking-[0.18em] text-muted uppercase">
                      Scale + Color change
                    </div>
                  </div>
                  <div className="text-center">
                    <Button className={`
                      mb-4 w-full
                      active:scale-95
                    `}>Press Me</Button>
                    <div className="text-sm font-medium">Active</div>
                    <div className="text-[11px] tracking-[0.18em] text-muted uppercase">
                      Scale down to 0.95
                    </div>
                  </div>
                  <div className="text-center">
                    <Input className="mb-4 text-center" placeholder="Focus me" />
                    <div className="text-sm font-medium">Focus</div>
                    <div className="text-[11px] tracking-[0.18em] text-muted uppercase">
                      Ring glow effect
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            id="effects"
            title="特效组件"
            description="增强视觉体验的特殊效果，包括形态变化的 Blob 背景、渐变文字和滚动淡入。"
          >
            <div className="space-y-8">
              <Card className="relative min-h-[320px] overflow-hidden">
                <div className={`
                  animate-morph-a absolute top-[20%] left-[-5%] size-44 rounded-[44%_56%_52%_48%/48%_35%_65%_52%]
                  bg-primary/14 blur-2xl
                `} />
                <div className={`
                  animate-morph-b absolute top-[10%] right-[8%] size-56 rounded-[58%_42%_37%_63%/41%_60%_40%_59%]
                  bg-white/8 blur-3xl
                `} />
                <div className={`
                  animate-morph-c absolute bottom-[8%] left-[35%] size-48 rounded-[41%_59%_62%_38%/53%_35%_65%_47%]
                  bg-primary/10 blur-3xl
                `} />
                <div className="relative z-10 flex min-h-[272px] items-center justify-center text-center">
                  <p className="max-w-md text-sm text-muted">
                    动态 Blob 背景可用于 Hero、封面卡片或后台空状态，提供稳定但不喧宾夺主的空间氛围。
                  </p>
                </div>
              </Card>

              <Card className="text-center">
                <CardContent className="py-16">
                  <h2 className={`
                    animate-gradient-flow bg-[linear-gradient(90deg,#ebebeb,#10b981,#ebebeb)]
                    bg-[length:200%_100%]
                    bg-clip-text font-serif text-[clamp(2.5rem,5vw,4rem)] font-semibold tracking-[-0.04em]
                    text-transparent
                  `}>
                    Chen Serif Design
                  </h2>
                  <p className="mt-4 text-sm text-muted">流动的渐变文字效果</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden p-0">
                <CardContent className="divide-y divide-border p-0">
                  {[
                    {
                      icon: MousePointer2,
                      title: "滚动显示动画",
                      description: "元素进入视口时淡入上移",
                    },
                    {
                      icon: Zap,
                      title: "流畅自然",
                      description: "基于规范的缓动曲线",
                    },
                    {
                      icon: Settings2,
                      title: "可自定义",
                      description: "支持延迟和动画时长调整",
                    },
                  ].map(({ description, icon: Icon, title }, index) => (
                    <div
                      key={title}
                      className="animate-reveal-up flex items-center gap-4 px-6 py-5"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <div className={`
                        flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10
                        text-primary
                      `}>
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{title}</div>
                        <div className="text-sm text-muted">{description}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Section>

          <footer className="pt-6 pb-10">
            <div className="flex flex-col items-center gap-5 text-center">
              <div className={`
                relative flex size-14 items-center justify-center overflow-hidden rounded-[20px] border border-border
                bg-surface
              `}>
                <span className="relative z-10 font-serif text-2xl font-bold text-primary">
                  S
                </span>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(16_185_129_/_0.18),transparent)]" />
              </div>
              <div>
                <h4 className="font-serif text-3xl font-semibold tracking-[-0.04em]">
                  Chen Serif
                </h4>
                <p className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
                  Design System
                </p>
              </div>
              <div className="h-px w-24 bg-[linear-gradient(90deg,transparent,rgb(255_255_255_/_0.24),transparent)]" />
              <div className="space-y-2">
                <div className={`
                  flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted uppercase
                `}>
                  <span className="flex items-center gap-2">
                    <CircleDashed className="size-3 text-primary" />
                    Version 1.0.0
                  </span>
                  <span className="text-white/20">•</span>
                  <span>2026</span>
                </div>
                <p className="text-sm text-muted">Built with precision and care</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
